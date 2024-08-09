import chalk from 'chalk'
import { compile } from './compile'
import { Exception } from './exception'
import { BuildOptions } from './types/build-options.js'
import { CompileOptions } from './types/compile-options.js'
import { FileNamingStyle } from './types/file-naming-style.js'


export async function build(options: BuildOptions): Promise<void> {
  const promises = Object.keys(options.modules)
    .filter((moduleName) => {
      if (options.filter.moduleName && options.filter.moduleName !== moduleName) {
        console.log(chalk.yellow(`${moduleName} module skipped.`))
        return false
      }

      return true
    })
    .map(async (moduleName): Promise<string> => {
      try {
        const compileOptions: CompileOptions = {
          esm: options.esm,
          outdir: options.outdir,
          strict: options.strict,
          request: options.request,
          fileNamingStyle: options.fileNamingStyle || FileNamingStyle.snakeCase,
          operationId: options.operationId,
          filter: options.filter,

          moduleName,
          filepath: options.modules[moduleName],
        }

        await compile(compileOptions)
        return moduleName
      } catch (e) {
        if (e instanceof Exception) {
          throw e
        } else if (e instanceof Error) {
          console.log(e)
          throw new Exception(moduleName, e.message)
        } else if (typeof e === 'string') {
          throw new Exception(moduleName, e)
        } else {
          throw e
        }
      }
    })

  const results = await Promise.allSettled(promises)

  for (const result of results) {
    if (result.status === 'rejected') {
      console.log(chalk.red(String(result.reason.message)))
    } else {
      console.log(chalk.green(`${result.value} module compiled successfully.`))
    }
  }
}
