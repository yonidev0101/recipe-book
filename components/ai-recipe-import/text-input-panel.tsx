"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Sparkles, FileText } from "lucide-react"
import { LoadingSpinner } from "@/components/loading/loading-spinner"

interface TextInputPanelProps {
  onParse: (text: string) => Promise<void>
  isLoading: boolean
}

export function TextInputPanel({ onParse, isLoading }: TextInputPanelProps) {
  const [text, setText] = useState("")

  const handleParse = () => {
    if (text.trim()) {
      onParse(text)
    }
  }

  const handleClear = () => {
    setText("")
  }

  const exampleText = `עוגת שוקולד פשוטה וטעימה

מרכיבים:
- 2 כוסות קמח
- 1 כוס סוכר
- חצי כוס קקאו
- 2 ביצים
- כוס חלב
- חצי כוס שמן
- כפית אבקת אפיה
- קורט מלח

הוראות הכנה:
1. מחממים תנור ל-180 מעלות
2. מערבבים את כל המרכיבים היבשים
3. מוסיפים את המרכיבים הרטובים ומערבבים
4. שופכים לתבנית משומנת
5. אופים כ-40 דקות

טיפ: אפשר להוסיף שוקולד צ'יפס לבצק`

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="recipe-text" className="text-base font-medium">
          <FileText className="h-4 w-4 inline ml-2" />
          הדבק/כתוב את טקסט המתכון
        </Label>
        <Textarea
          id="recipe-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="הדבק כאן את טקסט המתכון (שם, מרכיבים, הוראות הכנה...)&#10;&#10;לדוגמה:&#10;עוגת שוקולד&#10;&#10;מרכיבים:&#10;2 כוסות קמח, 1 כוס סוכר...&#10;&#10;הוראות:&#10;1. מערבבים את המרכיבים..."
          className="min-h-[300px] resize-none text-base leading-relaxed font-mono"
          disabled={isLoading}
          dir="rtl"
        />
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>{text.length} / 10,000 תווים</span>
          {text.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleClear} disabled={isLoading}>
              נקה טקסט
            </Button>
          )}
        </div>
      </div>

      {text.length === 0 && (
        <div className="bg-accent/30 p-4 rounded-lg space-y-2">
          <p className="text-sm font-medium">רעיון: נסה את המתכון הדוגמה</p>
          <Button variant="outline" size="sm" onClick={() => setText(exampleText)} className="text-xs">
            טען טקסט לדוגמה
          </Button>
        </div>
      )}

      <Button onClick={handleParse} disabled={!text.trim() || isLoading} size="lg" className="w-full gap-2">
        {isLoading ? (
          <>
            <LoadingSpinner size="sm" />
            מנתח את המתכון...
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5" />
            נתח מתכון עם AI
          </>
        )}
      </Button>

      {text.trim() && !isLoading && (
        <p className="text-xs text-center text-muted-foreground">
          הבוט יזהה אוטומטית את כל הפרטים: מרכיבים, הוראות, זמן הכנה ועוד
        </p>
      )}
    </div>
  )
}
