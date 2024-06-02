#!/usr/bin/env node
import chalk from 'chalk'
import { Command, Option } from 'commander'
import { cosmiconfig } from 'cosmiconfig'
import { CosmiconfigResult } from 'cosmiconfig/dist/types'
import { build } from './build'
import { compile } from './compile'
import { BuildOptions } from './types/build-options.js'
import { Value } from '@sinclair/typebox/value'


const program = new Command()
const explore = cosmiconfig('keq')


program
  .command('build')
  .option('-c --config', 'The build config file')
  .action(async (options) => {
    let result: CosmiconfigResult
    if (options.config) {
      result = await explore.load(options.config)
    } else {
      result = await explore.search()
    }

    if (!result || ('isEmpty' in result && result.isEmpty)) {
      throw new Error('Cannot find config file.')
    }


    if (!Value.Check(BuildOptions, result.config)) {
      const errors = [...Value.Errors(BuildOptions, result.config)]
      const message = errors.map(({ path, message }) => `${path}: ${message}`).join('\n')
      throw new Error(chalk.red(`Invalid Config: ${message}`))
    }

    const config: BuildOptions = result.config
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
