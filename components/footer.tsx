import { UtensilsCrossed, Heart, Github, Twitter } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Footer() {
  return (
    <footer className="border-t py-12 md:py-16 bg-accent/30 pattern-bg">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <UtensilsCrossed className="h-6 w-6 text-primary" />
              <span className="text-2xl font-bold">ספר המתכונים שלי</span>
            </div>
            <p className="text-muted-foreground mb-6 max-w-md">
              האתר המושלם לניהול ושיתוף המתכונים האהובים עליך. שמור, גלה ובשל מתכונים חדשים בקלות.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="rounded-full">
                <Github className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full">
                <Twitter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">ניווט מהיר</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
                  דף הבית
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-muted-foreground hover:text-primary transition-colors">
                  קטגוריות
                </Link>
              </li>
              <li>
                <Link href="/favorites" className="text-muted-foreground hover:text-primary transition-colors">
                  מועדפים
                </Link>
              </li>
              <li>
                <Link href="/recipes/new" className="text-muted-foreground hover:text-primary transition-colors">
                  הוסף מתכון
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">קטגוריות פופולריות</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/?category=desserts" className="text-muted-foreground hover:text-primary transition-colors">
                  קינוחים
                </Link>
              </li>
              <li>
                <Link
                  href="/?category=main-dishes"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  מנות עיקריות
                </Link>
              </li>
              <li>
                <Link href="/?category=salads" className="text-muted-foreground hover:text-primary transition-colors">
                  סלטים
                </Link>
              </li>
              <li>
                <Link href="/?category=breads" className="text-muted-foreground hover:text-primary transition-colors">
                  לחמים ומאפים
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-center text-sm text-muted-foreground mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} ספר המתכונים שלי. כל הזכויות שמורות.
          </p>
          <div className="flex items-center text-sm text-muted-foreground">
            <span>נבנה באהבה</span>
            <Heart className="h-4 w-4 mx-1 text-red-500 animate-pulse" />
          </div>
        </div>
      </div>
    </footer>
  )
}
