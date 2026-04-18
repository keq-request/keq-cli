---
name: keq-cli
description: "Compile OpenAPI 3.0 / Swagger 2.0 specifications into type-safe TypeScript API client code using keq-cli. TRIGGER when: (1) The user mentions keq-cli, keq build, keq-cli compile, keq-cli list, .keqrc, defineKeqConfig, or asks about converting Swagger/OpenAPI specs to TypeScript with keq. (2) The user asks to write HTTP request code (fetch, axios, HTTP calls, API calls, REST requests) AND the project contains a .keqrc config file (.keqrc.ts, .keqrc.js, .keqrc.json, .keqrc.yml). (3) The user wants to generate, update, or regenerate API client code in a project that already uses keq-cli. SKIP when: the user explicitly asks to use openapi-generator, swagger-codegen, orval, or another non-keq code generation tool."
---

# keq-cli: OpenAPI to TypeScript Code Generator

keq-cli compiles OpenAPI 3.0 / Swagger 2.0 specifications into TypeScript functions that send HTTP requests via the `keq` library. Each API operation becomes a callable, type-safe function with full IntelliSense support.

## When to Use

Before running any keq-cli command, verify that both `keq` and `keq-cli` are installed in the project:

```bash
npx keq-cli --version   # check keq-cli version
npm ls keq               # check keq version
```

Only proceed if both packages are present. keq-cli requires Node.js >= 18.0.0.

Use keq-cli when you need to:
- Generate TypeScript API client code from an OpenAPI/Swagger specification
- Regenerate or update existing generated API code after a spec change
- Selectively generate specific API endpoints by method or pathname
- Clean up orphaned generated files after spec changes
- Write HTTP request code in a project with `.keqrc` config — follow the Auto-Detect Workflow below

## Auto-Detect Workflow: Writing HTTP Requests in a keq Project

When a user asks to write code that sends HTTP requests (fetch, axios, or any HTTP call), check whether the project has a `.keqrc` config. If so, use generated keq functions instead of raw HTTP code. This ensures type safety, consistent middleware, and automatic updates when the spec changes.

### Step 1: Detect .keqrc config

Search the project root for config files: `.keqrc.ts`, `.keqrc.js`, `.keqrc.json`, `.keqrc.yml`. Also check `package.json` for `keq` and `keq-cli` in dependencies or devDependencies.

If no config file exists and keq is not in dependencies, skip this workflow — let the user write HTTP code however they prefer.

### Step 2: Identify the target module and run keq-cli build

Read the `.keqrc` config to find the `modules` mapping. Identify which module covers the API endpoint the user needs.

If the generated code may be stale (e.g., the OpenAPI spec was recently updated), regenerate the relevant endpoints. Use precise filtering to generate only the needed ones:

```bash
npx keq-cli build [moduleName] --pathname <path> --method <method>
```

For example, if the user needs `GET /users`:

```bash
npx keq-cli build userService --pathname /users --method get
```

If you cannot determine the specific pathname or method, ask the user and offer two choices:
1. Provide the pathname and method for precise generation
2. Regenerate the entire module

If the build fails, report the error to the user and let them decide how to proceed. Do not automatically fall back to raw HTTP code.

### Step 3: Import and use the generated function

After a successful build, read the `outdir` (default `./api`) to find the generated function files in the module directory. Import the function and call it with typed parameters.

```typescript
import { getUsers } from "./src/api/user_service/get_users"

const users = await getUsers({ role: "admin" })
```

See the "Using Generated Code" section below for chaining, middleware, and other patterns.

### When NOT to use this workflow

- No `.keqrc` config file exists and keq/keq-cli is not in dependencies
- The target API endpoint is not covered by any configured OpenAPI spec
- The user explicitly asks to use fetch, axios, or another HTTP library

## Configuration

keq-cli automatically searches for config files named `.keqrc.ts`, `.keqrc.js`, `.keqrc.json`, or `.keqrc.yml` in the project root. You can also specify a config file with `-c --config <path>`.

Prefer TypeScript or JavaScript config files — advanced features like `operationIdFactory` only work with code-based configs.

### TypeScript config example (.keqrc.ts)

