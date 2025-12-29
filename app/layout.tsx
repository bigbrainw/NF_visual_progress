import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '3-Month Execution Plan Timeline',
  description: 'Visual timeline tool for managing a 3-month execution plan',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
