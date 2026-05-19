import { readFile } from 'node:fs/promises'
import * as core from '@actions/core'

import { getConfig } from './get-config.js'
import { processChangelog } from './pipeline.js'
import type { ValidationLevel } from './types.js'

export async function main(): Promise<void> {
  try {
    const configFilePath = core.getInput('config_file') || null
    const fileConfig = getConfig(configFilePath)

    if (Object.keys(fileConfig).length > 0) {
      core.info('Configuration loaded from file')
      core.debug(`File configuration: ${JSON.stringify(fileConfig)}`)
    }

    const changelogPath = core.getInput('path') || fileConfig.path || './CHANGELOG.md'
    const targetVersion = core.getInput('version') || fileConfig.version || null
    const validationLevel = (core.getInput('validation_level') ||
      fileConfig.validation_level ||
      'none') as ValidationLevel
    const validationDepthInput = core.getInput('validation_depth')
    const validationDepth = Number.parseInt(
      validationDepthInput || String(fileConfig.validation_depth ?? '10'),
      10
    )

    if (targetVersion == null) {
      core.warning(
        'No target version specified. Will try to return the most recent one in the changelog file.'
      )
    }

    core.startGroup('Parse data')
    const rawData = await readFile(changelogPath)
    core.endGroup()

    core.startGroup('Validate data')
    if (validationLevel === 'none') {
      core.info(`Validation level set to 'none'. Skipping validation.`)
    }
    const { entry, diagnostics } = processChangelog(rawData, {
      targetVersion,
      validationLevel,
      validationDepth,
    })
    core.endGroup()

    const errors: Error[] = []
    for (const diag of diagnostics) {
      if (diag.severity === 'warn') {
        core.warning(diag.message)
      } else {
        core.error(diag.message)
        errors.push(new Error(diag.message))
      }
    }
    if (errors.length > 0) {
      throw new AggregateError(errors, `${entry.id} entry is invalid.`)
    }

    core.setOutput('version', entry.id)
    core.setOutput('date', entry.date)
    core.setOutput('status', entry.status)
    core.setOutput('changes', entry.text)
  } catch (error) {
    core.setFailed(error instanceof Error ? error.message : String(error))
  }
}
