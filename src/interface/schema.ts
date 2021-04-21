import { Model } from './model'


export interface Schema {
  classname: string
  extends?: string
  implements?: string
  model: Model
}
