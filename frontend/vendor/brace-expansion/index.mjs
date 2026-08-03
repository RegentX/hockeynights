import * as core from 'brace-expansion-v5'

export const expand = core.expand
export const EXPANSION_MAX = core.EXPANSION_MAX
export const EXPANSION_MAX_LENGTH = core.EXPANSION_MAX_LENGTH

function braceExpansion(str, options) {
  return core.expand(str, options)
}

Object.assign(braceExpansion, core)

export default braceExpansion
