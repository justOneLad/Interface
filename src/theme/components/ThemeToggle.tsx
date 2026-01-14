import { Trans } from '@lingui/macro'
import Row from 'components/Row'
import { atom, useAtom } from 'jotai'
import { atomWithStorage, useAtomValue, useUpdateAtom } from 'jotai/utils'
import ms from 'ms'
import { useCallback, useEffect, useMemo } from 'react'
import { Moon, Sun } from 'react-feather'
import { addMediaQueryListener, removeMediaQueryListener } from 'utils/matchMedia'

import { Segment, SegmentedControl } from './SegmentedControl'
import { ThemedText } from './text'

const THEME_UPDATE_DELAY = ms(`0.1s`)
const DARKMODE_MEDIA_QUERY = window.matchMedia('(prefers-color-scheme: dark)')

export enum ThemeMode {
  LIGHT,
  DARK,
  AUTO,
}

// Fixed dark mode - clear any cached light mode from localStorage
if (typeof window !== 'undefined') {
  localStorage.setItem('interface_color_theme', JSON.stringify(ThemeMode.DARK))
}

// Fixed dark mode - no theme switching
const themeModeAtom = atomWithStorage<ThemeMode>('interface_color_theme', ThemeMode.DARK)

export function SystemThemeUpdater() {
  // No longer needed - app is always dark
  return null
}

export function ThemeColorMetaUpdater() {
  const isDark = useIsDarkMode()

  useEffect(() => {
    const meta = document.querySelector('meta[name=theme-color]')
    if (!meta) return

    if (isDark) {
      // this color comes from #background-radial-gradient
      meta.setAttribute('content', 'rgb(19, 19, 19)')
    } else {
      meta.setAttribute('content', '#fff')
    }
  }, [isDark])

  return null
}

export function useIsDarkMode(): boolean {
  // Always return true for dark mode
  return true
}

export function useDarkModeManager(): [boolean, (mode: ThemeMode) => void] {
  const isDarkMode = useIsDarkMode()
  const setMode = useUpdateAtom(themeModeAtom)

  return useMemo(() => {
    // Wrap setMode to accept ThemeMode but ignore it since we're always dark
    const wrappedSetMode = (_mode: ThemeMode) => {
      setMode(ThemeMode.DARK)
    }
    return [isDarkMode, wrappedSetMode]
  }, [isDarkMode, setMode])
}

export default function ThemeToggle({ disabled }: { disabled?: boolean }) {
  // Theme toggle hidden - app is always in dark mode
  return null
}
