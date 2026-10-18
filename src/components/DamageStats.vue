<template>
  <!-- نمایش کارت‌های آماری خرابی‌ -->
  <section class="row q-col-gutter-md q-mb-lg" aria-label="آمار خرابی‌ها">
    <div
      v-for="stat in stats"
      :key="stat.label"
      class="col-12 col-sm-4"
    >
    <!-- ساخت کارت آماری شامل آیکون و اطلاعات مربوط به هر شاخص -->
      <q-card flat bordered class="stat-card full-height">
        <q-card-section class="row items-center no-wrap q-gutter-md">
          <q-avatar :color="stat.color" text-color="white" size="54px">
            <q-icon :name="stat.icon" size="28px" />
          </q-avatar>

          <div>
            <!-- نمایش مقدار و عنوان هر شاخص آماری -->
            <div class="stat-value" :class="`text-${stat.color}`">
              {{ stat.value }}
            </div>
            <div class="text-grey-7">{{ stat.label }}</div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </section>
</template>
//برای وصل کردن کامپوننت به Pinia Store
<script setup>
import { computed } from 'vue'
import { useDamageStore } from 'src/stores/damageStore'

const store = useDamageStore()

const stats = computed(() => [
  {
    label: 'کل خرابی‌ها',
    value: store.totalReports,
    icon: 'assignment',
    color: 'primary'
  },
  {
    label: 'بحرانی حل‌نشده',
    value: store.criticalReports,
    icon: 'warning',
    color: 'negative'
  },
  {
    label: 'موارد رفع‌شده',
    value: store.resolvedReports,
    icon: 'task_alt',
    color: 'positive'
  }
])
</script>

<style scoped>
.stat-card {
  border-radius: 16px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(18, 50, 70, 0.08);
}
/* استایل نمایش عدد  آماری */  
.stat-value {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1.1;
}
</style>
