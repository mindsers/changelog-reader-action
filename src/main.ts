import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import * as core from '@actions/core'

import { getConfig } from './get-config.js'
import { processChangelog } from './pipeline.js'
import type { ValidationLevel } from './types.js'
import { isValidationLevel, VALIDATION_LEVELS } from './types.js'

const DEFAULT_VALIDATION_DEPTH = 10

export async function main(): Promise<void> {
  try {
    const configFilePath = core.getInput('config_file') || null
    const { config: fileConfig, missingExplicitPath } = getConfig(configFilePath)

    if (missingExplicitPath !== null) {
      core.warning(`Config file '${missingExplicitPath}' not found. Falling back to action inputs.`)
    }
    if (Object.keys(fileConfig).length > 0) {
      core.info('Configuration loaded from file')
      core.debug(`File configuration: ${JSON.stringify(fileConfig)}`)
    }

    const changelogPath = core.getInput('path') || fileConfig.path || './CHANGELOG.md'
    const targetVersion = core.getInput('version') || fileConfig.version || null

    const rawValidationLevel =
      core.getInput('validation_level') || fileConfig.validation_level || 'none'
    let validationLevel: ValidationLevel = 'none'
    if (isValidationLevel(rawValidationLevel)) {
      validationLevel = rawValidationLevel
    } else {
      core.warning(
        `Invalid validation_level '${rawValidationLevel}'. Expected one of: ${VALIDATION_LEVELS.join(', ')}. Falling back to 'none'.`
      )
    }

    const validationDepthInput = core.getInput('validation_depth')
    const rawDepth = validationDepthInput || String(fileConfig.validation_depth ?? '10')
    let validationDepth = DEFAULT_VALIDATION_DEPTH
    const parsedDepth = Number.parseInt(rawDepth, 10)
    if (Number.isInteger(parsedDepth) && parsedDepth >= 0) {
      validationDepth = parsedDepth
    } else {
      core.warning(
        `Invalid validation_depth '${rawDepth}'. Falling back to ${DEFAULT_VALIDATION_DEPTH}.`
      )
    }

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

    const baseTmp = process.env.RUNNER_TEMP || tmpdir()
    const dir = await mkdtemp(join(baseTmp, 'changelog-reader-'))
    const changesFile = join(dir, 'changelog-entry.md')
    await writeFile(changesFile, entry.text, 'utf8')
    core.setOutput('changes_file', changesFile)
  } catch (error) {
    core.setFailed(error instanceof Error ? error.message : String(error))
  }
}
