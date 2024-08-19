#!/usr/bin/env node
import * as R from 'ramda'
import * as fs from 'fs-extra'
import ora from 'ora'
import chalk from 'chalk'
import semver from 'semver'
import { Command, Option } from 'commander'
import { cosmiconfig } from 'cosmiconfig'
import { CosmiconfigResult } from 'cosmiconfig/dist/types'
import { build } from './build'
import { compile } from './compile'
import { BuildOptions } from './types/build-options.js'
import { Value } from '@sinclair/typebox/value'
import { RuntimeConfig } from './types/runtime-config'
import { OperationFilter } from './types/operation-filter'
import { cliPrompt } from './cli-prompt'
import { fetchModules } from './utils/fetch-openapi-file'
import { sharkingModules } from './utils/sharking-modules'
import { regenerateName } from './utils/regenerate-name'


if (semver.lt(process.version, '18.0.0')) {
  throw new Error('Node.js version must be greater than 18')
}

const program = new Command()
const explore = cosmiconfig('keq')


program
  .command('build [moduleName]')
  .option('-c --config <config>', 'The build config file')
  .option('-i --interactive', 'Interactive select the scope of generation')
  .addOption(
    new Option('--method <method>', 'Only generate files of the specified operation method')
      .choices(['get', 'post', 'put', 'delete', 'patch', 'head', 'option'])
  )
  .option('--pathname <pathname>', 'Only generate files of the specified operation pathname')
  .option('--no-append', 'Whether to generate files that not exist')
  .option('--no-update', 'Whether to generate files that exist')
  .option('--debug', 'Print debug information')
  .action(async (moduleName, options) => {
    let result: CosmiconfigResult
    if (options.config) {
      result = await explore.load(options.config)
    } else {
      result = await explore.search()
    }

    if (!result || ('isEmpty' in result && result.isEmpty)) {
      throw new Error('Cannot find config file.')
    }


    if (!Value.Check(RuntimeConfig, result.config)) {
      const errors = [...Value.Errors(RuntimeConfig, result.config)]
      const message = errors.map(({ path, message }) => `${path}: ${message}`).join('\n')
      throw new Error(chalk.red(`Invalid Config: ${message}`))
    }

    const rc = Value.Default(RuntimeConfig, result.config) as RuntimeConfig

    // Filter module
    if (moduleName) {
      if (!(moduleName in rc.modules)) {
        throw new Error(`Cannot find module ${moduleName} in config file.`)
      }

      for (const key of Object.keys(rc.modules)) {
        if (key !== moduleName) {
          console.log(chalk.yellow(`${key} module skipped.`))
        }
      }

      rc.modules = { [moduleName]: rc.modules[moduleName] }
    }

    const loadingModules = ora({
      text: 'loading modules',
      spinner: 'arc',
    }).start()
    let modules = await fetchModules(rc)
    modules = regenerateName(modules, rc)
    loadingModules.succeed()

    let filters: OperationFilter[] = [R.reject(R.isNil, <OperationFilter>{
      append: options.append,
      update: options.update,

      operationMethod: options.method,
      operationPathname: options.pathname,
    })]

    if (options.interactive) {
      filters = await cliPrompt(modules, filters[0])
    }

    const buildOptions: BuildOptions = {
      ...rc,
      modules: await sharkingModules(modules, filters, rc),
    }

    if (rc.debug) {
      await fs.writeJSON('.keq/build-options.json', buildOptions, { spaces: 2 })
    }

    await build(buildOptions)
  })

program
  .command('compile <filepath>')
  .description('Build the swagger file')
  .requiredOption('-o, --outdir <outdir>', 'The output directory')
  .requiredOption('-m --module-name <module_name>', 'The module name')
  .addOption(new Option('--file-naming-style <fileNamingStyle>').choices(['camelCase', 'capitalCase', 'constantCase', 'dotCase', 'headerCase', 'noCase', 'paramCase', 'pascalCase', 'pathCase', 'sentenceCase', 'snakeCase'])
    .default('snakeCase'))
  .option('--request <request>', 'The request package used in compiled result')
  .option('--no-strict', 'disable strict mode', true)
  .action(async (filepath, options) => {
    await compile({
      moduleName: options.moduleName,
      filepath,
      ...options,
    })
  })

async function main(): Promise<void> {
  program.on('command:*', function (operands) {
    throw new Error(`Unknown command '${String(operands[0])}'`)
  })

  try {
    await program.parseAsync(process.argv)
  } catch (e) {
    console.log('🚀 ~ main ~ e:', e)
    console.error(chalk.red(e instanceof Error ? e.message : String(e)))
  }
}

void main()
