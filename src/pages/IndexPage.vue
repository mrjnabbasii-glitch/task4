<template>

  <!-- صفحه اصلی داشبورد مدیریت خرابی‌ها -->
  <q-page padding class="page-background" dir="rtl">

    <!-- محتوای اصلی صفحه -->
    <main class="content-container">

      <!-- عنوان صفحه و وضعیت کلی سیستم -->
      <section class="page-intro q-mb-lg">

        <div>
         <h1 class="text-h4 text-weight-bolder q-my-none text-white">
  داشبورد مدیریت خرابی‌ها
</h1>

<p class="text-blue-grey-2 q-mb-none q-mt-xs">
  ثبت، اولویت‌بندی و پیگیری عملیات تعمیر تجهیزات بندر
</p>

          
        </div>

        <!-- نمایش وضعیت سلامت سیستم -->
        <q-chip
          :color="store.criticalReports ? 'negative' : 'positive'"
          text-color="white"
          :icon="store.criticalReports ? 'warning' : 'verified'"
        >
          {{ healthLabel }}
        </q-chip>

      </section>


      <!-- نمایش کارت‌های آماری -->
      <DamageStats />


      <!-- بخش فرم ثبت و لیست خرابی‌ها -->
      <div class="row q-col-gutter-lg items-start">

        <!-- فرم ثبت خرابی جدید -->
        <aside class="col-12 col-md-5 col-lg-4 sticky-form">
          <DamageForm @created="handleCreated" />
        </aside>


        <!-- لیست گزارش‌های ثبت شده -->
        <section
          class="col-12 col-md-7 col-lg-8"
          aria-labelledby="reports-title"
        >

          <!-- عنوان بخش گزارش‌ها -->
          <div class="row items-center justify-between q-mb-md">

            <div>
              <h2 
 id="reports-title"
 class="text-h6 text-weight-bold q-my-none text-white"
>
 خرابی‌های ثبت‌شده
</h2>

              <div class="text-caption text-blue-grey-2">
 جدیدترین گزارش‌ها در ابتدای فهرست
</div>
            </div>

            <!-- تعداد کل گزارش‌ها -->
            <q-badge rounded color="primary" class="q-px-sm q-py-xs">
              {{ store.totalReports }} مورد
            </q-badge>

          </div>


          <!-- نمایش حالت بدون گزارش -->
          <q-card
            v-if="store.storageLoaded && store.reports.length === 0"
            flat
            bordered
            class="empty-state text-center q-pa-xl"
          >
            <q-icon name="inventory_2" size="64px" color="grey-5" />
            <div class="text-h6 text-grey-8 q-mt-md">
              هنوز گزارشی ثبت نشده است
            </div>
            <div class="text-grey-6 q-mt-xs">
              اولین خرابی را از فرم مقابل ثبت کنید
            </div>
          </q-card>


          <!-- نمایش وضعیت بارگذاری اطلاعات -->
          <q-skeleton
            v-else-if="!store.storageLoaded"
            type="rect"
            height="220px"
            class="rounded-borders"
          />


          <!-- نمایش کارت‌های خرابی -->
          <TransitionGroup v-else name="report-list">

       <!-- ارسال اطلاعات  گزارش به کامپوننت کارت برای نمایش جزئیات -->
            <DamageCard
              v-for="report in reversedReports"
              :key="report.id"
              :report="report"  
              @change-status="changeStatus"
              @remove="confirmRemove"
            />

          </TransitionGroup>

        </section>

      </div>

    </main>

  </q-page>

</template>


<script setup>

import { computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'


// کامپوننت‌های مورد استفاده در صفحه
import DamageCard from 'src/components/DamageCard.vue'
import DamageForm from 'src/components/DamageForm.vue'
import DamageStats from 'src/components/DamageStats.vue'
import { useDamageStore } from 'src/stores/damageStore'


// اتصال به امکانات Quasar و Store
const $q = useQuasar()
const store = useDamageStore()


// مرتب‌سازی گزارش‌ها از جدیدترین به قدیمی‌ترین
const reversedReports = computed(() => [...store.reports].reverse())


// تعیین متن وضعیت کلی سیستم
const healthLabel = computed(() =>
  store.criticalReports
    ? `${store.criticalReports} هشدار بحرانی فعال`
    : 'وضعیت عملیاتی پایدار'
)


// بارگذاری اطلاعات ذخیره شده هنگام ورود صفحه
onMounted(() => {
  store.loadFromStorage()
})


// دریافت رویداد ثبت موفق خرابی از فرم ثبت گزارش
const handleCreated = () => {
}


// تغییر وضعیت گزارش خرابی
const changeStatus = (id, status) => {

  if (!store.updateStatus(id, status)) return

  $q.notify({
    type: 'info',
    icon: 'sync',
    message: `وضعیت گزارش به «${status}» تغییر کرد`
  })
}


// حذف گزارش با تأیید کاربر
const confirmRemove = (id) => {
  $q.dialog({
    title: 'حذف گزارش',
    message: 'این گزارش برای همیشه از مرورگر حذف می‌شود.',
    cancel: {
      label: 'انصراف',
      flat: true
    },
    ok: {
      label: 'حذف',
      color: 'negative',
      unelevated: true
    },
    persistent: true
  }).onOk(() => {
    store.removeReport(id)

    $q.notify({
      type: 'positive',
      icon: 'delete',
      message: 'گزارش با موفقیت حذف شد'
    })
  })
}

// بررسی ثبت خرابی بحرانی جدید برای نمایش حالت هشتدار
let initialLoadFinished = false

onMounted(() => {
  store.loadFromStorage()

  // بعد از بارگذاری اطلاعات قبلی، اجازه بررسی گزارش جدید داده شود
  initialLoadFinished = true
})
// بررسی ثبت گزارش جدید و نمایش هشدار در صورت بحرانی بودن خرابی
watch(
  () => store.lastCreatedReport,
  (newReport) => {

    if (!newReport) return

    if (newReport.priority !== 'critical') return


    $q.notify({
      type: 'negative',
      icon: 'warning',
      message: `هشدار: خرابی بحرانی جدید در ${newReport.location} ثبت شد!`
    })

  }
)



</script>

<style scoped>

/* پس‌زمینه اصلی داشبورد با نور آبی ملایم */
.page-background {
  min-height: 100%;

  background:
    radial-gradient(
      circle at top right,
      rgba(0, 166, 200, 0.18),
      transparent 350px
    ),
    #12344D;
}

/* محدود کردن عرض محتوای صفحه */
.content-container {
}


/* چیدمان عنوان صفحه */

.page-intro {
  padding-top: 20px;
  margin-bottom: 30px;
}

.page-intro {
  background: rgba(255,255,255,0.05);
  padding: 20px;
  border-radius: 16px;
}

/* استایل حالت بدون گزارش */
.empty-state {
}


/* انیمیشن ورود و خروج کارت‌های خرابی */
.report-list-enter-active,
.report-list-leave-active {
}


/* حالت اولیه و خروج کارت‌ها */
.report-list-enter-from,
.report-list-leave-to {
}


/* ثابت کردن فرم در دسکتاپ */
.sticky-form {
}


/* تنظیم نمایش موبایل */
@media (max-width: 599px) {

}

</style>
