const fs = require('fs')
const path = require('path')
const yaml = require('yaml')

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
    return yaml.parse(content) || {}
  }

  // Default to JSON parsing
  return JSON.parse(content)
}
