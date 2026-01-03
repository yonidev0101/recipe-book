"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Plus, UtensilsCrossed, Heart, Home, Grid3X3, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { usePathname } from "next/navigation"
import { AiRecipeImportModal } from "@/components/ai-recipe-import/ai-recipe-import-modal"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [aiModalOpen, setAiModalOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { name: "דף הבית", href: "/", icon: <Home className="h-4 w-4 ml-1.5" /> },
    { name: "קטגוריות", href: "/categories", icon: <Grid3X3 className="h-4 w-4 ml-1.5" /> },
    { name: "מועדפים", href: "/favorites", icon: <Heart className="h-4 w-4 ml-1.5" /> },
  ]

  return (
    <header
      className={`sticky top-0 z-50 w-full backdrop-blur transition-all duration-300 ${
        scrolled ? "bg-background/95 border-b shadow-sm" : "bg-background/50"
      }`}
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">תפריט</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[240px] sm:w-[300px]">
              <div className="flex items-center gap-2 mb-8 mt-4">
                <UtensilsCrossed className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">ספר המתכונים שלי</span>
              </div>
              <nav className="flex flex-col gap-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center text-lg font-medium transition-colors hover:text-primary ${
                      pathname === item.href ? "text-primary" : ""
                    }`}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                ))}
              </nav>

              <div className="mt-8 space-y-2">
                <Button
                  variant="outline"
                  className="w-full gap-1"
                  onClick={() => {
                    setAiModalOpen(true)
                    setIsOpen(false)
                  }}
                >
                  <Sparkles className="h-4 w-4 ml-1" />
                  ייבוא חכם
                </Button>
                <Button asChild className="w-full gap-1">
                  <Link href="/recipes/new" onClick={() => setIsOpen(false)}>
                    <Plus className="h-4 w-4 ml-1" />
                    מתכון חדש
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center gap-2 min-w-0">
            <motion.div
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="flex-shrink-0"
            >
              <UtensilsCrossed className="h-6 w-6 text-primary hidden md:block" />
            </motion.div>
            <span className="text-lg sm:text-xl font-bold gradient-heading truncate max-w-[120px] sm:max-w-full">
              ספר המתכונים שלי
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center text-md font-medium transition-colors hover:text-primary ${
                pathname === item.href
                  ? "text-primary relative after:absolute after:bottom-[-18px] after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                  : ""
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="outline"
            className="gap-1 rounded-full shadow-sm hidden sm:flex"
            onClick={() => setAiModalOpen(true)}
          >
            <Sparkles className="h-4 w-4 ml-1" />
            ייבוא חכם
          </Button>
          <Button asChild className="gap-1 rounded-full shadow-sm hidden sm:flex">
            <Link href="/recipes/new">
              <Plus className="h-4 w-4 ml-1" />
              מתכון חדש
            </Link>
          </Button>
          <Button asChild variant="ghost" size="icon" className="sm:hidden">
            <Link href="/recipes/new">
              <Plus className="h-5 w-5" />
            </Link>
          </Button>
          <ModeToggle />
        </div>
      </div>
      <AiRecipeImportModal open={aiModalOpen} onOpenChange={setAiModalOpen} />
    </header>
  )
}
