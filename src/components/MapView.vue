<template>
  <div ref="mapContainer" class="map-container"></div>
</template>

<script setup lang="ts">
defineOptions({ name: 'WineMapView' })
import { onMounted, ref } from 'vue'
import mapboxgl from 'mapbox-gl'
import { defineExpose } from 'vue'
import * as turf from '@turf/turf'
const geojsonDataMap = new Map<string, GeoJSON.FeatureCollection>()

mapboxgl.accessToken = 'pk.eyJ1IjoiY2h1bmdzaHVsZWUiLCJhIjoiY21ja3B0NHBzMDBxMzJpc2Q3b2Zzam9qYSJ9.9gYjm_VnBH7MYA-e9zKkCw'

const mapContainer = ref<HTMLDivElement | null>(null)
const map = ref<mapboxgl.Map | null>(null)

const geojsonList = [
  { id: 'Bordeaux_AOC', name: 'Bordeaux AOC', url: '/geojson/Bordeaux_AOC.geojson' },
  { id: 'Medoc_AOC', name: 'Medoc AOC', url: '/geojson/Medoc_AOC.geojson' }
]

const getRandomColor = (): string => {
  const r = Math.floor(Math.random() * 200)
  const g = Math.floor(Math.random() * 200)
  const b = Math.floor(Math.random() * 200)
  return `rgb(${r},${g},${b})`
}

const loadGeoJSONLayers = async () => {
  for (const aoc of geojsonList) {
    const res = await fetch(aoc.url)
    const data = await res.json()
    geojsonDataMap.set(aoc.id, data)

    if (map.value) {
      map.value.addSource(aoc.id, {
        type: 'geojson',
        data: data
      })

      map.value.addLayer({
        id: aoc.id,
        type: 'fill',
        source: aoc.id,
        layout: {},
        paint: {
          'fill-color': getRandomColor(),
          'fill-opacity': 0.3,
          'fill-outline-color': '#ffffff'
        }
      })

      map.value.on('mouseenter', aoc.id, () => {
        map.value!.getCanvas().style.cursor = 'pointer'
      })

      map.value.on('mouseleave', aoc.id, () => {
        map.value!.getCanvas().style.cursor = ''
      })

      map.value.on('click', aoc.id, (e: mapboxgl.MapLayerMouseEvent) => {
        if (!e.features || e.features.length === 0) return
        const bbox = turf.bbox(e.features[0])
        const center = turf.center(data).geometry.coordinates
        const lngLat: [number, number] = [center[0], center[1]]

        map.value!.fitBounds(bbox as [number, number, number, number], {
          padding: 40,
          duration: 1000
        })

        new mapboxgl.Popup()
          .setLngLat(lngLat)
          .setHTML(`<strong>${aoc.name}</strong>`)
          .addTo(map.value!)
      })
    }
  }
}

const highlightAOC = (id: string) => {
  if (!id || !geojsonDataMap.has(id)) return

  const center = turf.center(data).geometry.coordinates
  const lngLat: [number, number] = [center[0], center[1]]

  map.value?.flyTo({
    center: lngLat,
    zoom: 9.5,
    speed: 0.5,
    essential: true
  })

  new mapboxgl.Popup()
    .setLngLat(lngLat)
    .setHTML(`<strong>${id}</strong>`)
    .addTo(map.value!)
    .addTo(map.value!)
}

const zoomToAOC = (id: string) => {
  if (!id || !geojsonDataMap.has(id)) return

  const center = turf.center(data).geometry.coordinates
  const lngLat: [number, number] = [center[0], center[1]]

  map.value?.fitBounds(bbox as [number, number, number, number], {
    padding: 40,
    duration: 1000
  })

  new mapboxgl.Popup()
    .setLngLat(lngLat)
    .setHTML(`<strong>${id}</strong>`)
    .addTo(map.value!)
    .setHTML(`<strong>${id}</strong>`)
    .addTo(map.value!)
}

onMounted(() => {
  map.value = new mapboxgl.Map({
    container: mapContainer.value!,
    style: 'mapbox://styles/mapbox/satellite-v9',
    center: [-0.45, 44.85],
    zoom: 8
  })

  map.value.on('load', () => {
    loadGeoJSONLayers()
  })
})

defineExpose({
  highlightAOC,
  zoomToAOC
})
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100vh;
}
</style>
