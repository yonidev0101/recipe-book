"use client"

import { motion } from "framer-motion"
import { ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  const scrollToRecipes = () => {
    const recipesSection = document.querySelector('[data-recipes-section]')
    if (recipesSection) {
      recipesSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="hero-section mb-6">
      <div className="hero-pattern" />
      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <motion.h1
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 text-shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          ספר המתכונים שלך
        </motion.h1>
        <motion.p
          className="text-sm md:text-base text-white/90 mb-4 text-shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          גלה, שמור ובשל את המתכונים האהובים עליך בקלות
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Button
            onClick={scrollToRecipes}
            variant="secondary"
            className="shadow-lg hover:shadow-xl transition-shadow"
          >
            התחל לגלות מתכונים
            <ArrowDown className="mr-2 h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
