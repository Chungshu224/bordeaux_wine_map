<script setup lang="ts">
import { ref, onMounted, defineExpose } from 'vue'
import mapboxgl from 'mapbox-gl'
import * as turf from '@turf/turf'

const mapContainer = ref<HTMLDivElement | null>(null)
const map = ref<mapboxgl.Map | null>(null)
const is3DEnabled = ref(false)
const hoveredLayerId = ref<string | null>(null)
const activeLayerId = ref<string | null>(null)
let popup: mapboxgl.Popup | null = null

mapboxgl.accessToken = 'pk.eyJ1IjoiY2h1bmdzaHVsZWUiLCJhIjoiY21ja3B0NHBzMDBxMzJpc2Q3b2Zzam9qYSJ9.9gYjm_VnBH7MYA-e9zKkCw'

// 根據實際檔案結構定義檔案對照表
const fileMap = {
  'Regional': [
    'Bordeaux-Superior_AOC.geojson',
    'Bordeaux_AOC.geojson',
    'Cotes-de-Bordeaux_AOC.geojson',
    'Cremant-de-Bordeaux_AOC.geojson'
  ],
  'LeftBank/Graves': [
    'Graves-Superieures_AOC.geojson',
    'Graves_AOC.geojson',
    'Pessac-Leognan_AOC.geojson'
  ],
  'LeftBank/Medoc': [
    'Haut-Medoc_AOC.geojson',
    'Listrac-Medoc_AOC.geojson',
    'Margaux_AOC.geojson',
    'Medoc_AOC.geojson',
    'Moulis-en-Medoc_AOC.geojson',
    'Pauillac_AOC.geojson',
    'St-Estephe_AOC.geojson',
    'St-Julien_AOC.geojson'
  ],
  'RightBank/Blaye': [
    'Blaye_AOC.geojson',
    'Cotes-de-Bourg_AOC.geojson',
    'Côtes de Blaye_AOC.geojson',
    'Côtes-de-Bordeaux-Blaye_AOC.geojson',
    'Côtes-de-Bordeaux_AOC.geojson'
  ],
  'RightBank/Libournais': [
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
  ],
  'Entre-Deux-Mers': [
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
  ],
  'Sauternais': [
    'Barsac_AOC.geojson',
    'Cerons_AOC.geojson',
    'Sauternes_AOC.geojson'
  ]
}

// 載入 geojson 檔案
async function loadGeoJSON(geojsonPath: string) {
  try {
    const res = await fetch(geojsonPath)
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }
    return await res.json()
  } catch (error) {
    console.error(`Failed to load geojson from ${geojsonPath}:`, error)
    return null
  }
}

// 移除圖層
const removeLayer = (id: string) => {
  if (!map.value) return
  if (map.value.getLayer(`${id}-fill`)) map.value.removeLayer(`${id}-fill`)
  if (map.value.getLayer(`${id}-outline`)) map.value.removeLayer(`${id}-outline`)
  if (map.value.getSource(id)) map.value.removeSource(id)
}

// 取得對比色
const getContrastColor = (id: string) => {
  const hash = Array.from(id).reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const hue = (hash * 47) % 360
  return `hsl(${hue}, 70%, 50%)`
}

// 顯示圖層
const showLayer = async (id: string, geojsonPath: string, opacity = 0.1) => {
  const data = await loadGeoJSON(geojsonPath)
  if (!map.value || !data || map.value.getLayer(`${id}-fill`)) return

  map.value.addSource(id, {
    type: 'geojson',
    data
  })

  map.value.addLayer({
    id: `${id}-fill`,
    type: 'fill',
    source: id,
    paint: {
      'fill-color': getContrastColor(id),
      'fill-opacity': opacity
    }
  })

  map.value.addLayer({
    id: `${id}-outline`,
    type: 'line',
    source: id,
    paint: {
      'line-color': '#FFFFFF',
      'line-width': 2
    }
  })

  return data
}

// 清除所有圖層
const clearAllLayers = () => {
  if (!map.value) return

  // 取得所有圖層並移除
  const layers = map.value.getStyle().layers
  const layersToRemove = layers
    .filter(layer => layer.id.includes('-fill') || layer.id.includes('-outline'))
    .map(layer => layer.id.replace('-fill', '').replace('-outline', ''))

  // 使用 Set 去重
  const uniqueLayerIds = [...new Set(layersToRemove)]
  uniqueLayerIds.forEach(id => removeLayer(id))

  // 清除狀態
  hoveredLayerId.value = null
  activeLayerId.value = null

  if (popup) {
    popup.remove()
    popup = null
  }
}

// Hover 子區域 (預覽該區域的所有 AOC)
const hoverSubRegion = async (subRegionPath: string | null) => {
  if (!subRegionPath) {
    // 如果沒有 hover 的子區域，回到初始狀態
    await resetMap()
    return
  }

  clearAllLayers()

  const files = fileMap[subRegionPath] || []
  const bounds = new mapboxgl.LngLatBounds()

  for (const fileName of files) {
    const geojsonPath = `/geojson/${subRegionPath}/${fileName}`
    const data = await showLayer(`hover-${fileName.replace('.geojson', '')}`, geojsonPath, 0.15)

    if (data) {
      const bbox = turf.bbox(data)
      bounds.extend([bbox[0], bbox[1]])
      bounds.extend([bbox[2], bbox[3]])
    }
  }

  if (!bounds.isEmpty() && map.value) {
    map.value.fitBounds(bounds, {
      padding: 120,
      duration: 600,
      pitch: is3DEnabled.value ? 60 : 0,
      bearing: is3DEnabled.value ? -20 : 0
    })
  }
}

