import * as R from 'ramda'
import { compile } from './compile'
import { Options, NamingStyle } from './interface/options'
import { genExportCode } from './gencode'


interface Config {
  outdir: string
  fileNamingStyle?: NamingStyle
  strict: boolean
  modules: {
    [moduleName: string]: string
  }
  url: {
    [env: string]: {
      [modelName: string]: string
    }
  }
}

export async function build(config: Config): Promise<void> {
  const promises = Object.keys(config.modules).map(async moduleName => {
    const services = config.url ? Object.keys(config.url).map(env => ({ env, url: config.url[env][moduleName] })) : []
    const options: Options = {
      outdir: config.outdir,
      strict: config.strict,
      fileNamingStyle: config.fileNamingStyle || 'snakeCase',
      services,
    }
    await compile(moduleName, config.modules[moduleName], options)
  })

  await Promise.all(promises)

  await genExportCode(Object.keys(config.modules), R.pick(['outdir', 'fileNamingStyle'], config))
}
