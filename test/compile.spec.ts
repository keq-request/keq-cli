import { expect, test } from '@jest/globals'
import { OpenAPIV3 } from 'openapi-types'
import { compile } from '~/gen-code'
import * as swagger from './swagger.json'


test('compile swagger', async () => {
  const files = await compile('test', swagger as unknown as OpenAPIV3.Document, {
    outdir: './outdir',
  })

  expect(files).toMatchSnapshot()
})

