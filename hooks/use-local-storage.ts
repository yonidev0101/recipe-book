"use client"

import { useState, useEffect } from "react"

export function useLocalStorage<T>(key: string, initialValue: T) {
  // State לשמירת הערך
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  // קריאת הערך מ-localStorage בטעינה ראשונית
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        setStoredValue(JSON.parse(item))
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
    }
  }, [key])

  // פונקציה לעדכון הערך
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // אפשרות לפונקציה או ערך ישיר
      const valueToStore = value instanceof Function ? value(storedValue) : value

      // עדכון ה-state
      setStoredValue(valueToStore)

      // שמירה ב-localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }

  // פונקציה למחיקת הערך
  const removeValue = () => {
    try {
      window.localStorage.removeItem(key)
      setStoredValue(initialValue)
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue, removeValue] as const
}
