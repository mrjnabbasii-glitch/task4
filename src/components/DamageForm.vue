<template>
  <q-card flat bordered class="form-card">
    
    <q-card-section class="form-heading">
      <div class="row items-center q-gutter-sm">
        <q-icon name="add_circle" color="primary" size="28px" />
        <div>
          <h2 class="text-h6 text-weight-bold q-my-none">ثبت خرابی جدید</h2>
          <div class="text-caption text-text-blue-grey-2">اطلاعات حادثه را کامل وارد کنید</div>
        </div>
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <q-form
        ref="damageForm"
        class="q-gutter-md"
        greedy
        @submit.prevent="submitForm"
        @reset="resetForm"
      >
        <q-input
          v-model.trim="form.title"
          outlined
          label="عنوان خرابی *"
          maxlength="100"
          counter
          :rules="requiredRules"
        >
          <template #prepend>
            <q-icon name="report_problem" />
          </template>
        </q-input>

        <q-input
          v-model.trim="form.description"
          outlined
          type="textarea"
          rows="4"
          label="شرح مشکل *"
          maxlength="1000"
          counter
          :rules="requiredRules"
        />

        <q-select
          v-model="form.location"
          outlined
          emit-value
          map-options
          label="محل وقوع خرابی *"
          :options="locationOptions"
          :rules="requiredRules"
        >
          <template #prepend>
            <q-icon name="place" />
          </template>
        </q-select>

        <fieldset class="priority-fieldset">
          <legend class="text-subtitle2">سطح اولویت *</legend>
          <q-btn-group spread class="priority-buttons">
            <q-btn
              v-for="option in priorityOptions"
              :key="option.value"
              type="button"
              no-caps
              :label="option.label"
              :icon="option.icon"
              :color="option.color"
              :outline="form.priority !== option.value"
              :unelevated="form.priority === option.value"
              :aria-pressed="form.priority === option.value"
              @click="form.priority = option.value"
            />
          </q-btn-group>
        </fieldset>

        <q-file
          v-model="form.image"
          outlined
          clearable
          accept="image/*"
          label="تصویر خرابی (حداکثر ۲ مگابایت)"
          :rules="imageRules"
          @rejected="onRejected"
        >
          <template #prepend>
            <q-icon name="attach_file" />
          </template>
        </q-file>

        <div class="row q-col-gutter-sm">
          <div class="col-12 col-sm">
            <q-btn
              type="submit"
              color="primary"
              unelevated
              icon="send"
              label="ثبت گزارش خرابی"
              class="full-width"
              :loading="submitting"
            />
          </div>

          <div class="col-12 col-sm-auto">
            <q-btn
  type="reset"
  flat
  text-color="dark-blue"
  icon="restart_alt"
  label="پاک کردن"
/>
          </div>
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useDamageStore } from 'src/stores/damageStore'

const emit = defineEmits({
  created: (report) => Boolean(report?.id)
})

const $q = useQuasar()
const store = useDamageStore()
const damageForm = ref(null)
const submitting = ref(false)

const MAX_IMAGE_SIZE = 2 * 1024 * 1024

const locationOptions = [
  { label: 'اسکله شماره ۱', value: 'اسکله شماره ۱' },
  { label: 'اسکله شماره ۲', value: 'اسکله شماره ۲' },
  { label: 'محوطه کانتینری', value: 'محوطه کانتینری' },
  { label: 'انبار مرکزی', value: 'انبار مرکزی' },
  { label: 'جرثقیل ساحلی', value: 'جرثقیل ساحلی' },
  { label: 'خط بارگیری', value: 'خط بارگیری' }
]

const priorityOptions = [
  { label: 'عادی', value: 'normal', icon: 'check_circle', color: 'positive' },
  { label: 'فوری', value: 'warning', icon: 'error', color: 'warning' },
  { label: 'بحرانی', value: 'critical', icon: 'warning', color: 'negative' }
]

const requiredRules = [
  (val) => !!val || 'این فیلد الزامی است'
]

const imageRules = [
  (file) => !file || file.type?.startsWith('image/') || 'فقط فایل تصویری مجاز است',
  (file) => !file || file.size <= MAX_IMAGE_SIZE || 'حجم تصویر باید کمتر از ۲ مگابایت باشد'
]

const emptyForm = () => ({
  title: '',
  description: '',
  location: null,
  priority: 'normal',
  image: null
})

const form = reactive(emptyForm())

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })

const submitForm = async () => {
  submitting.value = true

  try {
    const imageDataUrl = form.image ? await fileToDataUrl(form.image) : null
    const newReport = store.addReport({
      title: form.title,
      description: form.description,
      location: form.location,
      priority: form.priority,
      imageName: form.image?.name || null,
      imageDataUrl
    })

    $q.notify({
      type: 'positive',
      icon: 'check_circle',
      message: `گزارش ثبت شد — کد پیگیری ${newReport.trackingCode}`
    })

    emit('created', newReport)
    resetForm()
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: 'خواندن تصویر یا ثبت گزارش انجام نشد'
    })
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  Object.assign(form, emptyForm())
  damageForm.value?.resetValidation()
}

const onRejected = () => {
  $q.notify({
    type: 'negative',
    message: 'فایل انتخاب‌شده قابل قبول نیست'
  })
}
</script>

<style scoped>
.form-card {
  border-radius: 18px;
  overflow: hidden;
}

.form-heading {
  background: linear-gradient(135deg, rgba(11, 79, 108, 0.08), rgba(22, 125, 154, 0.03));
}

.priority-fieldset {
  margin: 0;
  padding: 12px;
  border: 1px solid rgba(0, 0, 0, 0.18);
  border-radius: 4px;
}

.priority-fieldset legend {
  padding-inline: 6px;
}

.priority-buttons {
  box-shadow: none;
}

.priority-buttons :deep(.q-btn) {
  min-height: 44px;
  font-weight: 700;
}

@media (max-width: 420px) {
  .priority-buttons :deep(.q-btn__content) {
    gap: 2px;
  }

  .priority-buttons :deep(.q-btn) {
    padding-inline: 6px;
  }
}
</style>
