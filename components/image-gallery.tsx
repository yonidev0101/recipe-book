"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { OptimizedImage } from "./optimized-image"
import { Button } from "@/components/ui/button"
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface ImageGalleryProps {
  images: Array<{
    src: string
    alt: string
    caption?: string
  }>
  className?: string
}

export function ImageGallery({ images, className = "" }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const openGallery = (index: number) => {
    setSelectedIndex(index)
    setIsOpen(true)
  }

  const closeGallery = () => {
    setIsOpen(false)
    setSelectedIndex(null)
  }

  const goToPrevious = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex > 0 ? selectedIndex - 1 : images.length - 1)
    }
  }

  const goToNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex < images.length - 1 ? selectedIndex + 1 : 0)
    }
  }

  if (images.length === 0) return null

  return (
    <>
      {/* Gallery Grid */}
      <div className={`grid gap-4 ${className}`}>
        {images.length === 1 && (
          <div className="relative aspect-video group cursor-pointer overflow-hidden rounded-lg" onClick={() => openGallery(0)}>
            <OptimizedImage
              src={images[0].src}
              alt={images[0].alt}
              cloudinaryType="detail"
              fill
              className="rounded-lg"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
              <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        )}

        {images.length === 2 && (
          <div className="grid grid-cols-2 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative aspect-square group cursor-pointer overflow-hidden rounded-lg" onClick={() => openGallery(index)}>
                <OptimizedImage
                  src={image.src}
                  alt={image.alt}
                  cloudinaryType="card"
                  fill
                  className="rounded-lg"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
                  <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        )}

        {images.length >= 3 && (
          <div className="grid grid-cols-2 gap-4">
            {/* Main image */}
            <div className="relative aspect-video group cursor-pointer overflow-hidden rounded-lg" onClick={() => openGallery(0)}>
              <OptimizedImage
                src={images[0].src}
                alt={images[0].alt}
                cloudinaryType="detail"
                fill
                className="rounded-lg"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
                <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Side images */}
            <div className="grid grid-rows-2 gap-4">
              {images.slice(1, 3).map((image, index) => (
                <div key={index + 1} className="relative aspect-square group cursor-pointer overflow-hidden rounded-lg" onClick={() => openGallery(index + 1)}>
                  <OptimizedImage
                    src={image.src}
                    alt={image.alt}
                    cloudinaryType="card"
                    fill
                    className="rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
                    <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}

              {/* More images indicator */}
              {images.length > 3 && (
                <div className="relative aspect-square group cursor-pointer overflow-hidden rounded-lg" onClick={() => openGallery(2)}>
                  <OptimizedImage
                    src={images[2].src}
                    alt={images[2].alt}
                    cloudinaryType="card"
                    fill
                    className="rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xl font-bold">+{images.length - 3}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-7xl w-full h-full max-h-screen p-0 bg-black/95">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
              onClick={closeGallery}
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Navigation Buttons */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20"
                  onClick={goToPrevious}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20"
                  onClick={goToNext}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
              </>
            )}

            {/* Image Display */}
            <AnimatePresence mode="wait">
              {selectedIndex !== null && (
                <motion.div
                  key={selectedIndex}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="relative w-full max-w-7xl h-[90vh]"
                >
                  <OptimizedImage
                    src={images[selectedIndex].src}
                    alt={images[selectedIndex].alt}
                    cloudinaryType="hero"
                    fill
                    objectFit="contain"
                    className="object-contain"
                    priority
                  />

                  {/* Caption */}
                  {images[selectedIndex].caption && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg">
                      {images[selectedIndex].caption}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Image Counter */}
            {images.length > 1 && selectedIndex !== null && (
              <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm">
                {selectedIndex + 1} / {images.length}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
