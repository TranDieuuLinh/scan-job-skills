import { defineManifest } from '@crxjs/vite-plugin'
import pkg from './package.json'

export default defineManifest({
  manifest_version: 3,
  name: "Skills Scanner",
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
  background: {
    service_worker: 'src/background.ts',
    type:'module'
  },
  content_scripts: [{
    js: ['src/content/main.tsx'],
    matches: ['https://www.linkedin.com/jobs/*'],
  }],
  side_panel: {
    default_path: 'src/sidepanel/index.html',
  },
  host_permissions: [
    "http://127.0.0.1:8000/*",
    "http://157.180.113.69:3002/*"
  ]
})
