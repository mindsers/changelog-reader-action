import { readFile } from 'node:fs/promises'
import * as core from '@actions/core'

import { addLinks } from './add-links.js'
import { getConfig } from './get-config.js'
import { getEntries } from './get-entries.js'
import { getEntryByVersionID } from './get-entry-by-version-id.js'
import { getLinks } from './get-links.js'
import { parseEntry } from './parse-entry.js'
import type { ValidationLevel } from './types.js'
import { validateEntry } from './validate-entry.js'

export async function main(): Promise<void> {
  try {
    const configFilePath = core.getInput('config_file') || null
    const fileConfig = getConfig(configFilePath)

    if (Object.keys(fileConfig).length > 0) {
      core.info(`Configuration loaded from file`)
      core.debug(`File configuration: ${JSON.stringify(fileConfig)}`)
    }

    // Action inputs take precedence over file config.
    const changelogPath = core.getInput('path') || fileConfig.path || './CHANGELOG.md'
    const targetVersion = core.getInput('version') || fileConfig.version || null
    const validationLevel = (core.getInput('validation_level') ||
      fileConfig.validation_level ||
      'none') as ValidationLevel

    if (targetVersion == null) {
      core.warning(
        `No target version specified. Will try to return the most recent one in the changelog file.`
      )
    }

    core.startGroup('Parse data')
    const rawData = await readFile(changelogPath)
    const linkList = getLinks(rawData)
    const versions = getEntries(rawData).map(parseEntry).map(addLinks(linkList))

    core.debug(`${versions.length} version logs found`)
    core.endGroup()

    core.startGroup('Validate data')
    if (validationLevel === 'none') {
      core.info(`Validation level set to 'none'. Skipping validation.`)
    }

    if (validationLevel !== 'none') {
      const validationDepthInput = core.getInput('validation_depth')
      const validationDepth = Number.parseInt(
        validationDepthInput || String(fileConfig.validation_depth ?? '10'),
        10
      )
      const releasedVersions = versions.filter((version) => version.status !== 'unreleased')
      releasedVersions
        .reverse()
        .slice(Math.max(0, releasedVersions.length - validationDepth))
        .forEach(validateEntry(validationLevel))
    }
    core.endGroup()

    const entry = getEntryByVersionID(versions, targetVersion)

    if (entry == null) {
      throw new Error(
        `No log entry found${targetVersion != null ? ` for version ${targetVersion}` : ''}`
      )
    }

    core.setOutput('version', entry.id)
    core.setOutput('date', entry.date)
    core.setOutput('status', entry.status)
    core.setOutput('changes', entry.text)
  } catch (error) {
    core.setFailed(error instanceof Error ? error.message : String(error))
  }
}
