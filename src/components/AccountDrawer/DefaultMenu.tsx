import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import Column from 'components/Column'
import { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import AuthenticatedHeader from './AuthenticatedHeader'
import LanguageMenu from './LanguageMenu'
import SettingsMenu from './SettingsMenu'

const DefaultMenuWrap = styled(Column)`
  width: 100%;
  height: 100%;
`

enum MenuState {
  DEFAULT,
  SETTINGS,
  LANGUAGE_SETTINGS,
}

function DefaultMenu({ drawerOpen }: { drawerOpen: boolean }) {
  const { primaryWallet } = useDynamicContext()
  const account = primaryWallet?.address
  const isAuthenticated = !!account

  const [menu, setMenu] = useState<MenuState>(MenuState.DEFAULT)
  const openSettings = useCallback(() => setMenu(MenuState.SETTINGS), [])
  const closeSettings = useCallback(() => setMenu(MenuState.DEFAULT), [])
  const openLanguageSettings = useCallback(() => setMenu(MenuState.LANGUAGE_SETTINGS), [])

  useEffect(() => {
    if (!drawerOpen && menu !== MenuState.DEFAULT) {
      // wait for the drawer to close before resetting the menu
      const timer = setTimeout(() => {
        closeSettings()
      }, 250)
      return () => clearTimeout(timer)
    }
    return
  }, [drawerOpen, menu, closeSettings])

  const SubMenu = useMemo(() => {
    switch (menu) {
      case MenuState.DEFAULT:
        return isAuthenticated ? (
          <AuthenticatedHeader account={account} openSettings={openSettings} />
        ) : (
          <SettingsMenu
            onClose={closeSettings}
            openLanguageSettings={openLanguageSettings}
          />
        )
      case MenuState.SETTINGS:
        return (
          <SettingsMenu
            onClose={closeSettings}
            openLanguageSettings={openLanguageSettings}
          />
        )
      case MenuState.LANGUAGE_SETTINGS:
        return <LanguageMenu onClose={openSettings} />
    }
  }, [account, closeSettings, isAuthenticated, menu, openLanguageSettings, openSettings])

  return <DefaultMenuWrap>{SubMenu}</DefaultMenuWrap>
}

export default DefaultMenu
