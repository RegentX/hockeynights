'use strict'

const core = require('brace-expansion-v5')

function expand(str, options) {
  return core.expand(str, options)
}

module.exports = Object.assign(expand, core)
