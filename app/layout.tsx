import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Space_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const _plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300', '400', '500', '600', '700', '800'],
})

const _spaceMono = Space_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '700'],
})

export const metadata: Metadata = {
  title: 'CosmeZen - OEM Cosmetics Factory',
  description: 'CosmeZen Cosmetics OEM/ODM Management System - Production & Job Orders',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th">
      <body className="font-sans antialiased">
        {children}
        <Toaster position="bottom-center" richColors />
      </body>
    </html>
  )
}
