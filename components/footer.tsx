import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="border-t py-8 bg-accent/30">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="לוגו" width={28} height={28} />
            <span className="text-lg font-bold">המתכונים של זלדי</span>
          </div>

          <nav className="flex flex-wrap justify-center gap-6 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
              דף הבית
            </Link>
            <Link href="/categories" className="text-muted-foreground hover:text-primary transition-colors">
              קטגוריות
            </Link>
            <Link href="/favorites" className="text-muted-foreground hover:text-primary transition-colors">
              מועדפים
            </Link>
            <Link href="/recipes/new" className="text-muted-foreground hover:text-primary transition-colors">
              הוסף מתכון
            </Link>
          </nav>
        </div>

        <div className="border-t mt-6 pt-6 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} המתכונים של זלדי. כל הזכויות שמורות.
          </p>
          <p className="text-sm text-muted-foreground">
            Powered by <span className="font-semibold text-primary">YoniDev</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
