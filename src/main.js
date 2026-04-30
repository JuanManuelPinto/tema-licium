import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import liciumFx from './plugins/fx.js'
import { workspacePlugin } from './plugins/workspace/index.js'

/**
 * Punto de entrada principal de la aplicación.
 * 
 * Se encarga de inicializar la instancia de Vue, integrar el enrutador
 * y montar el componente raíz (App.vue) en el elemento DOM correspondiente.
 */

// Creación de la instancia de la aplicación Vue
const app = createApp(App)

// Integración del sistema de rutas (Vue Router) para la navegación SPA
app.use(router)

// Integración de efectos visuales UI (Tilt, Zoom)
app.use(liciumFx)

// Integración del Portafolio Personal (Plugin con activación global)
app.use(workspacePlugin)

// Renderizado de la aplicación en el contenedor HTML con id 'app'
app.mount('#app')

