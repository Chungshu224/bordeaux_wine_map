<template>
  <div class="aoc-list">
    <h3>Bordeaux AOCs</h3>
    <ul>
      <li
        v-for="aoc in aocList"
        :key="aoc.id"
        @mouseover="handleHover(aoc.id)"
        @mouseleave="handleHover(null)"
        @click="handleClick(aoc.id)"
        :class="{
          active: activeAOCId === aoc.id,
          hovered: hoveredId === aoc.id
        }"
      >
        <div class="aoc-name">{{ aoc.name }}</div>
        <div class="aoc-name-zh" v-if="aoc.nameZh">{{ aoc.nameZh }}</div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  aocList: {
    type: Array,
    required: true
  },
  activeAOCId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['hover-aoc', 'click-aoc'])

const hoveredId = ref(null)

const handleHover = (id) => {
  hoveredId.value = id
  emit('hover-aoc', id)
}

const handleClick = (id) => {
  emit('click-aoc', id)
}
</script>

<style scoped>
.aoc-list {
  width: 100%;
  height: 100vh;
  overflow-y: auto;
  font-size: 12px;
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

.aoc-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.aoc-list li {
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #f0f0f0;
}

.aoc-list li:hover,
.aoc-list li.hovered {
  background-color: #e3f2fd;
}

.aoc-list li.active {
  background-color: #e8f5e8;
  border-left: 3px solid #4caf50;
}

.aoc-name {
  font-weight: 500;
  color: #333;
  margin-bottom: 2px;
}

.aoc-name-zh {
  font-size: 11px;
  color: #666;
}
</style>
