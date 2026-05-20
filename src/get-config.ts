import { existsSync, readFileSync } from 'node:fs'
import { extname, resolve } from 'node:path'
import * as core from '@actions/core'
import { parse as parseYaml } from 'yaml'
import type { Config } from './types.js'
import { isValidationLevel, isVersionScheme, VALIDATION_LEVELS, VERSION_SCHEMES } from './types.js'

const CONFIG_FILE_NAMES = [
  '.changelog-reader.json',
  '.changelog-reader.yml',
  '.changelog-reader.yaml',
  '.changelogrc',
  '.changelogrc.json',
]

export interface ConfigLoadResult {
  config: Config
  missingExplicitPath: string | null
}

export function getConfig(configPath: string | null = null): ConfigLoadResult {
  if (configPath) {
    const resolvedPath = resolve(process.cwd(), configPath)
    if (!existsSync(resolvedPath)) {
      return { config: {}, missingExplicitPath: configPath }
    }
    return { config: loadConfigFromPath(resolvedPath), missingExplicitPath: null }
  }

  for (const fileName of CONFIG_FILE_NAMES) {
    const filePath = resolve(process.cwd(), fileName)
    if (existsSync(filePath)) {
      return { config: loadConfigFromPath(filePath), missingExplicitPath: null }
    }
  }

  return { config: {}, missingExplicitPath: null }
}

function loadConfigFromPath(resolvedPath: string): Config {
  const content = readFileSync(resolvedPath, 'utf8')
  const ext = extname(resolvedPath).toLowerCase()
  const parsed = ext === '.yml' || ext === '.yaml' ? parseYaml(content) : JSON.parse(content)
  return validateConfig(parsed, resolvedPath)
}

function validateConfig(value: unknown, source: string): Config {
  if (value === null || value === undefined) {
    return {}
  }
  if (typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(
      `Config file ${source} must contain an object at the root, got ${Array.isArray(value) ? 'array' : typeof value}.`
    )
  }

  const raw = value as Record<string, unknown>
  const config: Config = {}

  if (raw.path !== undefined) {
    if (typeof raw.path === 'string') {
      config.path = raw.path
    } else {
      core.warning(`Config '${source}': 'path' must be a string. Ignoring.`)
    }
  }

  if (raw.version !== undefined) {
    if (typeof raw.version === 'string') {
      config.version = raw.version
    } else {
      core.warning(`Config '${source}': 'version' must be a string. Ignoring.`)
    }
  }

  if (raw.validation_level !== undefined) {
    if (isValidationLevel(raw.validation_level)) {
      config.validation_level = raw.validation_level
    } else {
      core.warning(
        `Config '${source}': 'validation_level' must be one of ${VALIDATION_LEVELS.join(', ')}. Ignoring.`
      )
    }
  }

  if (raw.validation_depth !== undefined) {
    if (
      typeof raw.validation_depth === 'number' &&
      Number.isInteger(raw.validation_depth) &&
      raw.validation_depth >= 0
    ) {
      config.validation_depth = raw.validation_depth
    } else {
      core.warning(
        `Config '${source}': 'validation_depth' must be a non-negative integer. Ignoring.`
      )
    }
  }

  if (raw.version_scheme !== undefined) {
    if (isVersionScheme(raw.version_scheme)) {
      config.version_scheme = raw.version_scheme
    } else {
      core.warning(
        `Config '${source}': 'version_scheme' must be one of ${VERSION_SCHEMES.join(', ')}. Ignoring.`
      )
    }
  }

  return config
}
