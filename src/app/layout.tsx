import type { Metadata } from 'next'
import { Space_Mono, Orbitron } from 'next/font/google'
import './globals.css'

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Mission Control QA Stack',
  description:
    'Educational demo: Quality Engineering patterns for critical Ground Control Systems. ' +
    'Simulates drone telemetry, command dispatching, and real-time monitoring.',
  keywords: ['QA', 'testing', 'drone', 'GCS', 'telemetry', 'Next.js', 'portfolio'],
  authors: [{ name: 'Mission Control QA Stack' }],
  openGraph: {
    title: 'Mission Control QA Stack',
    description: 'QA Engineering patterns for critical systems — educational demo',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${spaceMono.variable} ${orbitron.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  )
}
