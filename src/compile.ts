import * as fs from 'fs-extra'
import * as yaml from 'js-yaml'
import * as path from 'path'
import { genModuleCode } from './gencode'
import { Options } from './interface'


export async function compile(moduleName: string, filepath: string, options: Options): Promise<void> {
  const fileext = path.extname(filepath)
  const content = await fs.readFile(filepath, 'utf8')
  if (['.yml', '.yaml'].includes(fileext)) {
    await genModuleCode(moduleName, yaml.load(content), options)
  } else if (fileext === '.json') {
    await genModuleCode(moduleName, JSON.parse(content), options)
  } else {
    throw new Error(`File ${fileext} not support.`)
  }
}
