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
import { OperationFilter } from './types/operation-filter'
import { OperationContext } from './types/operation-context'
import { FileNamingStyle } from './types/file-naming-style'


const readAndCompileTemplate = (filename: string): ReturnType<typeof Handlebars.compile> => Handlebars.compile(readTemplate(filename))
const templates = {
  t_schema: readAndCompileTemplate('json-schema/file'),
  t_schema_exports: readAndCompileTemplate('json-schema/exports'),

  t_operation: readAndCompileTemplate('openapi-core/operation'),
  t_operation_exports: readAndCompileTemplate('openapi-core/operation-exports'),
  t_type: readAndCompileTemplate('openapi-core/type'),
}

async function ignoreOperation(filter: OperationFilter[], ctx: OperationContext, filepath: string): Promise<boolean> {
  const existed = await fs.exists(filepath)

  return filter.every((f) => {
    if (f.operationMethod && ctx.method !== f.operationMethod.toLowerCase().trim()) return true
    if (f.operationPathname && ctx.pathname !== f.operationPathname.trim()) return true
    if (!f.append && !existed) return true
    if (!f.update && existed) return true

    return false
  })
}


export async function compile(options: CompileOpenapiOptions): Promise<CompileResult[]> {
  const esm = !!options.esm
  const moduleName = options.moduleName
  const document = options.document
  const fileNamingStyle: FileNamingStyle = options?.fileNamingStyle || FileNamingStyle.snakeCase
  const formatFilename = changeCase[fileNamingStyle]
  const outdir = options?.outdir || `${process.cwd()}/api`
  const output = path.join(outdir, formatFilename(moduleName))
  const keq = options?.request ? path.relative(output, options.request) : 'keq'

  const ignoredOperations: string[] = []
  const results: CompileResult[] = []
  if (document.components?.schemas && !R.isEmpty(document.components.schemas)) {
    for (const [name, jsonSchema] of R.toPairs(document.components.schemas)) {
      const context = {
        name,

        jsonSchema,
        document,

        esm,
        fileNamingStyle,
        keq,
      }

      const fileContent = templates.t_schema(context)
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
      jsonSchemas: document.components.schemas,
      fileNamingStyle,
      esm,
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

      for (const [m, operation] of Object.entries(pathItem)) {
        const method = m.toLowerCase()
        if (!['get', 'post', 'put', 'delete', 'patch', 'head'].includes(method)) {
          console.warn(chalk.yellow(`Method ${String(method).toUpperCase()} on path ${String(pathname)} cannot compiled, skipping`))
          continue
        }

        if (typeof operation === 'object' && !Array.isArray(operation)) {
          const context = {
            pathname,
            method,
            operation,

            document,
            moduleName,

            fileNamingStyle,
            esm,
            keq,
          }

          if (options.operationId) {
            context.operation.operationId = options.operationId(context)
          }

          const filename = formatFilename(getSafeOperationName(pathname, method, operation))
          const operationFilepath = path.join(output, `${filename}.ts`)
          const operationTypeFilepath = path.join(output, 'types', `${filename}.ts`)

          if (await ignoreOperation(options.filter, context, operationFilepath)) {
            ignoredOperations.push(filename)
            continue
          }

          const operationFileContent = templates.t_operation({ ...context })
          const operationTypeFileContent = templates.t_type({ ...context })


          // operation type file
          results.push({
            name: filename,
            path: operationTypeFilepath,
            content: operationTypeFileContent,
          })

          // operation file
          results.push({
            name: filename,
            path: operationFilepath,
            content: operationFileContent,
          })
        } else {
          console.warn(chalk.yellow(`Operation ${String(method)} on path ${String(pathname)} cannot compiled, skipping`))
        }
      }
    }

    const operationExportsFilepath = path.join(output, 'index.ts')
    const operationExportsFileContent = templates.t_operation_exports({
      document,

      fileNamingStyle,
      keq,
      esm,
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
