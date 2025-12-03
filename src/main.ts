import './style.css'

import { createApp, ref } from 'vue'
import { createPinia } from 'pinia'
import router from "./scripts/router";
import ui from '@nuxt/ui/vue-plugin'
import App from './App.vue'
import vue3StarRatings from "vue3-star-ratings";

const pinia = createPinia()
const app = createApp(App)

app.component("vue3-star-ratings", vue3StarRatings);

app.use(pinia)
app.use(router)
app.use(ui)
app.mount('#app')
