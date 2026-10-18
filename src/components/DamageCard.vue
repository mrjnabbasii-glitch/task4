<template>
  <q-card
.damage-card {
  border-radius:16px;
  background:#102c46;
  color:white;
  border-color:rgba(255,255,255,0.12);
}

    flat
    bordered
    class="damage-card"
    
    :style="{ borderRightColor: `var(--q-${priorityColor(report.priority)})` }"
  >
    <!-- داخل کارت، یک بخش بساز -->
    <q-card-section>

      <!-- ردیف عنوان -->
      <div class="row items-start justify-between q-col-gutter-md">

        <div class="col">

          <!-- اطلاعات خرابی سمت چپ و دکمه‌ها سمت راست -->
          <div class="row items-center q-gutter-sm">

            <h3 class="text-h6 text-weight-bold q-my-none">
              {{ report.title }}
            </h3>

            <!-- اولویت -->
            <q-badge rounded :color="priorityColor(report.priority)">
              <!-- متن مناسب اولویت را نشان بده -->
              {{ priorityText(report.priority) }}
            </q-badge>

            <!-- وضعیت کار -->
            <q-badge outline rounded :color="statusMeta.color">
              {{ report.status }}
            </q-badge>

          </div>

          <!-- نمایش مکان -->
          <div class="row items-center q-gutter-x-xs text-grey-7 q-mt-sm">
            <q-icon name="place" />
            <span>{{ report.location }}</span>
          </div>

          <!-- نمایش توضیحات -->
          <p class="description q-mb-none q-mt-md">
            {{ report.description }}
          </p>

        </div>

        <!-- دکمه حذف گزارش -->
        <q-btn
          flat
          round
          dense
          color="negative"
          icon="delete_outline"
          aria-label="حذف گزارش"
          @click="emit('remove', report.id)"
        >
          <!-- کاربر موس را روی این آیکون نگه داشت، متن حذف گزارش نمایش داده می‌شود -->
          <q-tooltip>حذف گزارش</q-tooltip>
        </q-btn>

      </div>


      <!-- نمایش تصویر خرابی -->
      <q-img
        v-if="report.imageDataUrl"
        :src="report.imageDataUrl"
        :alt="`تصویر ${report.title}`"
        class="damage-image q-mt-md"
        fit="cover"
        loading="lazy"
      />

      <div
        v-else-if="report.imageName"
        class="row items-center q-gutter-x-xs text-caption text-grey-7 q-mt-md"
      >
        <q-icon name="attach_file" />
        <span>{{ report.imageName }}</span>
      </div>


      <!-- کد پیگیری و زمان ثبت خرابی -->
      <div class="metadata row items-center q-col-gutter-md q-mt-md">

        <!-- یک ستون بساز، ولی فقط به اندازه محتوایش فضا بگیرد -->
        <div class="col-auto">
          <span class="text-blue">کد پیگیری:</span>
          <strong dir="ltr">{{ report.trackingCode }}</strong>
        </div>

        <div class="col-auto">
          <span class="text-blue">زمان ثبت:</span>
          {{ formattedDate }}
        </div>

      </div>

    </q-card-section>


    <q-separator />

<!-- تغییر وضعیت گزارش خرابی -->
    <q-card-actions align="right" class="q-pa-md">
      <q-btn
        v-if="report.status === 'در انتظار بررسی فنی'"
        outline
        color="warning"
        icon="construction"
        label="شروع تعمیر"
        @click="emit('change-status', report.id, 'در حال تعمیر')"
      />

<!-- تغییر وضعیت گزارش به رفع شده -->
      <q-btn
        v-if="report.status !== 'رفع شده'"
        unelevated
        color="positive"
        icon="check_circle"
        label="رفع خرابی"
        @click="emit('change-status', report.id, 'رفع شده')"
      />

<!-- نمایش وضعیت تکمیل عملیات پس از رفع خرابی -->
      <q-chip
        v-else
        color="positive"
        text-color="white"
        icon="task_alt"
      >
        عملیات تکمیل شده
      </q-chip>

    </q-card-actions>

  </q-card>
</template>
<script setup>
import { computed } from 'vue'
// دریافت اطلاعات گزارش خرابی از کامپوننت والد
const props = defineProps({
  report: {
    type: Object,
    required: true
  }
})
//مشخص کن این کامپوننت چه رویدادهایی می‌تواند به والد ارسال کند.
const emit = defineEmits({   
  'change-status': (id, status) =>
    typeof id === 'string' && typeof status === 'string',

  remove: (id) =>
    typeof id === 'string'
})

// تبدیل اولویت خرابی به رنگ مناسب
const priorityColor = (priority) => {
  const colors = {
    critical: 'negative',
    warning: 'warning',
    medium: 'warning',
    normal: 'positive'
  }

  return colors[priority] || colors.normal
}

//تبدیل متن اولویت به فارسی
const priorityText = (priority) => {
  const labels = {
    critical: 'بحرانی',
    warning: 'فوری',
    medium: 'فوری',
    normal: 'عادی'
  }

  return labels[priority] || labels.normal
}

// تبدیل وضعیت خرابی به تنظیمات نمایشی
const statusMeta = computed(() => {
  const statuses = {
    'رفع شده': { color: 'positive' },
    'در حال تعمیر': { color: 'warning' },
    'در انتظار بررسی فنی': { color: 'primary' }
  }

  return statuses[props.report.status] ||
    statuses['در انتظار بررسی فنی']
})

// تبدیل تاریخ ثبت خرابی به فرمت فارسی 
const formattedDate = computed(() => {
  const date = new Date(props.report.createdAt)

  if (Number.isNaN(date.getTime())) {
    return 'نامشخص'
  }

  return new Intl.DateTimeFormat('fa-IR', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date)
})
</script>