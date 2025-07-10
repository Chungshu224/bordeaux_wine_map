<template>
  <div class="app-container">
    <!-- 載入狀態 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner">載入中...</div>
    </div>

    <!-- 錯誤訊息 -->
    <div v-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="retryLoad">重新載入</button>
    </div>

    <!-- 主要內容 -->
    <div v-else class="content">
      <div class="aoc-list-container">
        <AOCList
          :activeAOCId="activeAOCId"
          @hover-aoc="handleHoverAOC"
          @show-sub-region="handleShowSubRegion"
          @zoom-to-aoc="handleZoomToAOC"
          @hover-sub-region="handleHoverSubRegion"
        />
        <div class="footer">
          <p>滑鼠移至子區域可預覽該區域</p>
          <p>點選子區域查看詳細清單</p>
          <p>滑鼠移至 AOC 清除地圖顯示</p>
          <p>點選 AOC 放大至邊界</p>
        </div>
      </div>

      <div class="map-wrapper">
        <MapView
          ref="mapView"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AOCList from './components/AOCList.vue'
import MapView from './components/MapView.vue'

interface MapViewMethods {
  highlightAOC: (aocData: any) => void
  clearHoverLayer: () => void
  clearAllLayers: () => void
  zoomToAOC: (aocData: any) => void
  showSubRegion: (subRegionPath: string) => void
  hoverSubRegion: (subRegionPath: string | null) => void
  resetMap: () => void
}

const mapView = ref<MapViewMethods | null>(null)

// 狀態
const loading = ref(false)
const error = ref<string | null>(null)
const activeAOCId = ref<string>('')
const currentSelectedSubRegion = ref<string>('')

// 初始化
async function initialize() {
  loading.value = true
  error.value = null

  try {
    // 模擬初始化延遲
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log('✅ 應用程式初始化完成')
  } catch (err) {
    error.value = err instanceof Error ? err.message : '初始化失敗'
    console.error('❌ 初始化失敗:', err)
  } finally {
    loading.value = false
  }
}

// 處理子區域 hover 事件 - 顯示該子區域所有 AOC
const handleHoverSubRegion = (subRegionPath: string | null) => {
  console.log('Hover 子區域:', subRegionPath)
  mapView.value?.hoverSubRegion(subRegionPath)
}

// 處理子區域點選事件 - 顯示 AOC 清單
const handleShowSubRegion = (subRegionPath: string) => {
  console.log('顯示子區域:', subRegionPath)
  currentSelectedSubRegion.value = subRegionPath
  mapView.value?.showSubRegion(subRegionPath)
  activeAOCId.value = '' // 清除活動的 AOC
}

// 處理 AOC hover 事件 - 清除所有地圖顯示
const handleHoverAOC = (aocData: any) => {
  if (aocData) {
    console.log('Hover AOC - 清除地圖:', aocData.name)
    mapView.value?.clearAllLayers()
  } else {
    // 滑鼠離開 AOC 時，回到子區域顯示
    if (currentSelectedSubRegion.value) {
      console.log('離開 AOC - 回到子區域顯示')
      mapView.value?.showSubRegion(currentSelectedSubRegion.value)
    }
  }
}

// 處理 AOC 點選事件 - 放大到邊界
const handleZoomToAOC = (aocData: any) => {
  console.log('縮放至 AOC:', aocData)
  activeAOCId.value = aocData.id
  mapView.value?.zoomToAOC(aocData)
}

const retryLoad = () => {
  initialize()
}

// 初始化載入
onMounted(() => {
  initialize()
})
</script>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  background: white;
  padding: 20px;
  border-radius: 8px;
  font-size: 18px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.error-message {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #fee;
  color: #c33;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #fcc;
  z-index: 1000;
}

.error-message button {
  margin-top: 8px;
  padding: 8px 16px;
  background: #c33;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.content {
  display: flex;
  width: 100%;
  height: 100%;
}

.aoc-list-container {
  width: 15%;
  min-width: 280px;
  max-width: 350px;
  border-right: 1px solid #09a0a3;
  background: #f9f9f9;
  display: flex;
  flex-direction: column;
}

.map-wrapper {
  width: 85%;
  position: relative;
  height: 100vh;
}

.footer {
  padding: 12px 16px;
  border-top: 1px solid #ddd;
  background: #fff;
  font-size: 11px;
  color: #666;
  margin-top: auto;
}

.footer p {
  margin: 2px 0;
}
</style>
