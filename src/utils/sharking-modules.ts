import * as R from 'ramda'
import * as path from 'path'
import * as fs from 'fs-extra'
import * as changeCase from 'change-case'
import { OpenAPIV3 } from 'openapi-types'
import { RuntimeConfig } from '~/types/runtime-config'
import { JSONPath } from 'jsonpath-plus'
import { getSafeOperationName } from './get-safe-operation-name'
import { OperationFilter } from '~/types/operation-filter'
import chalk from 'chalk'
import { getRefs } from './get-refs'
import { validateRef } from './validate-ref'
import { SupportedMethods } from '~/constants/supported-methods'

function getComponentDependencies(document: OpenAPIV3.Document): Record<string, string[]> {
  const componentsDirectDependencies: Record<string, string[]> = {}

  if (document.components) {
    for (const [groupName, group] of Object.entries(document.components)) {
      for (const [schemaName, schema] of Object.entries(group)) {
        const result: string[] = JSONPath({
          path: "$..*['$ref']",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          json: schema as any,
        })

        const schemaRef = `#/components/${groupName}/${schemaName}`
        componentsDirectDependencies[schemaRef] = R.without([schemaRef], R.uniq(result))
      }
    }
  }

  const componentsDependencies: Record<string, string[]> = {}

  function collectDependencies(schemaRef: string, dependencies: string[] = []): string[] {
    if (schemaRef in componentsDependencies) {
      return R.without(dependencies, componentsDependencies[schemaRef])
    }

    if (!componentsDirectDependencies[schemaRef]) return []

    const directDependencies = R.without(dependencies, componentsDirectDependencies[schemaRef])
    if (!directDependencies.length) return []


    const indirectDependencies: string[] = []

    for (const depRef of directDependencies) {
      const deps = collectDependencies(depRef, [...dependencies, ...directDependencies, ...indirectDependencies])
      indirectDependencies.push(...deps)
    }

    return [...directDependencies, ...indirectDependencies]
  }


  for (const schemaRef of Object.keys(componentsDirectDependencies)) {
    componentsDependencies[schemaRef] = collectDependencies(schemaRef)
  }


  return componentsDependencies
}

function getOperationDependencies(document: OpenAPIV3.Document): Record<string, string[]> {
  const componentsDependencies = getComponentDependencies(document)

  const operationDependencies: Record<string, string[]> = {}
  for (const [pathname, pathItem] of Object.entries(document.paths)) {
    for (const m in pathItem) {
      const method = m.toLowerCase()
      if (!SupportedMethods.includes(method)) continue
      if (typeof pathItem[m] !== 'object' || Array.isArray(pathItem[m])) continue

      const operation: OpenAPIV3.OperationObject = pathItem[m]
      const operationId = getSafeOperationName(pathname, method, operation)

      const deps: string[] = JSONPath({
        path: "$..*['$ref']",
        json: operation,
      })

      operationDependencies[operationId] = R.reject(R.isNil, R.uniq([...deps, ...deps.flatMap((dep) => componentsDependencies[dep])]))
    }
  }

  return operationDependencies
}


async function operationExists(rc: RuntimeConfig, moduleName: string, pathname: string, method: string, operation: OpenAPIV3.OperationObject): Promise<boolean> {
  const formatFilename = changeCase[rc.fileNamingStyle]
  const output = path.join(rc.outdir, formatFilename(moduleName))
  const filename = formatFilename(getSafeOperationName(pathname, method, operation))
  const filepath = path.join(output, `${filename}.ts`)
  return await fs.exists(filepath)
}

