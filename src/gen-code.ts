import * as SwaggerParser from '@apidevtools/swagger-parser'
import * as chalk from 'chalk'
import * as changeCase from 'change-case'
import * as fs from 'fs-extra'
import { OpenAPIV3 } from 'openapi-types'
import * as pMap from 'p-map'
import * as path from 'path'
import * as R from 'ramda'
import * as semver from 'semver'
import { File } from './interface/file'
import { Options } from './interface/options'
import { getSafeOperationName } from './utils/get-safe-operation-name'
import { readTemplate } from './utils/read-template'

// import Handlebars from './handlebars-helper.js'
import * as Handlebars from 'handlebars'
import './handlebar/register-helper.js'
import './handlebar/register-partial.js'

const readAndCompileTemplate = (filename: string): HandlebarsTemplateDelegate => Handlebars.compile(readTemplate(filename))
const templates = {
  t_schema: readAndCompileTemplate('schema'),
  t_schema_exports: readAndCompileTemplate('schema-exports'),
  t_operation: readAndCompileTemplate('operation'),
  t_operation_exports: readAndCompileTemplate('operation-exports'),
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
  const requestInstance = options?.request ? path.relative(output, options.request) : 'keq'

  const files: File[] = []
  if (api.components?.schemas && !R.isEmpty(api.components.schemas)) {
    for (const [name, schema] of R.toPairs(api.components.schemas)) {
      const fileContent = templates.t_schema({
        api,
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

    const schemaExportsFilepath = path.join(output, 'components', 'schemas', 'index.ts')
    const schemaExportsFileContent = templates.t_schema_exports({
      api,
      options: {
        fileNamingStyle,
      },
    })

    files.push({
      name: 'index.ts',
      path: schemaExportsFilepath,
      content: schemaExportsFileContent,
    })
  }

  if (api.paths && !R.isEmpty(api.paths)) {
    for (const [pathname, pathItem] of R.toPairs(api.paths)) {
      if (!pathItem) continue

      for (const [method, operation] of R.toPairs(pathItem)) {
        if (typeof operation === 'object' && !Array.isArray(operation)) {
          const fileContent = templates.t_operation({
            api,
            moduleName,
            pathname,
            method,
            operation,
            options: {
              fileNamingStyle,
              request: requestInstance,
            },
          })

          const filename = formatFilename(getSafeOperationName(pathname, method, operation))
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

    const operationExportsFilepath = path.join(output, 'index.ts')
    const operationExportsFileContent = templates.t_operation_exports({
      api,
      options: {
        fileNamingStyle,
      },
    })

    files.push({
      name: 'index.ts',
      path: operationExportsFilepath,
      content: operationExportsFileContent,
    })
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
