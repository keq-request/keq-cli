export type NamingStyle = 'camelCase' | 'capitalCase' | 'constantCase' | 'dotCase' | 'headerCase' | 'noCase' | 'paramCase' | 'pascalCase' | 'pathCase' | 'sentenceCase' | 'snakeCase'

export interface Options {
  outdir: string
  /**
   * @default 'KEQ_ENV'
   */
  envName?: string
  strict: boolean
  fileNamingStyle?: NamingStyle
  services: {
    env: string
    url: string
  }[]
}
