// src/utils/testStrapi.ts
export async function testStrapiConnection() {
  const baseUrl = 'http://localhost:1337';

  console.log('=== 🚀 Strapi 連接測試開始 ===');

  // 步驟 1: 測試基本連接
  try {
    console.log('🔍 步驟 1: 測試基本連接...');

    const response = await fetch(`${baseUrl}`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000) // 5秒超時
    });

    if (response.ok) {
      console.log('✅ Strapi 基本連接成功');
    } else {
      console.log('⚠️ Strapi 基本連接有問題，但繼續測試...');
    }
  } catch (error) {
    console.error('❌ Strapi 基本連接失敗:', error);
    console.log('💡 請確保 Strapi 正在運行在 http://localhost:1337');
    return false;
  }

  // 步驟 2: 測試 API 端點
  try {
    console.log('🔍 步驟 2: 測試 API 端點...');

    const apiResponse = await fetch(`${baseUrl}/api`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000)
    });

    if (apiResponse.ok) {
      console.log('✅ API 端點連接成功');
      const apiData = await apiResponse.json();
      console.log('📄 API 資訊:', apiData);
    } else {
      console.error('❌ API 端點連接失敗:', apiResponse.status, apiResponse.statusText);
      return false;
    }
  } catch (error) {
    console.error('❌ API 端點測試失敗:', error);
    return false;
  }

  // 步驟 3: 測試 AOC Content Type
  try {
    console.log('🔍 步驟 3: 測試 AOC Content Type...');

    const aocResponse = await fetch(`${baseUrl}/api/aocs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000)
    });

    if (aocResponse.ok) {
      const aocData = await aocResponse.json();
      console.log('✅ AOC Content Type 存在');
      console.log('📊 AOC 資料筆數:', aocData.data?.length || 0);

      if (aocData.data && aocData.data.length > 0) {
        console.log('📝 第一筆 AOC 資料:', aocData.data[0]);
      } else {
        console.log('⚠️ AOC Content Type 存在但沒有資料');
      }
    } else if (aocResponse.status === 404) {
      console.log('⚠️ AOC Content Type 尚未建立');
      console.log('💡 請在 Strapi 管理介面建立 AOC Content Type');
    } else {
      console.error('❌ AOC API 測試失敗:', aocResponse.status, aocResponse.statusText);
    }
  } catch (error) {
    console.error('❌ AOC Content Type 測試失敗:', error);
  }

  // 步驟 4: 測試權限設定
  try {
    console.log('🔍 步驟 4: 測試 API 權限...');

    const permissionResponse = await fetch(`${baseUrl}/api/aocs?pagination[limit]=1`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000)
    });

    if (permissionResponse.ok) {
      console.log('✅ API 權限設定正確');
    } else if (permissionResponse.status === 403) {
      console.log('❌ API 權限未開放');
      console.log('💡 請在 Strapi 管理介面設定 Public 角色的 AOC 權限');
    } else {
      console.log('⚠️ API 權限測試結果:', permissionResponse.status);
    }
  } catch (error) {
    console.error('❌ API 權限測試失敗:', error);
  }

  console.log('=== 🏁 Strapi 連接測試完成 ===');
  return true;
}

// 測試使用 Service 類別
export async function testStrapiService() {
  console.log('=== 🔧 測試 Strapi Service 類別 ===');

  try {
    // 動態導入服務類別
    const { strapiService } = await import('@/services/strapiService');

    // 測試健康檢查
    console.log('🔍 測試健康檢查...');
    const isHealthy = await strapiService.healthCheck();
    console.log('健康檢查結果:', isHealthy);

    if (isHealthy) {
      // 測試獲取 AOC 資料
      console.log('🔍 測試獲取 AOC 資料...');
      const aocs = await strapiService.getAllAOCs({ populate: '*' });
      console.log('✅ 成功載入 AOC 資料:', aocs.length, '筆');

      if (aocs.length > 0) {
        console.log('📝 第一筆 AOC 資料:', aocs[0]);
      }
    }
  } catch (error) {
    console.error('❌ Strapi Service 測試失敗:', error);
  }

  console.log('=== 🏁 Service 測試完成 ===');
}

// 測試完整的前端整合
export async function testFrontendIntegration() {
  console.log('=== 🌐 測試前端整合 ===');

  try {
    // 測試 Composable
    const { useAOCs } = await import('@/composables/useStrapi');

    const { loadAOCs, aocs, loading, error } = useAOCs();

    console.log('🔍 測試 Composable...');
    await loadAOCs({
      populate: '*',
      locale: 'zh-TW'
    });

    console.log('載入狀態:', loading.value);
    console.log('錯誤狀態:', error.value);
    console.log('AOC 資料:', aocs.value.length, '筆');

  } catch (error) {
    console.error('❌ 前端整合測試失敗:', error);
  }

  console.log('=== 🏁 前端整合測試完成 ===');
}

// 檢查必要的檔案是否存在
export function checkRequiredFiles() {
  console.log('=== 📁 檢查必要檔案 ===');

  const requiredFiles = [
    'services/strapiService.ts',
    'services/types.ts',
    'composables/useStrapi.ts'
  ];

  requiredFiles.forEach(file => {
    try {
      // 嘗試動態導入檔案
      import(`@/${file}`);
      console.log(`✅ ${file} 存在`);
    } catch (error) {
      console.log(`❌ ${file} 不存在或有錯誤`);
      console.error(error);
    }
  });
}
