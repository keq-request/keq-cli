// import { select } from '@inquirer/prompts'
import * as R from 'ramda'
import { select } from 'inquirer-select-pro'
import { JSONPath } from 'jsonpath-plus'

import { OperationFilter } from './types/operation-filter'
import { RuntimeConfig } from './types/runtime-config'
import { fetchOpenapiFile } from './utils/fetch-openapi-file'
import { OpenAPIV3 } from 'openapi-types'
import { disinfect } from './utils/disinfect'
import chalk from 'chalk'


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

async function selectMethods(methodsInSwagger: string[], defaultValue?: string): Promise<string[]> {
  return await select({
    message: 'Select Method',
    defaultValue: defaultValue ? [defaultValue] : [],
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
      const q = input.trim().toLowerCase()

      return items.filter((method) => method.name.toLowerCase().includes(q))
    },
  })
}

export async function cliPrompt(rc: RuntimeConfig, filter: OperationFilter): Promise<OperationFilter[]> {
  const modules = filter.moduleName ? R.pick([filter.moduleName], rc.modules) : rc.modules

  console.log('loading prompts...')
  const pairs = await querySwagger(modules)

  const methodsInSwagger: string[] = R.uniq(JSONPath({
    path: '$..paths.*.*~',
    json: pairs.map(([, swagger]) => swagger),
  }))


  let operationMethods = await selectMethods(methodsInSwagger, filter.operationMethod)
  while (operationMethods.length === 0) {
    console.log(chalk.red('Please select at least one method'))
    operationMethods = await selectMethods(methodsInSwagger)
  }

  const pathnames: string[] = R.uniq(JSONPath({
    path: `$..paths.[${operationMethods.join(',')}]^~`,
    json: pairs.map(([, swagger]) => swagger),
  }))

  const operationPathnames = await select({
    message: 'Select Pathname',
    options: (input) => {
      const items = pathnames.map((pathname) => ({ name: pathname, value: pathname }))

      if (!input) return items
      const q = input.trim().toLowerCase()

      return items.filter((p) => p.name.toLowerCase().includes(q))
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
