import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RecordDetail from '../views/RecordDetail.vue'
import CollectionsView from '../views/CollectionsView.vue'
import CollectionDetail from '../views/CollectionDetail.vue'
import SearchView from '../views/SearchView.vue'
import RecordsView from '../views/RecordsView.vue'

/**
 * Configuración de las rutas de la aplicación.
 * Define qué componente se muestra según la URL visitada.
 */

const router = createRouter({
     history: createWebHistory(import.meta.env.BASE_URL),
     routes: [
          {
               path: '/',
               name: 'home',
               component: HomeView, // Página de inicio
          },
          {
               path: '/explore',
               name: 'explore',
               component: RecordsView, // Catálogo completo de registros
          },
          {
               path: '/record/:id',
               name: 'record-detail',
               component: RecordDetail, // Detalle de un registro individual
          },
          {
               path: '/collections',
               name: 'collections',
               component: CollectionsView, // Listado de todas las colecciones
          },
          {
               path: '/collections/:id',
               name: 'collection-detail',
               component: CollectionDetail, // Detalle de una colección y sus obras
          },
          // {
          //      path: '/search',
          //      name: 'search',
          //      component: SearchView, // Buscador avanzado
          // },
     ],
     // Comportamiento del scroll: volver siempre arriba al cambiar de página
     scrollBehavior(to, from, savedPosition) {
          return savedPosition || { top: 0 }
     }
})

export default router
