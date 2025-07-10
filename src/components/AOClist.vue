<template>
  <div class="aoc-list">
    <h3>Bordeaux AOCs</h3>

    <!-- Sub Region 清單 -->
    <div class="region-list">
      <div
        v-for="subRegion in subRegions"
        :key="subRegion.path"
        class="region-item"
        :class="{ active: selectedSubRegion === subRegion.path }"
        @click="selectSubRegion(subRegion.path)"
        @mouseenter="handleHoverSubRegion(subRegion.path)"
        @mouseleave="handleHoverSubRegion(null)"
      >
        <div class="region-name">{{ subRegion.displayName }}</div>
        <div class="region-count">({{ getAOCCount(subRegion.path) }})</div>
      </div>
    </div>

    <!-- AOC 列表 -->
    <div class="aoc-content">
      <div v-if="!selectedSubRegion" class="no-selection">
        <p>請選擇一個子區域查看 AOC</p>
      </div>

      <div v-else-if="loading" class="loading">
        <p>載入中...</p>
      </div>

      <div v-else-if="error" class="error">
        <p>{{ error }}</p>
      </div>

      <div v-else class="aoc-list-content">
        <h4>{{ getSelectedRegionName() }}</h4>
        <ul>
          <li
            v-for="aoc in currentAOCs"
            :key="aoc.id"
            class="aoc-item"
            :class="{
              active: activeAOCId === aoc.id,
              hovered: hoveredId === aoc.id
            }"
            @mouseenter="handleHover(aoc)"
            @mouseleave="handleHover(null)"
            @click="handleClick(aoc)"
          >
            <div class="aoc-name">{{ aoc.name }}</div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

