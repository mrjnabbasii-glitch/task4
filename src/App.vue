<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="app-header">
      <q-toolbar class="app-toolbar">
        <q-avatar color="white" text-color="primary" icon="anchor" />

        <q-toolbar-title>
          <div class="text-weight-bold">مرکز کنترل عملیات بندری</div>
          <div class="toolbar-subtitle">سامانه ثبت و پایش خرابی‌ها</div>
        </q-toolbar-title>

        
       
      </q-toolbar>
    </q-header>
    <q-page-container>
      <IndexPage />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import IndexPage from './pages/IndexPage.vue'//کامپوننت صفحه اصلی را بیاور.
</script>
<style scoped>

.app-header {
  background: #0B4F6C;
}

.app-toolbar {
  min-height: 70px;
}

.toolbar-subtitle {
  font-size: 12px;
  opacity: 0.8;
}

</style>