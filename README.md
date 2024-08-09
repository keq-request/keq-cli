<!-- title -->
<p align="center" style="padding-top: 41px">
  <img src="./images/logo.svg?sanitize=true" width="121" alt="logo" />
</p>

<h2 align="center" style="text-align: center">KEQ-CLI</h2>
<!-- title -->

[npm]: https://www.npmjs.com/package/keq-cli

[![version](https://img.shields.io/npm/v/keq-cli.svg?logo=npm&style=for-the-badge)][npm]
[![downloads](https://img.shields.io/npm/dm/keq-cli.svg?logo=npm&style=for-the-badge)][npm]
[![dependencies](https://img.shields.io/librariesio/release/npm/keq-cli?logo=npm&style=for-the-badge)][npm]
[![license](https://img.shields.io/npm/l/keq-cli.svg?logo=github&style=for-the-badge)][npm]
[![Codecov](https://img.shields.io/codecov/c/gh/keq-request/keq-cli?logo=codecov&token=PLF0DT6869&style=for-the-badge)](https://codecov.io/gh/keq-request/keq-cli)

<!-- description -->

[简体中文](./doc/zh-cn/README.md)

Transform Swagger 3.0/2.0 to the function that send request by [keq](https://github.com/keq-request/keq).

<!-- description -->

## Usage

### Prepare

You need prepare a [Swagger 3.0 file](./tests/swagger.json) first.

### `keq-cli compile`

`keq-cli compile` is use to compile a local swagger file.

```bash
npx keq-cli compile  -o ./output -m userService ./swagger.json
```

Options:

| option                | description                                                                                                   |
| :-------------------- | :------------------------------------------------------------------------------------------------------------ |
| `-o --outdir`         | The output directory                                                                                          |
| `-m --module-name`    | The module name                                                                                               |
| `--file-naming-style` | File naming style.(default 'snakeCase', see more in [change-case](https://www.npmjs.com/package/change-case)) |
| `--request`           | The request package used in compiled result.(default 'keq')                                                   |

### `keq-cli build [methodName]`

`keq-cli build` will compile according to the config file.
This makes it possible to compile multiple swaggers at once and makes recompiling easier.
By default, it will search for `.keqrc.yml`, `.keqrc.json`, `.keqrc.js`, `.keqrc.ts`.
And you can use `-c --config <config_file_path>` to set the config filepath you wanted.

Options:

| option                           | description                                             |
| :------------------------------- | :------------------------------------------------------ |
| `[moduleName]                    | Only generate files of the specified module             |
| `-c --config <config_file_path>` | The config filepath                                     |
| `-i --interactive                | Interactive select the scope of generation              |
| `--method <method>`              | Only generate files of the specified operation method   |
| `--pathname <pathname>`          | Only generate files of the specified operation pathname |
| `--no-append`                    | Don't generate files that not exist                     |
| `--no-update`                    | Don't generate files that existed                       |

### Configuration file

| option          | required | default                                    | description                                                                                          |
| :-------------- | :------- | :----------------------------------------- | :--------------------------------------------------------------------------------------------------- |
| outdir          | true     | -                                          | The directory generate files                                                                         |
| fileNamingStyle | `false`  | -                                          | The naming style of files                                                                            |
| modules         | true     | -                                          | Swagger files address. a url or local filepath.                                                      |
| operationId     | `false`  | `({ operation }) => operation.operationId` | By default, `operationId` is used as the function name. You could customize it to avoid duplication. |
| strict          | false    | `false`                                    | Whether remove files that generated last.                                                            |
| esm             | false    | `false`                                    | Comply with esm specifications.                                                                      |

#### FileNamingStyle

| enum                           | example       |
| :----------------------------- | :------------ |
| `FileNamingStyle.camelCase`    | `"twoWords"`  |
| `FileNamingStyle.capitalCase`  | `"Two Words"` |
| `FileNamingStyle.constantCase` | `"TWO_WORDS"` |
| `FileNamingStyle.dotCase`      | `"two.words"` |
| `FileNamingStyle.headerCase`   | `"Tow-Words"` |
| `FileNamingStyle.noCase`       | `"two words"` |
| `FileNamingStyle.paramCase`    | `"two-words"` |
| `FileNamingStyle.pascalCase`   | `"TwoWords"`  |
| `FileNamingStyle.pathCase`     | `"two/words"` |
| `FileNamingStyle.sentenceCase` | `"Two words"` |
| `FileNamingStyle.snakeCase`    | `"two_words"` |

#### Example

##### Yaml

The yml configuration file Example:

```yml
outdir: ./output
fileNamingStyle: snakeCase
modules:
  userService: ./swagger.json
  coreService: http://example.com/swagger.json
```

##### Json

```json
{
  "outdir": "./output",
  "fileNamingStyle": "snakeCase",
  "modules": {
    "userService": "./swagger.json",
    "coreService": "http://example.com/swagger.json"
  }
}
```

##### Typescript

```typescript
import { defineKeqConfig, FileNamingStyle } from "keq-cli";

export default defineKeqConfig({
  outdir: "./output",
  fileNamingStyle: FileNamingStyle.snakeCase,
  modules: {
    userService: "./swagger.json",
    coreService: "http://example.com/swagger.json",
  },

  operationId: ({ method, pathname, operation }) =>
    `${method}#${pathname.replace("/", ".")}`,
});
```

### Use In Coding

```typescript
import { request, mount } from "keq";
import { setHeader } from "keq-header";
import proxy from "keq-proxy";
import updateUser from "./outdir/userService/update_user";

// Set Request Origin
request.bseOrigin("http://127.0.0.1:8080");

request
  .useRouter()
  // set your middleware for module
  .module("userService", setHeader("x-custom-header", "custom_value"))
  // set modlue request base url for module
  .module("userService", setBaseUrl("http://example.com/api"));

async function action() {
  await updateUser({
    id: 1,
    name: "Marry",
  });
}
```
