import * as R from 'ramda'
import { compile } from './compile'
import { Options, NamingStyle } from './interface/options'


interface Config {
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

export async function build(config: Config): Promise<void> {
  const promises = Object.keys(config.modules).map(async moduleName => {
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
      request: config.request || 'keq',
      fileNamingStyle: config.fileNamingStyle || 'snakeCase',
      env,
    }
    await compile(moduleName, config.modules[moduleName], options)
  })

  await Promise.all(promises)
}
