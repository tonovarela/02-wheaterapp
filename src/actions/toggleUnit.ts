import { saveConfig } from '../storage/settingsStorage.ts'
import { success } from '../presentation/output.ts'
import type { Config } from '../types/Config.ts'
import { unitLabel } from '../utils/format.ts'

/** Alterna la unidad de temperatura entre °C y °F. */
export async function toggleUnit(config: Config): Promise<Config> {
  const updated: Config = { ...config, unit: config.unit === 'C' ? 'F' : 'C' }
  await saveConfig(updated)
  success(`Unidad cambiada a ${unitLabel(updated.unit)}.`)
  return updated
}
