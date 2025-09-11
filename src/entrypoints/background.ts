// import { browser } from 'wxt/browser'
import { defineBackground } from 'wxt/utils/define-background';

export default defineBackground(() => {
  // browser.action.onClicked.addListener(async (tab) => {
  //   // if (!tab?.id) return
  //   console.log('clicked')
  //   try {
  //     const clipboard = await navigator.clipboard.readText()
  //     await browser.runtime.sendMessage({
  //       type: 'FAST_CLICK',
  //       address: clipboard
  //     })
  //   } catch (error) {
  //     console.error('Error in background script:', error)
  //   }
  // })
});
