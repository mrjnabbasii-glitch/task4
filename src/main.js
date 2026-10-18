import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Quasar, Dialog, Notify } from 'quasar'

import '@fontsource/vazirmatn/400.css'
import '@fontsource/vazirmatn/500.css'
import '@fontsource/vazirmatn/600.css'
import '@fontsource/vazirmatn/700.css'
import '@fontsource/vazirmatn/800.css'
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'
import './styles/app.scss'

import App from './App.vue'

const app = createApp(App)

app.use(createPinia())
app.use(Quasar, {
  plugins: {
    Dialog,
    Notify
  },
  config: {
    brand: {
      primary: '#0b4f6c',
      secondary: '#167d9a',
      accent: '#f4a261',
      positive: '#23856d',
      negative: '#c83e4d',
      warning: '#d98e04',
      dark: '#102a3a'
    },
    notify: {
      position: 'top',
      timeout: 3000
    }
  }
})

app.mount('#app')
