import type { Metadata } from 'next'
import './globals.css'
import Providers from './providers'
import { ViewTransitions } from 'next-view-transitions'

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
        <ViewTransitions>
          <Providers>
            {children}
          </Providers>
        </ViewTransitions>
      </body>
    </html>
  )
}
