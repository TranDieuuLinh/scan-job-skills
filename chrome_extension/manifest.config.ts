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
    "storage"
  ],
  background: {
    service_worker: 'src/background.ts',
    type:'module'
  },
  content_scripts: [{
    js: ['src/content/main.tsx'],
    "matches": [
      "https://www.linkedin.com/jobs/*",
      "https://www.linkedin.com/jobs/search*",
      "https://www.linkedin.com/jobs/search-results*",
      "https://*.linkedin.com/jobs/*"
    ]
  }],
  side_panel: {
    default_path: 'src/sidepanel/index.html',
  },
  host_permissions: [
    "https://api.travelknowled.ge/*"
  ]
})
