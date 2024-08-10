import * as fs from 'fs-extra'
import * as yaml from 'js-yaml'
import { request } from 'keq'
import { OpenAPI, OpenAPIV3 } from 'openapi-types'
import * as path from 'path'
import * as validUrl from 'valid-url'

async function fetchFromUrl(url: string): Promise<OpenAPIV3.Document> {
  let content: string
  try {
    content = await request
      .get(url)
      .resolveWith('text')
  } catch (e: any) {
    if (e instanceof Error) {
      e.message = `Unable get the swagger file from ${url}. ${e.message}`
    }

    throw e
  }


  try {
    return JSON.parse(content) as OpenAPIV3.Document
  } catch (e) {
    throw new Error(`The swagger file get from url isn't json: ${url}`)
  }
}


export async function fetchOpenapiFile(filepath: string): Promise<OpenAPI.Document> {
  let swagger: OpenAPIV3.Document
  if (validUrl.isUri(filepath)) {
    swagger = await fetchFromUrl(filepath)
  } else {
    const fileExt = path.extname(filepath)
    const content = await fs.readFile(filepath, 'utf8')

    if (['.yml', '.yaml'].includes(fileExt)) {
      swagger = yaml.load(content) as OpenAPIV3.Document
    } else if (fileExt === '.json') {
      swagger = JSON.parse(content)as OpenAPIV3.Document
    } else {
      throw new Error(`File ${fileExt} not support.`)
    }
  }

  return swagger
}
