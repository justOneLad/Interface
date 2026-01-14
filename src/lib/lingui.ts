// Shim module providing compile-time placeholders for Lingui macros.
// The real transforms are applied by @lingui/swc-plugin during compilation, so
// these runtime implementations are simple no-ops to satisfy the bundler.
import React from 'react'

export const Trans: React.FC<any> = () => null
export const t = (s: any) => s
export default { Trans, t }