defineProps({
  activeAOCId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['hover-aoc', 'click-aoc', 'show-sub-region', 'zoom-to-aoc', 'hover-sub-region'])

const hoveredId = ref(null)
const hoveredSubRegion = ref(null)
const selectedSubRegion = ref('')
const subRegions = ref([])
const currentAOCs = ref([])
const loading = ref(false)
const error = ref(null)

// 根據實際檔案結構定義子區域和其檔案
const regionData = {
  'Regional': {
    displayName: 'Regional AOCs',
    files: [
      'Bordeaux-Superior_AOC.geojson',
      'Bordeaux_AOC.geojson',
      'Cotes-de-Bordeaux_AOC.geojson',
      'Cremant-de-Bordeaux_AOC.geojson'
    ]
  },
  'LeftBank/Graves': {
    displayName: 'Left Bank - Graves',
    files: [
      'Graves-Superieures_AOC.geojson',
      'Graves_AOC.geojson',
      'Pessac-Leognan_AOC.geojson'
    ]
  },
  'LeftBank/Medoc': {
    displayName: 'Left Bank - Médoc',
    files: [
      'Haut-Medoc_AOC.geojson',
      'Listrac-Medoc_AOC.geojson',
      'Margaux_AOC.geojson',
      'Medoc_AOC.geojson',
      'Moulis-en-Medoc_AOC.geojson',
      'Pauillac_AOC.geojson',
      'St-Estephe_AOC.geojson',
      'St-Julien_AOC.geojson'
    ]
  },
  'RightBank/Blaye': {
    displayName: 'Right Bank - Blaye',
    files: [
      'Blaye_AOC.geojson',
      'Cotes-de-Bourg_AOC.geojson',
      'Côtes de Blaye_AOC.geojson',
      'Côtes-de-Bordeaux-Blaye_AOC.geojson',
      'Côtes-de-Bordeaux_AOC.geojson'
    ]
  },
  'RightBank/Libournais': {
    displayName: 'Right Bank - Libournais',
    files: [
      'Canon-Fronsac_AOC.geojson',
      'Castillon-Cotes-de-Bordeaux_AOC.geojson',
      'Fronsac_AOC.geojson',
      'Lalande-de-Pomerol_AOC.geojson',
      'Lussac-St-Emilion_AOC.geojson',
      'Montagne-St-Emilion_AOC.geojson',
      'Pomerol_AOC.geojson',
      'Puisseguin-St-Emilion_AOC.geojson',
      'St-Emilion-Grand-Cru_AOC.geojson',
      'St-Emilion_AOC.geojson',
      'St-Georges-St-Emilion_AOC.geojson'
    ]
  },
  'Entre-Deux-Mers': {
    displayName: 'Entre-Deux-Mers',
    files: [
      '1er-Côtes-de-Bordeaux_AOC.geojson',
      'Bordeaux Haut-Benauge_AOC.geojson',
      'Cadillac_AOC.geojson',
      'Cotes-de-Bordeaux-St-Macaire_AOC.geojson',
      'Côtes-de-Bordeaux-Cadillac_AOC.geojson',
      'Côtes-de-Bordeaux-Francs_AOC.geojson',
      'Entre-deux-Mers-Haut-Benauge_AOC.geojson',
      'Entre-Deux-Mers_AOC.geojson',
      'Graves-of-Vayres_AOC.geojson',
      'Loupiac_AOC.geojson',
      'Sainte-Croix-du-Mont_AOC.geojson',
      'St-Foy-Bordeaux_AOC.geojson'
    ]
  },
  'Sauternais': {
    displayName: 'Sauternais',
    files: [
      'Barsac_AOC.geojson',
      'Cerons_AOC.geojson',
      'Sauternes_AOC.geojson'
    ]
  }
}

// 載入子區域列表
function loadSubRegions() {
  subRegions.value = Object.keys(regionData).map(path => ({
    path,
    displayName: regionData[path].displayName
  }))
}

// 獲取 AOC 數量
function getAOCCount(subRegionPath) {
  return regionData[subRegionPath]?.files.length || 0
}

// 獲取選中區域名稱
function getSelectedRegionName() {
  return regionData[selectedSubRegion.value]?.displayName || ''
}

// 處理子區域 hover 事件
const handleHoverSubRegion = (subRegionPath) => {
  hoveredSubRegion.value = subRegionPath
  emit('hover-sub-region', subRegionPath)
}

// 選擇子區域
function selectSubRegion(subRegionPath) {
  selectedSubRegion.value = subRegionPath
  loadAOCsFromSubRegion(subRegionPath)
  emit('show-sub-region', subRegionPath)
}

// 載入 AOC 列表
function loadAOCsFromSubRegion(subRegionPath) {
  loading.value = true
  error.value = null
  currentAOCs.value = []

  try {
    const files = regionData[subRegionPath]?.files || []

    const aocs = files.map(fileName => {
      const aocName = fileName.replace('_AOC.geojson', '').replace(/-/g, ' ')
      return {
        id: fileName.replace('.geojson', ''),
        name: aocName,
        fileName: fileName,
        geojsonPath: `/geojson/${subRegionPath}/${fileName}`,
        subRegion: subRegionPath
      }
    })

    currentAOCs.value = aocs
  } catch (err) {
    console.error('載入 AOC 失敗:', err)
    error.value = '載入 AOC 資料失敗'
  } finally {
    loading.value = false
  }
}

// 處理 AOC hover 事件 - 清除所有地圖顯示
const handleHover = (aoc) => {
  if (aoc) {
    hoveredId.value = aoc.id
    emit('hover-aoc', aoc) // 這會清除所有地圖顯示
  } else {
    hoveredId.value = null
    emit('hover-aoc', null) // 回到子區域顯示
  }
}

// 處理點擊事件 - 放大到邊界
const handleClick = (aoc) => {
  emit('zoom-to-aoc', aoc)
}

// 初始化
onMounted(() => {
  loadSubRegions()
})
</script>

<style scoped>
.aoc-list {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f9f9f9;
  border-right: 1px solid #ddd;
}

h3 {
  margin: 0;
  padding: 16px;
  background: #09a0a3;
  color: white;
  font-size: 16px;
  font-weight: 600;
  border-bottom: 1px solid #ddd;
}

.region-list {
  border-bottom: 2px solid #09a0a3;
  background: white;
}

.region-item {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.region-item:hover {
  background-color: #f0f8ff;
  border-left: 3px solid #2196f3;
}

.region-item.active {
  background-color: #e3f2fd;
  border-left: 4px solid #09a0a3;
  font-weight: 600;
}

.region-name {
  font-size: 14px;
  color: #333;
}

.region-count {
  font-size: 12px;
  color: #666;
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 10px;
}

.aoc-content {
  flex: 1;
  overflow-y: auto;
}

.no-selection,
.loading,
.error {
  padding: 20px;
  text-align: center;
  color: #666;
  font-style: italic;
}

.error {
  color: #c33;
}

.aoc-list-content h4 {
  margin: 0;
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  font-size: 14px;
  color: #495057;
}

.aoc-list-content ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.aoc-item {
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 1px solid #f0f0f0;
  background: white;
}

.aoc-item:hover,
.aoc-item.hovered {
  background-color: #fff3e0;
  border-left: 3px solid #ff9800;
}

.aoc-item.active {
  background-color: #e8f5e8;
  border-left: 4px solid #4caf50;
}

.aoc-name {
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

/* 滾動條樣式 */
.aoc-content::-webkit-scrollbar {
  width: 6px;
}

.aoc-content::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.aoc-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.aoc-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
