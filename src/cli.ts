#!/usr/bin/env node
import * as R from 'ramda'
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


if (semver.lt(process.version, '18.0.0')) {
  throw new Error('Node.js version must be greater than 18')
}

const program = new Command()
const explore = cosmiconfig('keq')


program
  .command('build [moduleName]')
  .option('-c --config <config>', 'The build config file')
  .option('--method <method>', 'Only generate files of the specified operation method')
  .option('--pathname <pathname>', 'Only generate files of the specified operation pathname')
  .option('--no-append', 'Whether to generate files that not exist')
  .option('--no-update', 'Whether to generate files that exist')
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

    const rc = result.config as RuntimeConfig
    if (moduleName && !(moduleName in rc.modules)) {
      throw new Error(`Cannot find module ${moduleName} in config file.`)
    }

    const filter: OperationFilter = R.reject(R.isNil, <OperationFilter>{
      moduleName,
      operationMethod: options.method,
      operationPathname: options.pathname,
      append: options.append,
      update: options.update,
    })
    console.log('🚀 ~ .action ~ filter:', filter)

    const config: BuildOptions = { ...rc, filter }
    await build(config)
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
    console.error(chalk.red(e instanceof Error ? e.message : String(e)))
  }
}

void main()
