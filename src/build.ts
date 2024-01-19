import * as chalk from 'chalk'
import * as R from 'ramda'
import { compile } from './compile'
import { Exception } from './exception'
import { NamingStyle, Options } from './interface/options'


export interface BuildConfig {
  outdir: string
  fileNamingStyle?: NamingStyle
  strict: boolean
  request?: string
  envName?: string
  modules: {
    [moduleName: string]: string
  }
  env?: {
    [env: string]: {
      [modelName: string]: string
    }
  }
}

export async function build(config: BuildConfig): Promise<void> {
  const promises = Object.keys(config.modules).map(async moduleName => {
    try {
      let env: Record<string, string> = {}

      if (config.env) {
        const pairs = R.toPairs(config.env).map(([envName, envValue]): [string, string] => ([
          envName,
          envValue[moduleName],
        ]))

        env = R.fromPairs(pairs)
      }

      const options: Options = {
        outdir: config.outdir,
        strict: config.strict,
        envName: config.envName,
        request: config.request,
        fileNamingStyle: config.fileNamingStyle || 'snakeCase',
        env,
      }
      await compile(moduleName, config.modules[moduleName], options)
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
