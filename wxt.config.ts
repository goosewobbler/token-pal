import { defineConfig } from 'wxt';
import { resolve } from 'node:path';

export default defineConfig({
  manifest: {
    name: 'Token Pal',
    description: 'Quick access to blockchain explorers and analytics tools',
    version: '1.0.0',
    permissions: ['clipboardRead', 'tabs', 'storage', 'activeTab'],
    action: {
      default_popup: 'popup.html',
    },
  },
  chromiumArgs: ['--user-data-dir=./user-data'],
  srcDir: 'src',
  alias: {
    '@': resolve(__dirname, './src'),
  },
  extensionApi: 'chrome',
  modules: ['@wxt-dev/module-react'],
  vite: () => ({
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
  }),
});

