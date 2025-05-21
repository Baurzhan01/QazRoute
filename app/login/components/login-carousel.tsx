"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"

const slides = [
  {
    src: "/images/slide-bus.jpg",
    alt: "Автобус на маршруте",
    caption: "Современный автопарк",
  },
  {
    src: "/images/slide-driver.jpg",
    alt: "Водитель автобуса",
    caption: "Профессиональные водители",
  },
  {
    src: "/images/slide-dispatch.jpg",
    alt: "Цифровая диспетчеризация",
    caption: "Цифровизация процессов",
  },
]

export default function LoginCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length)
    }, 9000)
    return () => clearInterval(interval)
  }, [])

  if (!mounted) return null

  return (
    <div className="relative w-full h-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 6 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <Image
            src={slides[currentIndex].src}
            alt={slides[currentIndex].alt}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute bottom-8 left-8 bg-black/60 text-white px-4 py-2 rounded-md">
            {slides[currentIndex].caption}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
