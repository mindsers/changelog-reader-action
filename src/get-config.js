const fs = require('fs')
const path = require('path')

const CONFIG_FILE_NAMES = [
  '.changelog-reader.json',
  '.changelog-reader.yml',
  '.changelog-reader.yaml',
  '.changelogrc',
  '.changelogrc.json',
]

/**
 * Loads configuration from a file
 * @param {string|null} configPath - Optional explicit path to config file
 * @returns {Object} - Configuration object with properties: path, validation_level, validation_depth
 */
exports.getConfig = function getConfig(configPath = null) {
  // If explicit path is provided, try to load from that path
  if (configPath) {
    return loadConfigFromPath(configPath)
  }

  // Otherwise, search for config files in the current directory
  for (const fileName of CONFIG_FILE_NAMES) {
    const filePath = path.resolve(process.cwd(), fileName)
    if (fs.existsSync(filePath)) {
      return loadConfigFromPath(filePath)
    }
  }

  // Return empty config if no config file found
  return {}
}

/**
 * Load configuration from a specific path
 * @param {string} configPath - Path to the config file
 * @returns {Object} - Configuration object
 */
function loadConfigFromPath(configPath) {
  const resolvedPath = path.resolve(process.cwd(), configPath)

  if (!fs.existsSync(resolvedPath)) {
    // Return empty config if file doesn't exist
    return {}
  }

  const content = fs.readFileSync(resolvedPath, 'utf8')
  const ext = path.extname(resolvedPath).toLowerCase()

  if (ext === '.yml' || ext === '.yaml') {
    return parseYaml(content)
  }

  // Default to JSON parsing
  return JSON.parse(content)
}

/**
 * Simple YAML parser for basic key-value pairs
 * @param {string} content - YAML content
 * @returns {Object} - Parsed configuration object
 */
function parseYaml(content) {
  const config = {}
  const lines = content.split('\n')

  for (const line of lines) {
    const trimmed = line.trim()
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }

    // Parse key-value pairs
    const colonIndex = trimmed.indexOf(':')
    if (colonIndex === -1) {
      continue
    }

    const key = trimmed.substring(0, colonIndex).trim()
    let value = trimmed.substring(colonIndex + 1).trim()

    // Remove quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }

    // Convert to appropriate type
    if (value === 'true') {
      config[key] = true
    } else if (value === 'false') {
      config[key] = false
    } else if (!isNaN(value) && value !== '') {
      config[key] = parseInt(value, 10)
    } else {
      config[key] = value
    }
  }

  return config
}
