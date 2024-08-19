/* eslint-disable @typescript-eslint/no-redeclare */
/**
 * .keqrc schema
 */
import { Static, Type } from '@sinclair/typebox'
import { BuildOptions } from './build-options'
import { OperationIdFactoryOptions } from './operation-id-factory-options'


export const RuntimeConfig = Type.Intersect([
  Type.Omit(BuildOptions, ['modules']),
  Type.Object({
    modules: Type.Record(Type.String(), Type.String()),
    operationId: Type.Optional(Type.Function([Type.Any()], Type.String())),
    debug: Type.Optional(Type.Boolean({ default: false })),
  }),
])

export interface RuntimeConfig extends Omit<Static<typeof RuntimeConfig>, 'operationId'> {
  operationId?: (context: OperationIdFactoryOptions) => string
}
