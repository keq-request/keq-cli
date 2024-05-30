import * as fs from 'fs-extra'
import * as yaml from 'js-yaml'
import chalk from 'chalk'
import { request } from 'keq'
import { OpenAPI, OpenAPIV2, OpenAPIV3 } from 'openapi-types'
import { fixSwagger } from 'swagger-fix'
import * as path from 'path'
import * as validUrl from 'valid-url'
import swaggerConverter from 'swagger2openapi'
import SwaggerParser from '@apidevtools/swagger-parser'
import * as semver from 'semver'

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


async function toSwagger3(swagger: OpenAPI.Document): Promise<OpenAPIV3.Document> {
  if (typeof swagger === 'object' && swagger['swagger'] === '2.0') {
    try {
      const result = await new Promise<any>((resolve, reject) => {
        swaggerConverter.convertObj(
          swagger as OpenAPIV2.Document,
          { patch: true, warnOnly: true },
          (err, options) => {
            if (err) reject(err)
            else resolve(options.openapi)
          }
        )
      })

      return result
    } catch (err) {
      console.error(err)
      throw new Error('The swagger file cannot be converted to OpenAPI 3.0')
    }
  }

  return swagger as OpenAPIV3.Document
}

async function validate(swagger: OpenAPIV3.Document): Promise<OpenAPIV3.Document> {
  const swaggerParser = new SwaggerParser()

  try {
    await swaggerParser.bundle(swagger)

    if (!('openapi' in swaggerParser.api && semver.satisfies(swaggerParser.api.openapi, '^3'))) throw new Error('Only supports OpenAPI3')
    return swaggerParser.api as OpenAPIV3.Document
  } catch (e) {
    console.warn(chalk.yellow('Swagger file does not conform to the swagger@3.0 standard specifications or have grammatical errors, which may cause unexpected errors'))
    return swagger
  }
}

export async function fetchOpenapiFile(filepath: string): Promise<OpenAPIV3.Document> {
  if (validUrl.isUri(filepath)) {
    return fetchFromUrl(filepath)
  }

  const fileExt = path.extname(filepath)
  const content = await fs.readFile(filepath, 'utf8')

  if (['.yml', '.yaml'].includes(fileExt)) {
    let swagger = yaml.load(content) as OpenAPIV3.Document
    swagger = fixSwagger(swagger)
    swagger = await toSwagger3(swagger)
    return validate(swagger)
  } else if (fileExt === '.json') {
    let swagger = JSON.parse(content)as OpenAPIV3.Document
    swagger = fixSwagger(swagger)
    swagger = await toSwagger3(swagger)
    return validate(swagger)
  }

  throw new Error(`File ${fileExt} not support.`)
}
