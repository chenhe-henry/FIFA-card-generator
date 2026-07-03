<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <el-container class="app-shell">
    <el-header class="app-header">
      <span class="app-title">fifa-card-generator</span>
    </el-header>
    <el-main class="app-main">
      <el-card class="welcome-card">
        <h1>Welcome to fifa-card-generator</h1>
        <p>Vue 3 + TypeScript + Element Plus, mobile-responsive out of the box.</p>
        <el-button type="primary" @click="count++">Clicked {{ count }} times</el-button>
      </el-card>
    </el-main>
  </el-container>
</template>

<style scoped>
.app-shell {
  min-height: 100svh;
}

.app-header {
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--el-border-color);
}

.app-title {
  font-size: 1.25rem;
  font-weight: 600;
}

.app-main {
  display: flex;
  justify-content: center;
  padding: 16px;
}

.welcome-card {
  width: 100%;
  max-width: 480px;
  text-align: center;
}

@media (max-width: 480px) {
  .app-main {
    padding: 8px;
  }
}
</style>
