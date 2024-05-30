import chalk from 'chalk'
import * as changeCase from 'change-case'
import * as fs from 'fs-extra'
import pMap from 'p-map'
import * as path from 'path'
import * as R from 'ramda'
import { getSafeOperationName } from './utils/get-safe-operation-name'
import { readTemplate } from './utils/read-template'

import Handlebars from 'handlebars'
import './handlebar/register-helper.js'
import './handlebar/register-partial.js'
import { CompileResult } from './types/compile-result.js'
import { CompileOpenapiOptions } from './types/compile-openapi-options.js'


const readAndCompileTemplate = (filename: string): ReturnType<typeof Handlebars.compile> => Handlebars.compile(readTemplate(filename))
const templates = {
  t_schema: readAndCompileTemplate('schema'),
  t_schema_exports: readAndCompileTemplate('schema-exports'),
  t_operation: readAndCompileTemplate('operation'),
  t_operation_exports: readAndCompileTemplate('operation-exports'),
}


export async function compile(options: CompileOpenapiOptions): Promise<CompileResult[]> {
  const { moduleName, document } = options

  const fileNamingStyle = options?.fileNamingStyle || 'snakeCase'
  const formatFilename = changeCase[fileNamingStyle]
  const outdir = options?.outdir || `${process.cwd()}/api`
  const output = path.join(outdir, formatFilename(moduleName))
  const requestInstance = options?.request ? path.relative(output, options.request) : 'keq'

  const results: CompileResult[] = []
  if (document.components?.schemas && !R.isEmpty(document.components.schemas)) {
    for (const [name, schema] of R.toPairs(document.components.schemas)) {
      const fileContent = templates.t_schema({
        api: document,
        name,
        schema,
        options: {
          fileNamingStyle,
        },
      })
      const filename = formatFilename(name)
      const filepath = path.join(output, 'components', 'schemas', `${filename}.ts`)

      results.push({
        name: filename,
        path: filepath,
        content: fileContent,
      })
    }

    const schemaExportsFilepath = path.join(output, 'components', 'schemas', 'index.ts')
    const schemaExportsFileContent = templates.t_schema_exports({
      api: document,
      options: {
        fileNamingStyle,
      },
    })

    results.push({
      name: 'index.ts',
      path: schemaExportsFilepath,
      content: schemaExportsFileContent,
    })
  }

  if (document.paths && !R.isEmpty(document.paths)) {
    for (const [pathname, pathItem] of Object.entries(document.paths)) {
      if (!pathItem) continue

      for (const [method, operation] of Object.entries(pathItem)) {
        if (typeof operation === 'object' && !Array.isArray(operation)) {
          let operationId = operation.operationId

          if (options.operationId) {
            operationId = options.operationId({
              pathname,
              method,
              operation,

              document,
              moduleName,
              fileNamingStyle,

            })
          }

          const fileContent = templates.t_operation({
            api: document,
            moduleName,
            pathname,
            method,
            operation: { ...operation, operationId },
            options: {
              fileNamingStyle,
              request: requestInstance,
            },
          })

          const filename = formatFilename(getSafeOperationName(pathname, method, { ...operation, operationId }))
          const filepath = path.join(output, `${filename}.ts`)

          results.push({
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
      api: document,
      options: {
        fileNamingStyle,
      },
    })

    results.push({
      name: 'index.ts',
      path: operationExportsFilepath,
      content: operationExportsFileContent,
    })
  }

  return results
}

export async function CompileOpenapi(option: CompileOpenapiOptions): Promise<void> {
  const results = await compile(option)

  await pMap(
    results,
    async (result) => {
      await fs.ensureFile(result.path)
      await fs.writeFile(result.path, result.content)
    },
    { concurrency: 10 },
  )
}
