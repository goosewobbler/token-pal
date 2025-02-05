import { defineConfig } from 'wxt';
import { resolve } from 'node:path';

export default defineConfig({
  manifest: {
    name: 'Trench Buddy',
    description: 'Quick access to blockchain explorers and analytics tools',
    version: '1.0.0',
    permissions: ['clipboardRead', 'tabs', 'storage'],
    action: {
      default_popup: 'popup.html',
    },
  },
  srcDir: 'src',
  alias: {
    '@': resolve(__dirname, './src'),
  },
  extensionApi: 'chrome',
  modules: ['@wxt-dev/module-react', '@wxt-dev/auto-icons'],
  vite: () => ({
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
  }),
});
