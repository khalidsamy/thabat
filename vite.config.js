import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'script',
      manifest: {
        name: 'ثبات - منصتك الذكية لحفظ القرآن',
        short_name: 'ثبات',
        description: 'منصة ذكية لمراجعة وتثبيت حفظ القرآن الكريم',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        icons: [
          {
            src: '/ThabatLogo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/ThabatLogo.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 15 * 1024 * 1024, // 15MB to handle the logo
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ],
})
