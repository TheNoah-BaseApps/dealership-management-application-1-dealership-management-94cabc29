import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import '@/app/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Dealership Management System',
  description: 'AI-powered dealership management system for automating leads, sales, and inventory',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}