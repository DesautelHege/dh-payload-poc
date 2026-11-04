import React from 'react'

import { CurrentDocProvider } from './CurrentDoc'
import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <ThemeProvider>
      <HeaderThemeProvider>
        <CurrentDocProvider>{children}</CurrentDocProvider>
      </HeaderThemeProvider>
    </ThemeProvider>
  )
}
