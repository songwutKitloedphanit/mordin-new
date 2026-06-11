/*
 * Tailwind is SCOPED/LEGACY in this app, not the default styling system.
 * Bootstrap 5 (Kaiadmin) is the primary system (~1,500 Bootstrap utility usages
 * vs ~390 Tailwind). Tailwind is retained for the executive dashboard pages
 * (pages/executive/Dashboard.tsx, Dashboard2.tsx) and the Tailwind-native
 * shared components in components/ui/ that they consume.
 *
 * Do NOT add new Tailwind utilities to non-Tailwind files; use Bootstrap
 * utilities instead. Brand colors are also exposed as CSS variables in
 * src/index.css for Bootstrap-based code. See AGENTS.md "UX/UI Modernization
 * Rules". preflight stays disabled so Tailwind's reset never fights Bootstrap.
 */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  corePlugins: { preflight: false },
  theme: {
    extend: {
      fontFamily: {
        sans: ['Sarabun', 'system-ui', 'sans-serif'],
        sarabun: ['Sarabun', 'sans-serif'],
      },
      colors: {
        mp: {
          dark: '#005092',
          light: '#7bd3f7',
          blueDark: '#005092',
          blueLight: '#7bd3f7',
          bgGray: '#F5F6F8',
          textGray: '#777777',
          textDark: '#334155',
          border: '#e2e8f0',
          fertGreen: '#14532d',
        },
        fert: {
          green: '#14532d',
        },
      },
      boxShadow: {
        soft: '0 4px 10px rgba(0,0,0,0.03)',
      },
    },
  },
  plugins: [],
};
