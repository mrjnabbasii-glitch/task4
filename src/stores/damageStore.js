import { defineStore } from 'pinia'

const STORAGE_KEY = 'port-damage-reports-v1'

const isBrowser = () => typeof window !== 'undefined'

//ساخت کد پیگیری
const createTrackingCode = () => {
  const timePart = Date.now().toString().slice(-6)
  const randomPart = Math.floor(10 + Math.random() * 90)
  return `PORT-${timePart}-${randomPart}`
}
//عتبارسنجی گزارش ذخیره‌شده
const isValidReport = (report) => {
  return (
    report &&
    typeof report === 'object' &&
    typeof report.id === 'string' &&
    typeof report.title === 'string' &&
    typeof report.description === 'string' &&
    typeof report.location === 'string' &&
    ['normal', 'warning', 'medium', 'critical'].includes(report.priority) &&
    ['در انتظار بررسی فنی', 'در حال تعمیر', 'رفع شده'].includes(report.status)
  )
}
 
export const useDamageStore = defineStore('damage', {
  state: () => ({
  reports: [],
  storageLoaded: false,
  lastCreatedReport: null
}),
  //شمارش کل خرابی
  getters: {
    totalReports: (state) => state.reports.length,

    //خرابی های بحرانی حل نشده
    criticalReports: (state) =>
      state.reports.filter(
        (report) => report.priority === 'critical' && report.status !== 'رفع شده'
      ).length,
   //خرابی های حل شده
    resolvedReports: (state) =>
      state.reports.filter((report) => report.status === 'رفع شده').length
  },
 //ثبت گزارش جدید
  actions: {
    addReport(report) {
      //ساخت شناسه گزارش
      const id =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`
     //ساخت شی گزارش جدید
      const newReport = {
        id,
        trackingCode: createTrackingCode(),
        title: report.title.trim(),
        description: report.description.trim(),
        location: report.location,
        priority: report.priority,
        status: 'در انتظار بررسی فنی',
        imageName: report.imageName || null,
        imageDataUrl: report.imageDataUrl || null,
        createdAt: new Date().toISOString()
      }
    //اضافه کردن گزارش به آرایه
      this.reports.push(newReport)

this.lastCreatedReport = newReport

this.saveToStorage()

return newReport
    },
    //تغییر وضعیت گزارش  
    updateStatus(id, status) {
      const allowedStatuses = ['در انتظار بررسی فنی', 'در حال تعمیر', 'رفع شده']

      //بررسی معتبر بودن وضعیت
      if (!allowedStatuses.includes(status)) return false

   //پیدا کردن گزارش موردنظر
      const report = this.reports.find((item) => item.id === id)
      if (!report) return false
   //تغییر وضغیت
      report.status = status
      this.saveToStorage()
      return true
    },
   //حدف گزارش 
    removeReport(id) {
      const initialLength = this.reports.length    //نگهداری تعداد اولیه
      this.reports = this.reports.filter((report) => report.id !== id)
      if (this.reports.length === initialLength) return false
      this.saveToStorage()
      return true
    },
    saveToStorage() {
      if (!isBrowser()) return      //اگر برنامه در مرورگر اجرا نشده باشد، تابع متوقف می‌شود.

      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.reports))
      } catch (error) {
        console.error('ذخیره گزارش‌ها در مرورگر انجام نشد:', error)
      }
    },

    loadFromStorage() {
      if (!isBrowser()) {
        this.storageLoaded = true
        return
      }

      try {
        const savedData = window.localStorage.getItem(STORAGE_KEY)//دریافت اظلاعات دخیره شده
        if (!savedData) return
        const parsed = JSON.parse(savedData)
        // پیدا کردن گزارش موردنظر
        if (Array.isArray(parsed)) {//بررسی می‌کند که داده‌ی خوانده‌شده واقعاً آرایه باشد
          this.reports = parsed
            .filter(isValidReport)
            .map((report) => ({
              ...report,
              priority: report.priority === 'medium' ? 'warning' : report.priority
            }))
        }
        //گرفتن خطای داده‌های خراب
      } catch (error) {
        console.error('داده ذخیره‌شده معتبر نیست:', error)
        window.localStorage.removeItem(STORAGE_KEY)
      } finally {
        this.storageLoaded = true
      }
    }
  }
})
