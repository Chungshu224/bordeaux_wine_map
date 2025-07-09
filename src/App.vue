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
          :aocList="allAOCs"
          :activeAOCId="activeAOCId"
          @hover-aoc="handleHoverAOC"
          @click-aoc="handleClickAOC"
        />
        <div class="footer">
          <p>Click on an AOC to zoom in</p>
          <p>Hover to highlight on map</p>
        </div>
      </div>

      <div class="map-wrapper">
        <MapView
          ref="mapView"
          :aocList="allAOCs"
          :initialAOCId="'bordeaux'"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AOCList from './components/AOCList.vue'
import MapView from './components/MapView.vue'
import { getAllAOCs, type LocalAOC } from './utils/importAOCData'

interface MapViewMethods {
  highlightAOC: (id: string) => void
  clearHoverLayer: () => void
  zoomToAOC: (id: string) => void
  resetMap: () => void
}

const mapView = ref<MapViewMethods | null>(null)

// 本地資料狀態
const loading = ref(false)
const error = ref<string | null>(null)
const aocs = ref<LocalAOC[]>([])
const activeAOCId = ref<string>('bordeaux')

// 載入本地資料
async function loadAOCs() {
  loading.value = true
  error.value = null

  try {
    // 模擬載入延遲
    await new Promise(resolve => setTimeout(resolve, 500))

    aocs.value = getAllAOCs()

    console.log('✅ 本地 AOC 資料載入成功，共', aocs.value.length, '筆')
  } catch (err) {
    error.value = err instanceof Error ? err.message : '載入失敗'
    console.error('❌ 載入 AOC 資料失敗:', err)
  } finally {
    loading.value = false
  }
}

// 扁平化的 AOC 列表
const allAOCs = computed(() => {
  return aocs.value.map(aoc => ({
    id: aoc.id,
    name: aoc.name,
    nameZh: aoc.nameZh,
    region: aoc.region,
    subRegion: aoc.subRegion,
    slug: aoc.slug,
    description: aoc.description,
    area: aoc.area,
    established: aoc.established,
    wineTypes: aoc.wineTypes,
    grapeVarieties: aoc.grapeVarieties,
    geojsonPath: `/geojson/${aoc.region}/${aoc.subRegion || aoc.region}/${aoc.slug}.geojson`
  }))
})

// 事件處理函數
const handleHoverAOC = (id: string | null) => {
  if (id) {
    mapView.value?.highlightAOC(id)
  } else {
    mapView.value?.clearHoverLayer()
  }
}

const handleClickAOC = (id: string) => {
  activeAOCId.value = id
  mapView.value?.zoomToAOC(id)
}

const retryLoad = () => {
  loadAOCs()
}

// 初始化載入
onMounted(() => {
  loadAOCs()
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
  min-width: 200px;
  max-width: 300px;
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
  padding: 16px;
  border-top: 1px solid #ddd;
  background: #fff;
  font-size: 12px;
  color: #666;
  margin-top: auto;
}
</style>
