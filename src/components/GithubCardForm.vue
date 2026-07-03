<script setup lang="ts">
import { ref } from 'vue'
import { TIER_OPTIONS, type Tier } from '../utils/canvasCard'

const emit = defineEmits<{ generate: [input: string] }>()

defineProps<{ loading: boolean; founderMode: boolean }>()

const input = ref('')
const forcedTier = defineModel<Tier | ''>('forcedTier', { default: '' })

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
    <el-select
      v-if="founderMode"
      v-model="forcedTier"
      size="large"
      class="github-card-form__tier"
      placeholder="Card face"
      clearable
    >
      <el-option label="Auto (from stats)" value="" />
      <el-option
        v-for="option in TIER_OPTIONS"
        :key="option.value"
        :label="option.label"
        :value="option.value"
      />
    </el-select>
  </form>
</template>

<style scoped>
.github-card-form {
  display: flex;
  gap: 8px;
  width: 100%;
  max-width: 420px;
  flex-wrap: wrap;
}

.github-card-form :deep(.el-input) {
  flex: 1;
}

.github-card-form__tier {
  flex-basis: 100%;
}

@media (max-width: 480px) {
  .github-card-form {
    flex-direction: column;
  }
}
</style>
