import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'gcs-bg':     '#0a0a0a',
        'gcs-panel':  '#0f0f0f',
        'gcs-border': '#1a2332',
        'gcs-cyan':   '#06b6d4',
        'gcs-yellow': '#fbbf24',
        'gcs-red':    '#ef4444',
        'gcs-green':  '#22c55e',
        // WCAG AA contrast ≥ 4.5:1 on #0a0a0a (verified):
        'gcs-muted':  '#94a3b8',  // slate-400 — contrast ~8.1:1  ✓
        'gcs-text':   '#cbd5e1',  // slate-300  — contrast ~13:1  ✓
        'gcs-dim':    '#718096',  // blue-gray  — contrast ~5.1:1 ✓
      },
      fontFamily: {
        mono: ['var(--font-mono)', 'JetBrains Mono', 'Space Mono', 'Courier New', 'monospace'],
      },
      animation: {
        'flicker':      'flicker 10s infinite',
        'alert-pulse':  'alertPulse 2s ease-in-out infinite',
        'scan-line':    'scanLine 6s linear infinite',
        'blink':        'blink 1.2s step-end infinite',
        'fade-in':      'fadeIn 0.3s ease-out',
      },
      keyframes: {
        flicker: {
          '0%,100%': { opacity: '1' },
          '92%':     { opacity: '1' },
          '93%':     { opacity: '0.85' },
          '94%':     { opacity: '1' },
          '97%':     { opacity: '0.92' },
          '98%':     { opacity: '1' },
        },
        alertPulse: {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(239,68,68,0.5)' },
          '50%':     { boxShadow: '0 0 0 6px rgba(239,68,68,0)' },
        },
        scanLine: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        blink: {
          '0%,100%': { opacity: '1' },
          '50%':     { opacity: '0' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(-4px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
