"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Wifi, WifiOff, Clock, FolderSyncIcon as Sync } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useOffline } from "@/hooks/use-offline"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export function OfflineIndicator() {
  const { isOnline, pendingActions, syncPendingActions, clearPendingActions } = useOffline()

  return (
    <div className="fixed top-20 left-4 z-50">
      <AnimatePresence>
        {(!isOnline || pendingActions.length > 0) && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={`shadow-lg backdrop-blur-sm ${
                    isOnline
                      ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                      : "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                  }`}
                >
                  {isOnline ? <Wifi className="h-4 w-4 mr-2" /> : <WifiOff className="h-4 w-4 mr-2" />}

                  {isOnline ? "מחובר" : "לא מחובר"}

                  {pendingActions.length > 0 && (
                    <Badge variant="secondary" className="mr-2 h-5 min-w-5 text-xs">
                      {pendingActions.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-80" align="start">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {isOnline ? (
                      <Wifi className="h-5 w-5 text-green-600" />
                    ) : (
                      <WifiOff className="h-5 w-5 text-red-600" />
                    )}
                    <div>
                      <h3 className="font-medium">{isOnline ? "מחובר לאינטרנט" : "לא מחובר לאינטרנט"}</h3>
                      <p className="text-sm text-muted-foreground">
                        {isOnline ? "כל הפעולות יתבצעו מיידית" : "הפעולות יישמרו מקומית ויסונכרנו כשתחזור לאינטרנט"}
                      </p>
                    </div>
                  </div>

                  {pendingActions.length > 0 && (
                    <>
                      <div className="border-t pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            פעולות ממתינות ({pendingActions.length})
                          </h4>
                          {isOnline && (
                            <Button variant="outline" size="sm" onClick={syncPendingActions} className="h-7">
                              <Sync className="h-3 w-3 mr-1" />
                              סנכרן
                            </Button>
                          )}
                        </div>

                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {pendingActions.map((action) => (
                            <div
                              key={action.id}
                              className="flex items-center justify-between p-2 bg-accent/50 rounded text-sm"
                            >
                              <div>
                                <div className="font-medium">
                                  {action.type === "create" && "יצירת מתכון"}
                                  {action.type === "update" && "עדכון מתכון"}
                                  {action.type === "delete" && "מחיקת מתכון"}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(action.timestamp).toLocaleTimeString("he-IL")}
                                  {action.retryCount > 0 && ` (ניסיון ${action.retryCount + 1})`}
                                </div>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                ממתין
                              </Badge>
                            </div>
                          ))}
                        </div>

                        <div className="flex gap-2 mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={clearPendingActions}
                            className="flex-1 h-8 text-xs"
                          >
                            נקה הכל
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
