import * as fs from 'fs-extra'
import * as yaml from 'js-yaml'
import { request } from 'keq'
import { OpenAPIV3 } from 'openapi-types'
import * as path from 'path'
import * as validUrl from 'valid-url'
import { genCode } from './gen-code'
import { Options } from './interface/options'
import swaggerConverter from 'swagger2openapi'


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


    let swagger
    try {
      swagger = JSON.parse(content)
    } catch (e) {
      throw new Error(`The swagger file get from url isn't json: ${filepath}`)
    }

    if (typeof swagger === 'object' && swagger['swagger'] === '2.0') {
      try {
        swagger = await new Promise<any>((resolve, reject) => {
          swaggerConverter.convertObj(
            swagger,
            { patch: true, warnOnly: true },
            (err, options) => {
              if (err) reject(err)
              else resolve(options.openapi)
            }
          )
        })
      } catch (err) {
        console.error(err)
        throw new Error(`The swagger file cannot be converted to OpenAPI 3.0: ${filepath}`)
      }
    }

    await genCode(moduleName, swagger, options)
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
