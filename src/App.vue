<script setup lang="ts">
import { ref } from 'vue'
import GithubCardForm from './components/GithubCardForm.vue'
import PlayerCard from './components/PlayerCard.vue'
import { fetchGithubProfile, GitHubApiError, parseGithubUsername } from './services/github'
import { computeCardStats } from './utils/cardStats'
import type { CardRenderData } from './utils/canvasCard'

const loading = ref(false)
const errorMessage = ref('')
const card = ref<CardRenderData | null>(null)
const avatarUrl = ref('')

async function generate(input: string): Promise<void> {
  const username = parseGithubUsername(input)
  loading.value = true
  errorMessage.value = ''
  card.value = null

  try {
    const profile = await fetchGithubProfile(username)
    const stats = computeCardStats(profile)
    avatarUrl.value = profile.user.avatar_url
    card.value = {
      displayName: profile.user.name ?? profile.user.login,
      handle: profile.user.login,
      stats,
    }
  } catch (error) {
    errorMessage.value =
      error instanceof GitHubApiError ? error.message : 'Something went wrong. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <el-container class="app-shell">
    <el-header class="app-header">
      <span class="app-title">fifa-card-generator</span>
    </el-header>
    <el-main class="app-main">
      <p class="app-subtitle">Turn a GitHub profile into an EAFC26-style player card.</p>
      <GithubCardForm :loading="loading" @generate="generate" />
      <el-alert v-if="errorMessage" :title="errorMessage" type="error" class="app-error" show-icon />
      <PlayerCard v-if="card" :data="card" :avatar-url="avatarUrl" class="app-card" />
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
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px 16px;
}

.app-subtitle {
  text-align: center;
  color: var(--el-text-color-secondary);
  max-width: 420px;
}

.app-error {
  max-width: 420px;
}

.app-card {
  margin-top: 8px;
}

@media (max-width: 480px) {
  .app-main {
    padding: 16px 8px;
  }
}
</style>
