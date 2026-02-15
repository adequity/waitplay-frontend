<template>
  <div class="settings-tab">
    <div class="settings-header">
      <h1>설정</h1>
    </div>

    <div class="settings-sections">
      <!-- Store Code Management Section -->
      <section class="settings-section">
        <StoreCodeManagement />
      </section>

      <!-- Divider -->
      <div class="section-divider"></div>

      <!-- Affiliation Request Section -->
      <section class="settings-section">
        <AffiliationRequest />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import StoreCodeManagement from '@/components/StoreCodeManagement.vue'
import AffiliationRequest from '@/components/AffiliationRequest.vue'
</script>

<style scoped>
.settings-tab {
  min-height: 100%;
  background: #f5f5f7;
}

.settings-header {
  padding: 24px 24px 0;
}

.settings-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0;
}

.settings-sections {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.settings-section {
  background: white;
  border-radius: 16px;
  margin: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.section-divider {
  height: 0;
}

@media (max-width: 768px) {
  .settings-header {
    padding: 16px 16px 0;
  }

  .settings-header h1 {
    font-size: 24px;
  }

  .settings-section {
    margin: 12px;
    border-radius: 12px;
  }
}
</style>
