<script setup lang="ts">
import { ref, onMounted, defineProps, defineExpose } from 'vue'
import mapboxgl from 'mapbox-gl'
import * as turf from '@turf/turf'

interface AOC {
  id: string
  name: string
  nameZh?: string
  slug: string
  region: string
  subRegion?: string
  geojsonPath?: string
}

const props = defineProps<{
  aocList: AOC[]
  initialAOCId: string
}>()

const defaultAOCId = props.initialAOCId || 'bordeaux'
const mapContainer = ref<HTMLDivElement | null>(null)
const map = ref<mapboxgl.Map | null>(null)
const is3DEnabled = ref(false)
const hoveredLayerId = ref<string | null>(null)
const activeLayerId = ref<string | null>(null)
let popup: mapboxgl.Popup | null = null

mapboxgl.accessToken = 'pk.eyJ1IjoiY2h1bmdzaHVsZWUiLCJhIjoiY21ja3B0NHBzMDBxMzJpc2Q3b2Zzam9qYSJ9.9gYjm_VnBH7MYA-e9zKkCw'

// 根據 aocId 找到 AOC 資料和 geojson 路徑
function findAOCById(aocId: string): AOC | null {
  return props.aocList.find(aoc => aoc.id === aocId) || null
}

function getGeoJsonPath(aoc: AOC): string {
  if (aoc.geojsonPath) return aoc.geojsonPath

  // 構建預設路徑
  const subRegion = aoc.subRegion || aoc.region
  return `/geojson/${aoc.region}/${subRegion}/${aoc.slug}.geojson`
}

// 載入 geojson 檔案
async function loadGeoJSON(aocId: string) {
  const aoc = findAOCById(aocId)
  if (!aoc) {
    // 特殊處理 bordeaux
    if (aocId === 'bordeaux' || aocId === 'Bordeaux_AOC') {
      const res = await fetch('/geojson/Regional/Bordeaux_AOC.geojson')
      return await res.json()
    }
    return null
  }

  const path = getGeoJsonPath(aoc)
  try {
    const res = await fetch(path)
    return await res.json()
  } catch (error) {
    console.error(`Failed to load geojson for ${aocId}:`, error)
    return null
  }
}

const removeLayer = (id: string) => {
  if (!map.value) return
  if (map.value.getLayer(`${id}-fill`)) map.value.removeLayer(`${id}-fill`)
  if (map.value.getLayer(`${id}-outline`)) map.value.removeLayer(`${id}-outline`)
  if (map.value.getSource(id)) map.value.removeSource(id)
}

const getContrastColor = (id: string) => {
  const hash = Array.from(id).reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const hue = (hash * 47) % 360
  return `hsl(${hue}, 70%, 50%)`
}

const showLayer = async (id: string, opacity = 0.2) => {
  const data = await loadGeoJSON(id)
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
}

// 清除所有圖層與互動紀錄
function clearAllLayersAndState() {
  clearAllLayers()
  hoveredLayerId.value = null
  activeLayerId.value = null
  if (popup) popup.remove()
  popup = null
}

const clearAllLayers = () => {
  if (!map.value) return
  props.aocList.forEach(aoc => removeLayer(aoc.id))
  removeLayer('bordeaux')
  removeLayer('Bordeaux_AOC')
  if (popup) popup.remove()
}

const highlightAOC = async (id: string) => {
  if (id === activeLayerId.value || id === hoveredLayerId.value) return

  // 清除之前的 hover layer
  if (hoveredLayerId.value && hoveredLayerId.value !== activeLayerId.value) {
    removeLayer(hoveredLayerId.value)
  }

  await showLayer(id, 0.3)
  hoveredLayerId.value = id
}

const clearHoverLayer = () => {
  if (hoveredLayerId.value && hoveredLayerId.value !== activeLayerId.value) {
    removeLayer(hoveredLayerId.value)
    hoveredLayerId.value = null
  }
}

const zoomToAOC = async (id: string) => {
  if (!map.value) return

  // 清除所有圖層
  clearAllLayers()

  activeLayerId.value = id
  hoveredLayerId.value = null

  const data = await loadGeoJSON(id)
  if (!data) return

  const bbox = turf.bbox(data)
  const centerCoords = turf.center(data).geometry.coordinates
  const center: [number, number] = [centerCoords[0], centerCoords[1]]

  await showLayer(id, 0.4)

  map.value.fitBounds(bbox as [number, number, number, number], {
    padding: 80,
    duration: 1000,
    pitch: is3DEnabled.value ? 60 : 0,
    bearing: is3DEnabled.value ? -20 : 0
  })

  // 顯示 popup
  const aoc = findAOCById(id)
  const displayName = aoc?.name || id

  popup?.remove()
  popup = new mapboxgl.Popup({ closeButton: false, closeOnClick: false })
    .setLngLat(center)
    .setHTML(`<strong>${displayName}</strong>`)
    .addTo(map.value!)
}

const resetMap = async () => {
  clearAllLayersAndState()
  await zoomToAOC('bordeaux')
}

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
    await showLayer('bordeaux', 0.2)
    activeLayerId.value = 'bordeaux'
  })

  map.value.addControl(new mapboxgl.NavigationControl(), 'top-right')
})

defineExpose({
  highlightAOC,
  clearHoverLayer,
  zoomToAOC,
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
