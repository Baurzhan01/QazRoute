"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bus } from "lucide-react";

type LoaderProps = {
  /** Если true (по умолчанию) — закрывается автоматически через 3.5 сек. */
  autoClose?: boolean;
};

export default function Loader({ autoClose = true }: LoaderProps) {
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p < 100) return p + 1.5;
        clearInterval(interval);
        return 100;
      });
    }, 35);

    if (autoClose) {
      const timeout = setTimeout(() => setLoaded(true), 3500);
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }

    return () => clearInterval(interval);
  }, [autoClose]);

  return (
    <AnimatePresence>
      {!loaded && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center text-center print:hidden"
          style={{
            background:
              "linear-gradient(-45deg, #f0f9ff, #fef9c3, #e0f2fe, #fef9c3)",
            backgroundSize: "400% 400%",
            animation: "gradientShift 8s ease infinite",
          }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          {/* Круг с буквами Q R */}
          <motion.div
            className="h-20 w-20 rounded-full bg-sky-100 flex items-center justify-center text-4xl font-bold mb-4 shadow-md"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <span className="text-sky-500">Q</span>
            <span className="text-yellow-500">R</span>
          </motion.div>

          {/* Название */}
          <motion.h1
            className="text-2xl font-bold text-gray-900 mb-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="text-sky-500">Qaz</span>
            <span className="text-yellow-500">Route</span>
            <span className="text-gray-700"> ERP</span>
          </motion.h1>

          <motion.p
            className="text-gray-600 mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            ERP-система автобусного парка
          </motion.p>

          {/* Прогресс-бар */}
          <div className="relative w-72 h-6 bg-sky-100 rounded-full overflow-hidden shadow-inner flex items-center">
            {/* полоса заполнения */}
            <motion.div
              className="absolute left-0 top-0 h-full bg-sky-500"
              style={{ width: `${progress}%` }}
              transition={{ ease: "easeInOut" }}
            />
            {/* автобус в центре высоты */}
            <motion.div
              className="absolute flex items-center justify-center h-full"
              style={{ left: `${progress}%`, transform: "translateX(-50%), top-0" }}
              transition={{ ease: "linear" }}
            >
              <Bus size={20} className="text-black drop-shadow-md" />
            </motion.div>
          </div>

          <motion.p
            className="mt-4 text-sky-800 font-semibold text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Загружаем… {Math.round(progress)}%
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* В globals.css (если ещё не добавлено)
@keyframes gradientShift {
  0% { background-position: 0% 50% }
  50% { background-position: 100% 50% }
  100% { background-position: 0% 50% }
}*/
