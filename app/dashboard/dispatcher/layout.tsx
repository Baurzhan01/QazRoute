// app/dashboard/dispatcher/layout.tsx
import { ConvoyProvider } from "./context/ConvoyContext"

export default function DispatcherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ConvoyProvider>{children}</ConvoyProvider>
}
