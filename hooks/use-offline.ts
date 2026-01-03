"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"

interface OfflineAction {
  id: string
  type: "create" | "update" | "delete"
  data: any
  timestamp: number
  retryCount: number
}

export function useOffline() {
  const [isOnline, setIsOnline] = useState(true)
  const [pendingActions, setPendingActions] = useState<OfflineAction[]>([])
  const { toast } = useToast()

  useEffect(() => {
    // בדיקת סטטוס חיבור ראשוני
    setIsOnline(navigator.onLine)

    // טעינת פעולות ממתינות מ-localStorage
    const savedActions = localStorage.getItem("offline-actions")
    if (savedActions) {
      try {
        setPendingActions(JSON.parse(savedActions))
      } catch (error) {
        console.error("Error loading offline actions:", error)
      }
    }

    // האזנה לשינויי סטטוס חיבור
    const handleOnline = () => {
      setIsOnline(true)
      toast({
        title: "חזרת לאינטרנט! 🌐",
        description: "מסנכרן נתונים...",
      })
      syncPendingActions()
    }

    const handleOffline = () => {
      setIsOnline(false)
      toast({
        title: "אין חיבור לאינטרנט 📱",
        description: "המשך לעבוד - הנתונים יישמרו מקומית",
        variant: "destructive",
      })
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [toast])

  // שמירת פעולה לתור אופליין
  const addOfflineAction = (action: Omit<OfflineAction, "id" | "timestamp" | "retryCount">) => {
    const newAction: OfflineAction = {
      ...action,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0,
    }

    const updatedActions = [...pendingActions, newAction]
    setPendingActions(updatedActions)
    localStorage.setItem("offline-actions", JSON.stringify(updatedActions))

    toast({
      title: "נשמר מקומית 💾",
      description: "הפעולה תתבצע כשתחזור לאינטרנט",
    })

    return newAction.id
  }

  // סנכרון פעולות ממתינות
  const syncPendingActions = async () => {
    if (!isOnline || pendingActions.length === 0) return

    const actionsToSync = [...pendingActions]
    const failedActions: OfflineAction[] = []

    for (const action of actionsToSync) {
      try {
        await executeAction(action)
        toast({
          title: "סונכרן בהצלחה ✅",
          description: `${getActionDescription(action)} בוצע בהצלחה`,
        })
      } catch (error) {
        console.error("Failed to sync action:", error)

        // אם נכשל פחות מ-3 פעמים, נשאיר בתור
        if (action.retryCount < 3) {
          failedActions.push({
            ...action,
            retryCount: action.retryCount + 1,
          })
        } else {
          toast({
            title: "סנכרון נכשל ❌",
            description: `${getActionDescription(action)} נכשל אחרי 3 ניסיונות`,
            variant: "destructive",
          })
        }
      }
    }

    setPendingActions(failedActions)
    localStorage.setItem("offline-actions", JSON.stringify(failedActions))
  }

  // ביצוע פעולה בפועל
  const executeAction = async (action: OfflineAction) => {
    const { createRecipe, updateRecipe, deleteRecipe } = await import("@/app/actions/recipes")

    switch (action.type) {
      case "create":
        return await createRecipe(action.data)
      case "update":
        return await updateRecipe(action.data.id, action.data.formData)
      case "delete":
        return await deleteRecipe(action.data.id)
      default:
        throw new Error(`Unknown action type: ${action.type}`)
    }
  }

  // תיאור פעולה לתצוגה
  const getActionDescription = (action: OfflineAction) => {
    switch (action.type) {
      case "create":
        return `יצירת מתכון "${action.data.title}"`
      case "update":
        return `עדכון מתכון "${action.data.formData.title}"`
      case "delete":
        return "מחיקת מתכון"
      default:
        return "פעולה לא ידועה"
    }
  }

  // מחיקת פעולה מהתור
  const removeOfflineAction = (actionId: string) => {
    const updatedActions = pendingActions.filter((action) => action.id !== actionId)
    setPendingActions(updatedActions)
    localStorage.setItem("offline-actions", JSON.stringify(updatedActions))
  }

  // ניקוי כל הפעולות הממתינות
  const clearPendingActions = () => {
    setPendingActions([])
    localStorage.removeItem("offline-actions")
  }

  return {
    isOnline,
    pendingActions,
    addOfflineAction,
    syncPendingActions,
    removeOfflineAction,
    clearPendingActions,
  }
}
