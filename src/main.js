import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

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

// Renderizado de la aplicación en el contenedor HTML con id 'app'
app.mount('#app')