```typescript
import { defineKeqConfig, FileNamingStyle } from "keq-cli"

export default defineKeqConfig({
  // Required: output directory for generated code
  outdir: "./src/api",

  // Optional: file naming convention (default: snakeCase)
  fileNamingStyle: FileNamingStyle.snakeCase,

  // Required: map of module names to OpenAPI spec locations
  modules: {
    userService: "./swagger/user-service.json",
    orderService: "https://api.example.com/openapi.json",
    // Use object form for authenticated endpoints:
    paymentService: {
      url: "https://api.example.com/payment/openapi.json",
      headers: { "Authorization": "Bearer <token>" },
    },
  },

  // Optional: custom function name generation rule
  // Default: uses operationId from the OpenAPI spec
  // Context: method, pathname, operation, moduleName, document
  operationIdFactory: ({ method, pathname, operation, moduleName, document }) => {
    return operation.operationId || `${method}_${pathname.replace(/\//g, '_')}`
  },

  // Optional: clear output directory before generation (default: false)
  strict: false,

  // Optional: generate ESM-style imports with .js extensions (default: false)
  esm: false,

  // Optional: path to a custom request creator file
  // Use when you need a custom keq instance (e.g., with base URL or interceptors)
  // request: "./src/custom-request",

  // Optional: skip generating index.ts files (default: false)
  // Useful in multi-person collaboration to avoid merge conflicts
  skipIndex: false,
})
```

### YAML config example (.keqrc.yml)

```yaml
outdir: ./src/api
fileNamingStyle: snakeCase
modules:
  userService: ./swagger/user-service.json
  orderService: https://api.example.com/openapi.json
```

Note: `operationIdFactory` cannot be configured in YAML — use TypeScript config for this feature.

### Configuration Parameters

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `outdir` | Yes | `./api` | Output directory for compiled code |
| `modules` | Yes | - | Map of module names to OpenAPI spec file paths or URLs |
| `fileNamingStyle` | No | `snakeCase` | File naming convention |
| `operationIdFactory` | No | Uses `operationId` | Custom function name generation rule (TS/JS config only) |
| `operationId` | No | - | **Deprecated**: use `operationIdFactory` instead. Same signature and behavior |
| `strict` | No | `false` | Clear output directory before generation |
| `esm` | No | `false` | Generate ESM-style code |
| `request` | No | - | Path to custom request creator file |
| `skipIndex` | No | `false` | Skip generating index.ts files |
| `debug` | No | `false` | Write debug information to .keq/ directory |
| `tolerant` | No | `false` | Tolerate non-standard swagger structures |

### FileNamingStyle Options

| Style | Example |
|-------|---------|
| `camelCase` | `twoWords` |
| `capitalCase` | `Two Words` |
| `constantCase` | `TWO_WORDS` |
| `dotCase` | `two.words` |
| `headerCase` | `Two-Words` |
| `noCase` | `two words` |
| `paramCase` | `two-words` |
| `pascalCase` | `TwoWords` |
| `pathCase` | `two/words` |
| `sentenceCase` | `Two words` |
| `snakeCase` | `two_words` |

## Commands Reference

### `keq-cli build [moduleName]`

The primary command. Compiles OpenAPI specs into TypeScript code based on `.keqrc` config.

```bash
npx keq-cli build                        # build all modules
npx keq-cli build userService            # build only userService module
npx keq-cli build -c ./custom-keqrc.ts   # use custom config file
npx keq-cli build -i                     # interactive mode: select which operations to generate
npx keq-cli build --method get post      # only generate GET and POST operations
npx keq-cli build --pathname /users /orders  # only generate specific paths
npx keq-cli build --no-append            # skip generating new operations (only update existing)
npx keq-cli build --no-update            # skip updating existing operations (only generate new)
npx keq-cli build --tolerant             # tolerate non-standard swagger structures
npx keq-cli build --debug                # write debug info to .keq/ directory
```

| Option | Description |
|--------|-------------|
| `[moduleName]` | Only generate the specified module |
| `-c, --config <path>` | Config file path |
| `-i, --interactive` | Interactively select operations to generate |
| `--method <methods...>` | Filter by HTTP method (get/post/put/delete/patch/head/option). Note: CLI accepts `option` (singular) for the OPTIONS HTTP method |
| `--pathname <pathnames...>` | Filter by URL pathname |
| `--no-append` | Skip generating files that don't exist yet |
| `--no-update` | Skip updating files that already exist |
| `--debug` | Write debug information to .keq/ directory |
| `--tolerant` | Tolerate non-standard swagger structures |

### `keq-cli compile <filepath>`

Compile a single OpenAPI file directly without a config file.

```bash
npx keq-cli compile ./swagger.json -o ./api -m myModule
npx keq-cli compile ./swagger.json -o ./api -m myModule --file-naming-style camelCase
npx keq-cli compile ./swagger.json -o ./api -m myModule --no-strict
```

| Option | Description |
|--------|-------------|
| `-o, --outdir <path>` | **(Required)** Output directory |
| `-m, --module-name <name>` | **(Required)** Module name |
| `--file-naming-style <style>` | File naming style (default: snakeCase) |
| `--request <path>` | Custom request package path |
| `--skip-index` | Skip generating index.ts files |
| `--no-strict` | Disable strict mode |

### `keq-cli list [moduleName]`

List files that will be generated, or find orphaned files.

```bash
npx keq-cli list                    # list all files to be generated
npx keq-cli list userService        # list files for a specific module
npx keq-cli list --invalid          # list orphaned files in outdir (not in generated set)
```

| Option | Description |
|--------|-------------|
| `[moduleName]` | Only list files for the specified module |
| `-c, --config <path>` | Config file path |
| `--invalid` | List files in outdir that are not in the generated list |
| `--tolerant` | Tolerate non-standard swagger structures |

### `keq-cli install-skill`

Install the keq-cli Claude Code skill file to `.claude/skills/keq-cli.md` in the current project.

```bash
npx keq-cli install-skill
```

This command copies the built-in skill definition to your project's `.claude/skills/` directory, enabling Claude Code to automatically detect and use keq-cli when writing HTTP request code.

## Generated Code Structure

After running `keq-cli build`, the output directory has this structure:

```
<outdir>/
└── <moduleName>/
    ├── index.ts                          # Re-exports all operation functions
    ├── <operation_name>.ts               # Request function for each operation
    ├── types/
    │   └── <operation_name>.ts           # TypeScript types for each operation
    └── components/
        └── schemas/
            ├── index.ts                  # Re-exports all schema types
            └── <schema_name>.ts          # TypeScript interface for each schema
