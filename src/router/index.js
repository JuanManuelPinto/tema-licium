import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RecordDetail from '../views/RecordDetail.vue'
import CollectionsView from '../views/CollectionsView.vue'
import CollectionDetail from '../views/CollectionDetail.vue'
import SearchView from '../views/SearchView.vue'
import RecordsView from '../views/RecordsView.vue'
import RecordMediaView from '../views/RecordMediaView.vue'
import MediaDetail from '../views/MediaDetail.vue'

/**
 * CONFIGURACIÓN DEL ENRUTADOR DE LA APLICACIÓN
 * 
 * Este archivo define la arquitectura de navegación de la SPA, mapeando
 * las rutas del navegador a los componentes de vista correspondientes
 * y gestionando el comportamiento de desplazamiento entre transiciones.
 */

const router = createRouter({
     // Uso del historial de navegación de HTML5 para URLs limpias
     history: createWebHistory(import.meta.env.BASE_URL),
     routes: [
          {
               path: '/',
               name: 'home',
               component: HomeView,
          },
          {
               path: '/records',
               name: 'explore',
               component: RecordsView,
          },
          {
               path: '/record/:id',
               name: 'record-detail',
               component: RecordDetail,
          },
          {
               path: '/collections',
               name: 'collections',
               component: CollectionsView,
          },
          {
               path: '/collection/:id',
               name: 'collection-detail',
               component: CollectionDetail,
          },
          {
               path: '/search',
               name: 'search',
               component: SearchView,
          },
          {
               path: '/record/:id/media',
               name: 'record-media',
               component: RecordMediaView,
          },
          {
               path: '/media/:id',
               name: 'media-detail',
               component: MediaDetail,
          },
     ],
     /**
      * Comportamiento del scroll al cambiar de ruta.
      * Garantiza que el usuario comience en la parte superior de la nueva página,
      * a menos que regrese mediante la navegación del historial (atrás/adelante).
      */
     scrollBehavior(to, from, savedPosition) {
          return savedPosition || { top: 0 }
     }
})

export default router

