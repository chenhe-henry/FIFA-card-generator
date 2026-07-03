<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{ generate: [input: string] }>()

defineProps<{ loading: boolean }>()

const input = ref('')

function submit(): void {
  if (!input.value.trim()) return
  emit('generate', input.value)
}
</script>

<template>
  <form class="github-card-form" @submit.prevent="submit">
    <el-input
      v-model="input"
      placeholder="GitHub username or profile link"
      size="large"
      :disabled="loading"
    />
    <el-button type="primary" size="large" native-type="submit" :loading="loading">
      Generate card
    </el-button>
  </form>
</template>

<style scoped>
.github-card-form {
  display: flex;
  gap: 8px;
  width: 100%;
  max-width: 420px;
}

.github-card-form :deep(.el-input) {
  flex: 1;
}

@media (max-width: 480px) {
  .github-card-form {
    flex-direction: column;
  }
}
</style>