```

**File types:**
- **Operation files** (`<operation_name>.ts`): Callable functions that send HTTP requests via keq
- **Type files** (`types/<operation_name>.ts`): TypeScript types — `ResponseMap`, `QueryParameters`, `RouteParameters`, `HeaderParameters`, `BodyParameters`, `RequestParameters`, `Operation`
- **Schema files** (`components/schemas/<schema_name>.ts`): TypeScript interfaces for data models defined in the OpenAPI spec

All generated files are auto-generated — do not edit them manually. They will be overwritten on the next build.

## Using Generated Code

### Basic usage

```typescript
import { getCats } from "./src/api/cat_service/get_cats"

// Call the generated function with typed parameters
const cats = await getCats({ breed: "siamese" })

console.log(cats.map(cat => cat.name))
```

### Chaining API for runtime flexibility

Generated functions return a `Keq` request builder that supports method chaining:

```typescript
const cats = await getCats({ breed: "siamese" })
  .query('extraParam', 'extraValue')  // add parameters not defined in swagger
  .retry(3, 1000)                     // retry up to 3 times with 1s delay
  .timeout(5000)                      // set 5s timeout
```

Note: Parameters not defined in the swagger spec are silently dropped when passed directly to the function. Use `.query()`, `.set()`, or `.send()` chaining to add undeclared parameters.

### Access the pathname

Each generated function exposes its pathname as a static property:

```typescript
console.log(getCats.pathname) // "/cats"
```

### Middleware for cross-cutting concerns

Register middleware for a module to handle authentication, error handling, logging, etc.:

```typescript
import { request } from 'keq'

request
  .useRouter()
  .module('catService', async (context, next) => {
    // Add auth header to all catService requests
    context.request.set('Authorization', `Bearer ${getToken()}`)
    await next()

    // Handle errors uniformly
    if (context.response && context.response.status >= 400) {
      throw new Error(`API error: ${context.response.status}`)
    }
  })
```

## Best Practices

1. **Lock keq-cli version** in package.json — minor version updates may change code templates and could break forward compatibility.

2. **Use TypeScript config** (`.keqrc.ts`) over YAML — it enables `operationIdFactory` and provides type safety via `defineKeqConfig()`.

3. **Never edit generated files manually** — they are overwritten on each build. Use keq's chaining API and middleware for customization.

4. **Run `keq-cli list --invalid`** after spec changes to identify orphaned files that are no longer generated.

5. **Use `--tolerant` flag** when working with non-standard or incomplete swagger documents.

6. **Use `--debug` flag** to write build options to `.keq/build-options.json` for troubleshooting.

7. **Set `skipIndex: true` in config** (or use `--skip-index` with the `compile` command) in multi-person collaboration to avoid merge conflicts on index.ts files.

8. **Use `--interactive` mode** (`-i`) to selectively generate specific operations during development.

9. **Run `npx keq-cli install-skill`** in new projects to install the Claude Code skill file, enabling automatic keq-cli detection when writing HTTP request code.
