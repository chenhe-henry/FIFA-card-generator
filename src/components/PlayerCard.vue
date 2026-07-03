<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { CARD_HEIGHT, CARD_WIDTH, drawPlayerCard, loadAvatarImage, type CardRenderData } from '../utils/canvasCard'

const props = defineProps<{
  data: CardRenderData
  avatarUrl: string
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)

async function render(): Promise<void> {
  if (!canvasRef.value) return
  // Draw immediately without the avatar so a slow/broken image load never leaves a blank card.
  drawPlayerCard(canvasRef.value, props.data, null)

  const avatarImage = await loadAvatarImage(props.avatarUrl)
  if (avatarImage && canvasRef.value) {
    drawPlayerCard(canvasRef.value, props.data, avatarImage)
  }
}

function download(): void {
  if (!canvasRef.value) return
  const link = document.createElement('a')
  link.download = `${props.data.handle}-card.png`
  link.href = canvasRef.value.toDataURL('image/png')
  link.click()
}

onMounted(render)
watch(() => [props.data, props.avatarUrl], render, { deep: true })

defineExpose({ download })
</script>

<template>
  <div class="player-card">
    <canvas ref="canvasRef" :width="CARD_WIDTH" :height="CARD_HEIGHT" class="player-card__canvas" />
    <el-button class="player-card__download" @click="download">Download PNG</el-button>
  </div>
</template>

<style scoped>
.player-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.player-card__canvas {
  width: 100%;
  max-width: 320px;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}
</style>
