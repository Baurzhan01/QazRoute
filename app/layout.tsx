import type { Metadata } from 'next'
import './globals.css'
import Providers from './providers'
import Loader from '@/components/ui/Loader'

export const metadata: Metadata = {
  title: 'QazRoute',
  description: 'Управление автобусным парком',
  generator: 'QazRoute',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body>
        <Providers>
          <Loader />
          {children}
        </Providers>
      </body>
    </html>
  )
}
