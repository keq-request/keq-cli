export type NamingStyle = 'camelCase' | 'capitalCase' | 'constantCase' | 'dotCase' | 'headerCase' | 'noCase' | 'paramCase' | 'pascalCase' | 'pathCase' | 'sentenceCase' | 'snakeCase'


export interface Options {
  outdir: string
  /**
   * @default 'KEQ_ENV'
   */
  envName?: string
  /**
   * @default true
   */
  strict?: boolean
  fileNamingStyle?: NamingStyle
  request: string
  env?: Record<string, string>
}
