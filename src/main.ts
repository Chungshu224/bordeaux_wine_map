// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { strapiService } from './services/strapiService'
import {
  testStrapiConnection,
  testStrapiService,
  testFrontendIntegration,
  checkRequiredFiles
} from './utils/testStrapi'

const app = createApp(App)

app.use(router)
app.mount('#app')

// 定義 window.testStrapi 的型別
declare global {
  interface Window {
    testStrapi: {
      basic: typeof testStrapiConnection,
      service: typeof testStrapiService,
      integration: typeof testFrontendIntegration,
      checkFiles: typeof checkRequiredFiles,
      diagnostic: () => ReturnType<typeof strapiService.diagnosticConnection>,
      healthCheck: () => ReturnType<typeof strapiService.healthCheck>
    }
  }
}

// 添加全域測試函數 (開發階段)
if (import.meta.env.DEV) {
  console.log('🚀 開發模式：開始 Strapi 測試');

  // 將測試函數添加到 window 物件，方便在瀏覽器控制台使用
  window.testStrapi = {
    basic: testStrapiConnection,
    service: testStrapiService,
    integration: testFrontendIntegration,
    checkFiles: checkRequiredFiles,
    diagnostic: () => strapiService.diagnosticConnection(),
    healthCheck: () => strapiService.healthCheck()
  };

  console.log('💡 在控制台執行: window.testStrapi.diagnostic() 來測試連接');
}
