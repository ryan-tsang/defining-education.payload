import type { Theme } from './types'

export const themeLocalStorageKey = 'payload-theme'

export const defaultTheme = 'light'

// Defining Education is a light-only brand site — never follow the OS dark
// preference, so the theme always resolves to the default (light).
export const getImplicitPreference = (): Theme | null => null
