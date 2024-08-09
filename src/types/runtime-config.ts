/* eslint-disable @typescript-eslint/no-redeclare */
/**
 * .keqrc schema
 */
import { Static, Type } from '@sinclair/typebox'
import { BuildOptions } from './build-options'


export const RuntimeConfig = Type.Omit(BuildOptions, ['filter'])
export type RuntimeConfig = Static<typeof RuntimeConfig>
