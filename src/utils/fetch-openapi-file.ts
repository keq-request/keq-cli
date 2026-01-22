import * as fs from 'fs-extra'
import * as yaml from 'js-yaml'
import { request } from 'keq'
import { OpenAPI, OpenAPIV3 } from 'openapi-types'
import * as path from 'path'
import * as validUrl from 'valid-url'
import chalk from 'chalk'
import { disinfect } from './disinfect.js'
import { Address, RuntimeConfig } from '~/types/runtime-config.js'

async function fetchFromUrl(address: Address): Promise<OpenAPIV3.Document> {
  let content: string
  try {
    const res = await request
      .get(address.url)
      .set(address.headers || {})
      .resolveWith('response')

    if (res.status >= 400) throw new Error(`Request failed with status code ${res.status}`)

    content = await res.text()
  } catch (e) {
    if (e instanceof Error) {
      e.message = `Unable get the swagger file from ${address.url}: ${e.message}`
    }

    throw e
  }


  try {
    return JSON.parse(content) as OpenAPIV3.Document
  } catch (e) {
    throw new Error(`The swagger file get from url isn't json: ${address.url}`)
  }
}


export async function fetchOpenapiFile(address: string | Address): Promise<OpenAPI.Document> {
  let swagger: OpenAPIV3.Document
  const url = typeof address === 'string' ? address : address.url

  if (validUrl.isUri(url)) {
    swagger = await fetchFromUrl(typeof address === 'string' ? { url } : address)
  } else {
    const fileExt = path.extname(url)
    const content = await fs.readFile(url, 'utf8')

    if (['.yml', '.yaml'].includes(fileExt)) {
      swagger = yaml.load(content) as OpenAPIV3.Document
    } else if (fileExt === '.json') {
      swagger = JSON.parse(content) as OpenAPIV3.Document
    } else {
      throw new Error(`File ${fileExt} not support.`)
    }
  }

  return swagger
}

export async function fetchModules(rc: RuntimeConfig): Promise<Record<string, OpenAPIV3.Document>> {
  const promises = Object.entries(rc.modules)
    .map(async ([moduleName, address]) => {
      const swagger = await fetchOpenapiFile(address)
      const swagger3 = await disinfect(moduleName, swagger)

      return [moduleName, swagger3] as const
    })


  const results = await Promise.allSettled(promises)


  const modulesMap: Record<string, OpenAPIV3.Document> = {}

  for (const result of results) {
    if (result.status === 'rejected') {
      console.log(chalk.red(String(result.reason.message)))
    } else {
      const [moduleName, swagger] = result.value
      modulesMap[moduleName] = swagger

      if (rc.debug) {
        await fs.writeJSON(`.keq/${moduleName}.swagger.json`, swagger, { spaces: 2 })
      }
    }
  }

  return modulesMap
}
