// import { select } from '@inquirer/prompts'
import * as R from 'ramda'
import { select } from 'inquirer-select-pro'
import { JSONPath } from 'jsonpath-plus'

import { OperationFilter } from './types/operation-filter'
import { RuntimeConfig } from './types/runtime-config'
import { fetchOpenapiFile } from './utils/fetch-openapi-file'
import { OpenAPIV3 } from 'openapi-types'
import { disinfect } from './utils/disinfect'


async function querySwagger(modules: RuntimeConfig['modules']): Promise<[string, OpenAPIV3.Document][]> {
  const results = await Promise.allSettled(Object.entries(modules).map(async ([moduleName, filepath]): Promise<[string, OpenAPIV3.Document]> => {
    const swagger = await fetchOpenapiFile(filepath)
    const swagger3 = await disinfect(swagger)

    return [moduleName, swagger3]
  }))

  return results
    .filter((result): result is PromiseFulfilledResult<[string, OpenAPIV3.Document]> => result.status === 'fulfilled')
    .map((result) => result.value)
}

export async function cliPrompt(rc: RuntimeConfig, filter: OperationFilter): Promise<OperationFilter[]> {
  const modules = filter.moduleName ? R.pick([filter.moduleName], rc.modules) : rc.modules

  console.log('loading prompts...')
  const pairs = await querySwagger(modules)

  const methodsInSwagger = R.uniq(JSONPath({
    path: '$..paths.*.*~',
    json: pairs.map(([, swagger]) => swagger),
  }))


  const operationMethods = await select({
    message: 'Select Method',
    defaultValue: [filter.operationMethod],
    options: (input) => {
      const items = [
        { name: 'Get', value: 'get' },
        { name: 'Post', value: 'post' },
        { name: 'Put', value: 'put' },
        { name: 'Delete', value: 'delete' },
        { name: 'Patch', value: 'patch' },
        { name: 'Head', value: 'head' },
        { name: 'Option', value: 'option' },
      ].filter((method) => methodsInSwagger.includes(method.value))

      if (!input) return items

      return items.filter((method) => method.name.toLowerCase().includes(input.toLowerCase()))
    },
  })

  const pathnames: string[] = R.uniq(JSONPath({
    path: `$..paths.[${operationMethods.join(',')}]^~`,
    json: pairs.map(([, swagger]) => swagger),
  }))

  const operationPathnames = await select({
    message: 'Select Pathname',
    options: (input) => {
      const items = pathnames.map((pathname) => ({ name: pathname, value: pathname }))

      if (!input) return items

      return items.filter((p) => p.name.toLowerCase().includes(input.toLowerCase()))
    },
  })

  return R.xprod(operationMethods, operationPathnames)
    .map(([operationMethod, operationPathname]) => R.reject(R.isNil, {
      moduleName: filter.moduleName,
      append: filter.append,
      update: filter.update,

      operationMethod,
      operationPathname,
    }))
}
