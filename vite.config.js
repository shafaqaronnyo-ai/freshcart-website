import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { copyFileSync, mkdirSync } from 'node:fs'

// The source repository stores images at its root rather than in public/.
// Copy them into Vite's public directory before the build so existing /logo URLs work.
function rootAssets() {
  return {
    name: 'freshcart-root-assets',
    buildStart() {
      mkdirSync('public', { recursive: true })
      for (const filename of ['logo-icon.png', 'logo-text.png', 'hero.png', 'icons.svg']) {
        copyFileSync(filename, 'public/' + filename)
      }
    }
  }
}

export default defineConfig({
  plugins: [react(), rootAssets()],
})
