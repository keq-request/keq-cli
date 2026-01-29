import * as path from 'path'
import * as fs from 'fs-extra'
import * as changeCase from 'change-case'
import { BuildOptions } from './types/build-options.js'
import { CompileOpenapiOptions } from './types/compile-openapi-options.js'
import { FileNamingStyle } from './types/file-naming-style.js'
import { compile } from './compile-openapi.js'


/**
 * Get list of all files that will be generated
 */
export async function listGeneratedFiles(options: BuildOptions): Promise<string[]> {
  const allFiles: string[] = []

  for (const moduleName of Object.keys(options.modules)) {
    const compileOptions: CompileOpenapiOptions = {
      esm: options.esm,
      outdir: options.outdir,
      strict: options.strict,
      request: options.request,
      fileNamingStyle: options.fileNamingStyle || FileNamingStyle.snakeCase,
      moduleName,
      document: options.modules[moduleName],
    }

    // Get compile results without writing to disk
    const results = await compile(compileOptions)

    // Add all file paths
    for (const result of results) {
      allFiles.push(result.path)
    }

    // Add index files
    const fileNamingStyle: FileNamingStyle = options?.fileNamingStyle || FileNamingStyle.snakeCase
    const formatFilename = changeCase[fileNamingStyle]
    const outdir = options?.outdir || `${process.cwd()}/api`
    const output = path.join(outdir, formatFilename(moduleName))

    allFiles.push(path.join(output, 'index.ts'))
    allFiles.push(path.join(output, 'components', 'schemas', 'index.ts'))
  }

  return allFiles
}

/**
 * Get list of files in outdir that are not in the generated list
 */
export async function listInvalidFiles(options: BuildOptions): Promise<string[]> {
  const generatedFiles = await listGeneratedFiles(options)
  const generatedFileSet = new Set(generatedFiles)
  const invalidFiles: string[] = []

  const outdir = options.outdir || `${process.cwd()}/api`

  // Check if outdir exists
  if (!await fs.pathExists(outdir)) {
    return []
  }

  // Recursively get all files in outdir
  async function walkDir(dir: string): Promise<void> {
    const items = await fs.readdir(dir)

    for (const item of items) {
      const fullPath = path.join(dir, item)
      const stat = await fs.stat(fullPath)

      if (stat.isDirectory()) {
        await walkDir(fullPath)
      } else if (stat.isFile()) {
        // Check if this file is in the generated list
        if (!generatedFileSet.has(fullPath)) {
          invalidFiles.push(fullPath)
        }
      }
    }
  }

  await walkDir(outdir)

  return invalidFiles
}
