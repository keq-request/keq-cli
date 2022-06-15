import * as R from 'ramda'
import * as fs from 'fs-extra'
import * as path from 'path'
import * as changeCase from 'change-case'
import * as semver from 'semver'
import * as chalk from 'chalk'
import * as pMap from 'p-map'
import * as SwaggerParser from '@apidevtools/swagger-parser'
import Handlebars from './handlebars-helper'
import { Options } from './interface/options'
import { File } from './interface/file'
import { OpenAPIV3 } from 'openapi-types'
import { readTemplate } from './read-template'


const readAndCompileTemplate = (filename: string): HandlebarsTemplateDelegate => Handlebars.compile(readTemplate(filename))
const templates = {
  t_schema: readAndCompileTemplate('schema'),
  t_operation: readAndCompileTemplate('operation'),
}

function genOperationId(pathname: string, method: string): string {
  return `${method}_${pathname}`
    .replace('/', '_')
    .replace('-', '_')
    .replace(':', '$$')
    .replace(/{(.+)}/, '$$$1')
}


export async function compile(moduleName: string, json: string | OpenAPIV3.Document, options?: Partial<Options>): Promise<File[]> {
  const swaggerParser = new SwaggerParser()
  let api: OpenAPIV3.Document
  try {
    await swaggerParser.bundle(json)

    if (!('openapi' in swaggerParser.api && semver.satisfies(swaggerParser.api.openapi, '^3'))) throw new Error('Only supports OpenAPI3')
    api = swaggerParser.api as OpenAPIV3.Document
  } catch (e) {
    console.warn(chalk.yellow('Swagger file does not conform to the swagger@3.0 standard specifications or have grammatical errors, which may cause unexpected errors'))
    api = json as any
  }

  const fileNamingStyle = options?.fileNamingStyle || 'snakeCase'
  const formatFilename = changeCase[fileNamingStyle]
  const outdir = options?.outdir || `${process.cwd()}/api`
  const output = path.join(outdir, formatFilename(moduleName))

  const files: File[] = []
  if (api.components?.schemas) {
    for (const [name, schema] of R.toPairs(api.components.schemas)) {
      const fileContent = templates.t_schema({
        name,
        schema,
        options: {
          fileNamingStyle,
        },
      })
      const filename = formatFilename(name)
      const filepath = path.join(output, 'components', 'schemas', `${filename}.ts`)

      files.push({
        name: filename,
        path: filepath,
        content: fileContent,
      })
    }
  }

  if (api.paths) {
    for (const [pathname, p] of R.toPairs(api.paths)) {
      if (!p) continue

      for (const [method, operation] of R.toPairs(p)) {
        if (typeof operation === 'object' && !Array.isArray(operation)) {
          const operationId = operation.operationId || genOperationId(pathname, method)
          const fileContent = templates.t_operation({
            moduleName,
            pathname,
            method,
            operation: R.assoc('operationId', operationId, operation),
            options: {
              api,
              fileNamingStyle,
              request: options?.request || 'keq',
            },
          })

          const filename = formatFilename(`${String(method)}_${String(pathname)}`)
          const filepath = path.join(output, `${filename}.ts`)

          files.push({
            name: filename,
            path: filepath,
            content: fileContent,
          })
        } else {
          console.warn(chalk.yellow(`Operation ${String(method)} on path ${String(pathname)} cannot compiled, skipping`))
        }
      }
    }
  }

  return files
}

export async function genCode(moduleName: string, json: string | OpenAPIV3.Document, options: Options): Promise<void> {
  const files = await compile(moduleName, json, options)

  await pMap(
    files,
    async file => {
      await fs.ensureFile(file.path)
      await fs.writeFile(file.path, file.content)
    },
    { concurrency: 10 },
  )
}
