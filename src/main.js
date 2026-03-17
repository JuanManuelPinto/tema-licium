import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

/**
 * Punto de entrada principal de la aplicación.
 * Configuramos Vue, añadimos el enrutador y montamos el componente principal.
 */

const app = createApp(App)

// Usar el enrutador para la navegación entre páginas
app.use(router)

// Montar la aplicación en el elemento #app del HTML
app.mount('#app')
