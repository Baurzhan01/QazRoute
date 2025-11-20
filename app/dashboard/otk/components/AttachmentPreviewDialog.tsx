"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface AttachmentPreviewDialogProps {
  open: boolean
  images: string[]
  initialIndex?: number
  onOpenChange: (open: boolean) => void
}

export default function AttachmentPreviewDialog({
  open,
  images,
  initialIndex = 0,
  onOpenChange,
}: AttachmentPreviewDialogProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [zoomed, setZoomed] = useState(false)

  useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex)
      setZoomed(false)
    }
  }, [open, initialIndex, images])

  const goPrev = () => {
    if (!images.length) return
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
    setZoomed(false)
  }

  const goNext = () => {
    if (!images.length) return
    setCurrentIndex((prev) => (prev + 1) % images.length)
    setZoomed(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl lg:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Просмотр вложений</DialogTitle>
        </DialogHeader>
        {images.length ? (
          <div className="relative flex flex-col items-center gap-4">
            <div className="relative w-full overflow-hidden rounded-xl bg-black/5">
              <img
                src={images[currentIndex]}
                alt={`Фото ${currentIndex + 1}`}
                className={cn(
                  "h-[320px] w-full cursor-zoom-in select-none bg-white object-contain transition duration-200 ease-in-out sm:h-[400px] lg:h-[70vh]",
                  zoomed && "scale-150 cursor-zoom-out"
                )}
                onClick={() => setZoomed((prev) => !prev)}
              />
              {images.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80"
                    onClick={goPrev}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80"
                    onClick={goNext}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
            <div className="text-sm text-gray-500">
              Фото {currentIndex + 1} из {images.length}
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {images.map((url, idx) => (
                <button
                  key={url + idx}
                  className={cn(
                    "h-16 w-16 overflow-hidden rounded-md border",
                    idx === currentIndex ? "border-emerald-500" : "border-gray-200"
                  )}
                  onClick={() => {
                    setCurrentIndex(idx)
                    setZoomed(false)
                  }}
                >
                  <img src={url} alt={`Миниатюра ${idx + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Нет вложений для просмотра</p>
        )}
      </DialogContent>
    </Dialog>
  )
}