// 顯示子區域 (點選後)
const showSubRegion = async (subRegionPath: string) => {
  clearAllLayers()

  const files = fileMap[subRegionPath] || []
  const bounds = new mapboxgl.LngLatBounds()

  for (const fileName of files) {
    const geojsonPath = `/geojson/${subRegionPath}/${fileName}`
    const data = await showLayer(fileName.replace('.geojson', ''), geojsonPath, 0.1)

    if (data) {
      const bbox = turf.bbox(data)
      bounds.extend([bbox[0], bbox[1]])
      bounds.extend([bbox[2], bbox[3]])
    }
  }

  if (!bounds.isEmpty() && map.value) {
    map.value.fitBounds(bounds, {
      padding: 80,
      duration: 1000,
      pitch: is3DEnabled.value ? 60 : 0,
      bearing: is3DEnabled.value ? -20 : 0
    })
  }
}

// 高亮 AOC (已移除，現在 hover AOC 時清除地圖)
const highlightAOC = async (aocData: any) => {
  // 不做任何事，hover AOC 時地圖會被清除
}

// 清除 hover 效果
const clearHoverLayer = () => {
  // 不做任何事，保持現有狀態
}

// 縮放到 AOC (click 效果)
const zoomToAOC = async (aocData: any) => {
  clearAllLayers()

  const data = await showLayer('current-aoc', aocData.geojsonPath, 0.1)

  if (data && map.value) {
    activeLayerId.value = 'current-aoc'

    const bbox = turf.bbox(data)
    const centerCoords = turf.center(data).geometry.coordinates
    const center: [number, number] = [centerCoords[0], centerCoords[1]]

    map.value.fitBounds(bbox as [number, number, number, number], {
      padding: 50,
      duration: 1000,
      pitch: is3DEnabled.value ? 60 : 0,
      bearing: is3DEnabled.value ? -20 : 0
    })

    // 顯示 popup
    popup?.remove()
    popup = new mapboxgl.Popup({
      closeButton: true,
      closeOnClick: false,
      offset: 10
    })
      .setLngLat(center)
      .setHTML(`
        <div style="text-align: center;">
          <strong>${aocData.name}</strong>
        </div>
      `)
      .addTo(map.value)
  }
}

// 重設地圖 (顯示波爾多全區)
const resetMap = async () => {
  clearAllLayers()

  const data = await showLayer('Bordeaux_AOC', '/geojson/Regional/Bordeaux_AOC.geojson', 0.1)

  if (data && map.value) {
    activeLayerId.value = 'Bordeaux_AOC'

    const bbox = turf.bbox(data)
    map.value.fitBounds(bbox as [number, number, number, number], {
      padding: 80,
      duration: 1000,
      pitch: is3DEnabled.value ? 60 : 0,
      bearing: is3DEnabled.value ? -20 : 0
    })
  }
}

// 3D 地形功能
const enable3DTerrain = () => {
  if (!map.value) return
  if (!map.value.getSource('mapbox-dem')) {
    map.value.addSource('mapbox-dem', {
      type: 'raster-dem',
      url: 'mapbox://mapbox.terrain-rgb',
      tileSize: 512,
      maxzoom: 14
    })
  }
  map.value.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 })
  if (!map.value.getLayer('sky')) {
    map.value.addLayer({
      id: 'sky',
      type: 'sky',
      paint: {
        'sky-type': 'atmosphere',
        'sky-atmosphere-sun': [0.0, 0.0],
        'sky-atmosphere-sun-intensity': 15
      }
    })
  }
  map.value.easeTo({ pitch: 60, bearing: -20, duration: 1000 })
  is3DEnabled.value = true
}

const disable3DTerrain = () => {
  if (!map.value) return
  map.value.setTerrain(null)
  if (map.value.getLayer('sky')) {
    map.value.removeLayer('sky')
  }
  map.value.easeTo({ pitch: 0, bearing: 0, duration: 1000 })
  is3DEnabled.value = false
}

const toggle3DTerrain = () => {
  if (is3DEnabled.value) {
    disable3DTerrain()
  } else {
    enable3DTerrain()
  }
}

onMounted(() => {
  if (!mapContainer.value) return
  map.value = new mapboxgl.Map({
    container: mapContainer.value,
    style: 'mapbox://styles/mapbox/satellite-v9',
    center: [-0.45, 44.85],
    zoom: 8
  })

  map.value.on('load', async () => {
    // 初始顯示波爾多全區
    await resetMap()
  })

  map.value.addControl(new mapboxgl.NavigationControl(), 'top-right')
})

defineExpose({
  highlightAOC,
  clearHoverLayer,
  clearAllLayers,
  zoomToAOC,
  showSubRegion,
  hoverSubRegion,
  resetMap
})
</script>

<template>
  <div class="map-container" ref="mapContainer">
    <button class="toggle-3d-btn" @click="toggle3DTerrain">
      {{ is3DEnabled ? '關閉 3D 地形' : '啟用 3D 地形' }}
    </button>
  </div>
</template>

<style scoped>
.map-container {
  width: 100%;
  height: 100vh;
  position: relative;
}

.toggle-3d-btn {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 10;
  padding: 8px 12px;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.toggle-3d-btn:hover {
  background-color: #f5f5f5;
}
</style>
