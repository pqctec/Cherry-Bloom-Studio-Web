'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [activeBrand, setActiveBrand] = useState('default')

  useEffect(() => {
    const saved = localStorage.getItem('cherry_theme_brand')
    if (saved) setActiveBrand(saved)
  }, [])

  const setThemeBrand = (brand) => {
    setActiveBrand(brand)
    localStorage.setItem('cherry_theme_brand', brand)
  }

  return (
    <ThemeContext.Provider value={{ activeBrand, setThemeBrand }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme debe usarse dentro de un ThemeProvider')
  }
  return context
}