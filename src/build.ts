import { compile } from './compile'
import { Options, NamingStyle } from './interface/options'
import { genExportCode } from './gencode'


interface Config {
  outdir: string
  fileNamingStyle?: NamingStyle
  strict?: boolean
  plugins?: string[]
  modules: {
    [moduleName: string]: string
  }
  url?: {
    [env: string]: {
      [modelName: string]: string
    }
  }
}

export async function build(config: Config): Promise<void> {
  const promises = Object.keys(config.modules).map(async moduleName => {
    let services: Options['services'] = []
    if (config.url) {
      services = Object.keys(config.url)
        .map(env => ({
          env,
          url: config.url ? config.url[env][moduleName] : '',
        }))
    }

    const options: Options = {
      outdir: config.outdir,
      strict: config.strict || true,
      fileNamingStyle: config.fileNamingStyle || 'snakeCase',
      plugins: config.plugins || [],
      services,
    }
    await compile(moduleName, config.modules[moduleName], options)
  })

  await Promise.all(promises)

  await genExportCode(Object.keys(config.modules), { outdir: config.outdir })
}
