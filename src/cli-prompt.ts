// import { select } from '@inquirer/prompts'
import * as R from 'ramda'
import { select } from 'inquirer-select-pro'
import { JSONPath } from 'jsonpath-plus'

import { OperationFilter } from './types/operation-filter'
import chalk from 'chalk'
import { OpenAPIV3 } from 'openapi-types'


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

async function selectPathnames(pathnames: string[], defaultValue?: string): Promise<string[]> {
  return await select({
    message: 'Select Pathname',
    defaultValue: defaultValue ? [defaultValue] : [],
    options: (input) => {
      const items = pathnames.map((pathname) => ({ name: pathname, value: pathname }))

      if (!input) return items
      const q = input.trim().toLowerCase()

      return items.filter((p) => p.name.toLowerCase().includes(q))
    },
  })
}

export async function cliPrompt(modules: Record<string, OpenAPIV3.Document>, filter: OperationFilter): Promise<OperationFilter[]> {
  const methodsInSwagger: string[] = R.uniq(JSONPath({
    path: '$..paths.*.*~',
    json: Object.values(modules),
  }))


  let operationMethods = await selectMethods(methodsInSwagger, filter.operationMethod)
  while (operationMethods.length === 0) {
    console.log(chalk.red('Please select at least one method'))
    operationMethods = await selectMethods(methodsInSwagger)
  }

  const pathnames: string[] = R.uniq(JSONPath({
    path: `$..paths.[${operationMethods.join(',')}]^~`,
    json: Object.values(modules),
  }))

  let operationPathnames = await selectPathnames(pathnames, filter.operationPathname)
  while (operationPathnames.length === 0) {
    console.log(chalk.red('Please select at least one pathname'))
    operationPathnames = await selectPathnames(pathnames)
  }

  return R.xprod(operationMethods, operationPathnames)
    .map(([operationMethod, operationPathname]) => R.reject(R.isNil, {
      append: filter.append,
      update: filter.update,

      operationMethod,
      operationPathname,
    }))
}
