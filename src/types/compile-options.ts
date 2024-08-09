import { Type, type Static } from '@sinclair/typebox'
import { BuildOptions } from './build-options.js'
import { OperationFilter } from './operation-filter.js'


export const CompileOptions = Type.Intersect([
  Type.Omit(BuildOptions, ['modules', 'filter']),

  Type.Object({
    moduleName: Type.String(),
    filepath: Type.String(),
    filter: Type.Omit(OperationFilter, ['moduleName']),
  }),
])

// eslint-disable-next-line @typescript-eslint/no-redeclare, no-redeclare
export type CompileOptions = Static<typeof CompileOptions>
