import { defineManifest } from '@crxjs/vite-plugin'
import pkg from './package.json'

export default defineManifest({
  manifest_version: 3,
  name: "AI Skills Scanner",
  version: pkg.version,
  icons: {
    48: 'public/logo.png',
  },
  permissions: [
    'sidePanel',
    'contentSettings',
    "nativeMessaging",
    "storage"
  ],
  content_scripts: [{
    js: ['src/content/main.tsx'],
    matches: ['https://www.linkedin.com/jobs/*'],
  }],
  side_panel: {
    default_path: 'src/sidepanel/index.html',
  },
})