async function sharkingModule(moduleName: string, document: OpenAPIV3.Document, filters: OperationFilter[], rc: RuntimeConfig): Promise<OpenAPIV3.Document> {
  const dependencies = getOperationDependencies(document)

  if (rc.debug) {
    await fs.writeJSON(`.keq/${moduleName}.dependencies.json`, dependencies, { spaces: 2 })
  }

  for (const [pathname, pathItems] of Object.entries(R.clone(document.paths))) {
    for (const m in pathItems) {
      const method = m.toLowerCase()

      if (!SupportedMethods.includes(method)) continue
      if (typeof pathItems[m] !== 'object' || Array.isArray(pathItems[m])) continue

      const operation: OpenAPIV3.OperationObject = pathItems[m]
      const operationId = getSafeOperationName(pathname, method, operation)

      const existed = await operationExists(rc, moduleName, pathname, method, operation)
      const ignore = filters.every((f) => {
        if (f.method && method !== f.method.toLowerCase().trim()) return true
        if (f.pathname && pathname !== f.pathname.trim()) return true
        if (!f.append && !existed) return true
        if (!f.update && existed) return true

        return false
      })

      if (ignore) {
        if (document.paths?.[pathname]?.[m]) {
          delete document.paths[pathname][m]

          if (R.isEmpty(document.paths[pathname])) {
            delete document.paths[pathname]
          }
        }


        const dependenciesToDelete = dependencies[operationId]
        delete dependencies[operationId]

        if (document.components) {
          for (const dep of dependenciesToDelete) {
            if (Object.values(dependencies).some((deps) => deps.includes(dep))) continue

            const [groupName, schemaName] = dep.split('/').slice(-2)
            if (groupName in document.components && schemaName in document.components[groupName]) {
              delete document.components[groupName][schemaName]
            }
          }
        }

        continue
      }
    }
  }

  sharkingFreeComponents(document)
  validateRef(document)

  if (rc.debug) {
    await fs.writeJSON(`.keq/${moduleName}.sharked-swagger.json`, document, { spaces: 2 })
  }

  return document
}

// Remove schemas that are not used in operations
function sharkingFreeComponents(document: OpenAPIV3.Document): boolean {
  const componentsDependencies = getComponentDependencies(document)

  const refs: string[] = getRefs(document)
  const operationDirectRefs: string[] = JSONPath({
    path: "$..*['$ref']",
    json: document.paths,
  })
  const operationRefs = operationDirectRefs.flatMap((ref) => componentsDependencies[ref] || []).concat(operationDirectRefs)


  const freeRefs = R.difference(refs, operationRefs)

  if (document.components && freeRefs.length) {
    for (const ref of freeRefs) {
      const [groupName, schemaName] = ref.split('/').slice(-2)
      if (groupName in document.components && schemaName in document.components[groupName]) {
        delete document.components[groupName][schemaName]
      }
    }
  }

  return operationRefs.every((ref) => refs.includes(ref))
}


function sharkingUnsupportedMethods(document: OpenAPIV3.Document): OpenAPIV3.Document {
  for (const [pathname, pathItems] of Object.entries(document.paths)) {
    for (const m in pathItems) {
      const method = m.toLowerCase()

      if (!SupportedMethods.includes(method)) {
        delete pathItems[m]

        if (R.isEmpty(document.paths[pathname])) {
          delete document.paths[pathname]
        }
      }
    }
  }

  return document
}

export async function sharkingModules(modules: Record<string, OpenAPIV3.Document>, filters: OperationFilter[], rc: RuntimeConfig): Promise<Record<string, OpenAPIV3.Document>> {
  let pairs = Object.entries(modules)
    .map(([moduleName, document]): [string, OpenAPIV3.Document] => [
      moduleName,
      sharkingUnsupportedMethods(R.clone(document)),
    ])

  if (!filters.length) return modules

  pairs = await Promise.all(
    pairs
      .map(async ([moduleName, document]): Promise<[string, OpenAPIV3.Document]> => [
        moduleName,
        await sharkingModule(moduleName, R.clone(document), filters, rc),
      ]),
  )

  // Remove module without paths
  pairs = pairs.filter(([moduleName, module]) => {
    if (R.isEmpty(module.paths)) {
      console.log(chalk.yellow(`${moduleName} module skipped.`))
      return false
    }

    return true
  })

  return R.fromPairs(pairs)
}
