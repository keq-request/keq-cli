import * as fs from 'fs-extra'
import * as yaml from 'js-yaml'
import { request } from 'keq'
import { OpenAPIV3 } from 'openapi-types'
import * as path from 'path'
import * as validUrl from 'valid-url'
import { genCode } from './gen-code'
import { Options } from './interface/options'


export async function compile(moduleName: string, filepath: string, options: Options): Promise<void> {
  if (validUrl.isUri(filepath)) {
    let res: Response
    let content: string

    try {
      res = await request
        .get(filepath)
        .option('resolveWithFullResponse')
      content = await res.text()
    } catch (e: any) {
      if (e instanceof Error) {
        e.message = `Unable get the swagger file from ${filepath}. ${e.message}`
      }

      throw e
    }


    try {
      content = JSON.parse(content)
    } catch (e) {
      throw new Error(`The swagger file get from url isn't json: ${filepath}`)
    }

    await genCode(moduleName, content, options)
  } else {
    const fileExt = path.extname(filepath)
    const content = await fs.readFile(filepath, 'utf8')
    if (['.yml', '.yaml'].includes(fileExt)) {
      await genCode(moduleName, yaml.load(content) as OpenAPIV3.Document, options)
    } else if (fileExt === '.json') {
      await genCode(moduleName, JSON.parse(content), options)
    } else {
      throw new Error(`File ${fileExt} not support.`)
    }
  }
}
