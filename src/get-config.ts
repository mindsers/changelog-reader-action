import { existsSync, readFileSync } from 'node:fs'
import { extname, resolve } from 'node:path'
import { parse as parseYaml } from 'yaml'

import type { Config } from './types.js'

const CONFIG_FILE_NAMES = [
  '.changelog-reader.json',
  '.changelog-reader.yml',
  '.changelog-reader.yaml',
  '.changelogrc',
  '.changelogrc.json',
]

export function getConfig(configPath: string | null = null): Config {
  if (configPath) {
    return loadConfigFromPath(configPath)
  }

  for (const fileName of CONFIG_FILE_NAMES) {
    const filePath = resolve(process.cwd(), fileName)
    if (existsSync(filePath)) {
      return loadConfigFromPath(filePath)
    }
  }

  return {}
}

function loadConfigFromPath(configPath: string): Config {
  const resolvedPath = resolve(process.cwd(), configPath)

  if (!existsSync(resolvedPath)) {
    return {}
  }

  const content = readFileSync(resolvedPath, 'utf8')
  const ext = extname(resolvedPath).toLowerCase()

  if (ext === '.yml' || ext === '.yaml') {
    return (parseYaml(content) as Config | null) ?? {}
  }

  return JSON.parse(content) as Config
}
