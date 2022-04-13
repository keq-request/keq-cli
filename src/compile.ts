import * as fs from 'fs-extra'
import * as yaml from 'js-yaml'
import * as path from 'path'
import { Options } from './interface'
import * as validUrl from 'valid-url'
import { request } from 'keq'
import { gencode } from './gencode'


export async function compile(moduleName: string, filepath: string, options: Options): Promise<void> {
  if (validUrl.isUri(filepath)) {
    const res = await request
      .get(filepath)
      .option('resolveWithFullResponse')

    let content = await res.text()
    try {
      content = JSON.parse(content)
    } catch (e) {
      throw new Error(`The swagger file get from url isn't json: ${filepath}`)
    }

    await gencode(moduleName, content, options)
  } else {
    const fileext = path.extname(filepath)
    const content = await fs.readFile(filepath, 'utf8')
    if (['.yml', '.yaml'].includes(fileext)) {
      await gencode(moduleName, yaml.load(content), options)
    } else if (fileext === '.json') {
      await gencode(moduleName, JSON.parse(content), options)
    } else {
      throw new Error(`File ${fileext} not support.`)
    }
  }
}
