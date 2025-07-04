<template>
  <div class="aoc-list">
    <ul>
      <li
        v-for="aoc in aocList"
        :key="aoc.id"
        @mouseover="handleHover(aoc.id)"
        @mouseleave="handleHover(null)"
        @click="handleClick(aoc.id)"
        :class="{ active: hoveredId === aoc.id }"
      >
        {{ aoc.name }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  aocList: {
    type: Array,
    required: true
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
  width: 250px;
  height: 100vh;
  overflow-y: auto;
  font-size: 12px;
  background-color: #f9f9f9;
  border-right: 1px solid #ddd;
  padding: 10px;
}

.aoc-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.aoc-list li {
  padding: 6px 10px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.aoc-list li:hover,
.aoc-list li.active {
  background-color: #e0e0e0;
}
</style>
