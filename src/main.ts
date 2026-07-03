import { createApp } from 'vue'
// Full Element Plus stylesheet. Template components get styles via the
// auto-import resolver, but programmatic ones (ElMessageBox) don't — without
// this the founder-access dialog renders unstyled in the page corner.
import 'element-plus/dist/index.css'
import './style.css'
import App from './App.vue'

createApp(App).mount('#app')
