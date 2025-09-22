import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './style.css'

// Import pages
import Dashboard from './pages/Dashboard.vue'
import Repository from './pages/Repository.vue'
import Settings from './pages/Settings.vue'

const routes = [
  { path: '/', component: Dashboard },
  { path: '/repo', component: Repository },
  { path: '/settings', component: Settings }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
