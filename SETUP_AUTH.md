# הוראות הגדרת מערכת האימות

## 1. הוספת עמודת user_id לטבלת recipes

הריצו את הפקודה הבאה ב-Supabase SQL Editor:

```sql
-- הוספת עמודת user_id לטבלת recipes
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- יצירת אינדקס לשיפור ביצועים
CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON recipes(user_id);
```

## 2. הגדרת Row Level Security (RLS) - אופציונלי אך מומלץ

```sql
-- הפעלת RLS על טבלת recipes
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- מדיניות לצפייה - כולם יכולים לראות את כל המתכונים
CREATE POLICY "Anyone can view recipes" ON recipes
  FOR SELECT USING (true);

-- מדיניות ליצירה - רק משתמשים מחוברים יכולים ליצור
CREATE POLICY "Authenticated users can create recipes" ON recipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- מדיניות לעדכון - רק הבעלים יכול לעדכן
CREATE POLICY "Users can update own recipes" ON recipes
  FOR UPDATE USING (auth.uid() = user_id);

-- מדיניות למחיקה - רק הבעלים יכול למחוק
CREATE POLICY "Users can delete own recipes" ON recipes
  FOR DELETE USING (auth.uid() = user_id);
```

## 3. הגדרת Supabase Auth

1. היכנסו ל-Supabase Dashboard
2. עברו ל-Authentication > Settings
3. הפעילו Email Auth
4. הגדירו את Site URL ל-URL של האתר שלכם
5. הגדירו Redirect URLs אם צריך

## 4. משתני סביבה

וודאו שהמשתנים הבאים מוגדרים ב-.env.local:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SITE_URL=https://your-site-url.com
```

## 5. בדיקה

לאחר ביצוע הפעולות:
1. נסו להירשם עם אימייל חדש
2. התחברו עם המשתמש שנוצר
3. צרו מתכון חדש
4. וודאו שרק אתם יכולים לערוך/למחוק אותו
