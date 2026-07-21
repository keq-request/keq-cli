

import * as changeCase from 'change-case'
import * as Handlebars from 'handlebars'


Handlebars.registerHelper('h__change-case', (fileNamingStyle: string, filename: string) => (fileNamingStyle === 'raw' ? filename : changeCase[fileNamingStyle](filename)))
