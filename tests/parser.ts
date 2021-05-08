import test from 'ava'
import { Parser } from '../src/parser'
import * as swagger from './swagger.json'


test('Parser', async t => {
  const parser = new Parser(swagger as any, {
    outdir: './output',
    envName: 'KEQ_ENV',
    fileNamingStyle: 'snakeCase',
    services: [],
  })

  parser.parse()

  t.snapshot(parser.operations, 'opeartions expected')
  t.snapshot(parser.schemas, 'schemas expected')
})
