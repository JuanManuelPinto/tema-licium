<template>
     <div class="container section-padding fade-in">
          <!-- Encabezado de la página: Identificación del catálogo -->
          <header class="page-header">
               <h1 class="page-title">Catálogo de <span class="highlight">Registros</span></h1>
               <p class="page-subtitle">Explora todos los registros disponibles.</p>
          </header>

          <!-- Barra de Herramientas: Control de visualización y métricas de resultados -->
          <div class="toolbar" v-if="!loading">
               <div class="view-options">
                    <button v-for="mode in ['grid', 'list', 'magazine']" :key="mode" @click="viewMode = mode"
                         :class="{ 'active': viewMode === mode }">
                         {{ mode }}
                    </button>
               </div>
               <div class="results-info">Mostrando {{ itemsPerPage }} de {{ totalItems }} resultados</div>
          </div>

          <!-- Área de visualización de contenidos -->
          <div v-if="loading" class="loading-wrapper"><span class="loader"></span></div>
          <div v-else>
               <div :class="['grid-system', `view-${viewMode}`]">
                    <!-- Renderizado dinámico de tarjetas de registro -->
                    <CommonCard v-for="(record, idx) in records" :key="record.id" :item="record" type="record"
                         :view-mode="viewMode" :reverse="idx % 2 !== 0" />
               </div>

               <!-- Navegación paginada de los registros -->
               <ThePagination :current-page="currentPage" :total-items="totalItems" :items-per-page="itemsPerPage"
                    @change="onPageChange" />
          </div>
     </div>
</template>

<script setup>
/**
 * Vista RecordsView.
 * 
 * Gestiona el catálogo general de registros. Proporciona una interfaz fluida
 * para navegar por grandes conjuntos de datos, permitiendo al usuario cambiar
 * el modo de visualización y paginar los resultados, manteniendo el estado
 * sincronizado con la URL para facilitar la navegación historial.
 */

import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import CommonCard from '../components/CommonCard.vue';
import ThePagination from '../components/ThePagination.vue';

const route = useRoute();
const router = useRouter();

// Estado reactivo del componente
const records = ref([]);
const loading = ref(true);
const viewMode = ref('grid');
const currentPage = ref(1);
const totalItems = ref(0);
const itemsPerPage = ref(24);

// Configuración de visualizaciones permitidas
const allowedViewModes = new Set(['grid', 'list', 'magazine']);
const isSyncingFromRoute = ref(false);

/**
 * Normaliza y valida el índice de la página desde los parámetros de la URL.
 */
const parsePage = (p) => {
     const n = Number.parseInt(String(p ?? ''), 10);
     return Number.isFinite(n) && n > 0 ? n : 1;
};

/**
 * Valida que el modo de visualización esté dentro de los estándares del sistema.
 */
const parseView = (v) => {
     const s = String(v ?? '');
     return allowedViewModes.has(s) ? s : 'grid';
};

/**
 * Inicializa el estado reactivo basándose en los parámetros query de la ruta actual.
 */
const syncStateFromRoute = () => {
     isSyncingFromRoute.value = true;
     viewMode.value = parseView(route.query.view);
     currentPage.value = parsePage(route.query.page);
     isSyncingFromRoute.value = false;
};

/**
 * Actualiza los parámetros de la URL para reflejar los cambios realizados en la UI.
 * Utiliza 'push' para habilitar la navegación regresiva del navegador.
 */
const pushStateToRoute = async () => {
     if (isSyncingFromRoute.value) return;
     const nextQuery = {
          ...route.query,
          view: viewMode.value,
          page: String(currentPage.value),
     };

     // Optimización: Detener la navegación si el estado destino es idéntico al actual
     if (route.query.view === nextQuery.view && String(route.query.page ?? '') === nextQuery.page) return;

     await router.push({ query: nextQuery });
};

/**
 * Recupera el lote de registros del servidor correspondiente a la página actual.
 */
const fetchRecords = async () => {
     loading.value = true;
     const offset = (currentPage.value - 1) * itemsPerPage.value;
     try {
          const res = await axios.get('/api/glam/record', {
               params: { limit: itemsPerPage.value, offset, fields: 'id,title,thumbnail,author,description' }
          });
          records.value = res.data.items || [];
          totalItems.value = res.data.total_items || res.data.total || 0;
     } catch (e) {
          console.error("Error al cargar registros:", e);
     } finally {
          loading.value = false;
          // Efecto de desplazamiento suave hacia la parte superior tras la carga
          window.scrollTo({ top: 0, behavior: 'smooth' });
     }
};

/**
 * Manejador del evento de cambio de página emitido por el componente de paginación.
 */
const onPageChange = (p) => {
     currentPage.value = p;
};

onMounted(() => {
     syncStateFromRoute();
     fetchRecords();
});

// Observador de la ruta para gestionar la navegación externa (ej. botón atrás del navegador)
watch(
     () => [route.query.page, route.query.view],
     () => {
          const nextPage = parsePage(route.query.page);
          const nextView = parseView(route.query.view);
          const shouldRefetch = nextPage !== currentPage.value;
          viewMode.value = nextView;
          currentPage.value = nextPage;
          if (shouldRefetch) fetchRecords();
     }
);

// Observadores del estado interno para automatizar la persistencia en la URL
watch(viewMode, () => {
     pushStateToRoute();
});

watch(currentPage, () => {
     pushStateToRoute();
     fetchRecords();
});
</script>


<style scoped>
.page-header {
     text-align: center;
     margin-bottom: 4rem;
}

.page-title {
     font-size: var(--fs-4xl);
     margin-bottom: 1rem;
}

.page-title .highlight {
     color: var(--primary-color);
}

.page-subtitle {
     color: var(--text-secondary);
     font-size: var(--fs-lg);
     max-width: 600px;
     margin: 0 auto;
}

.toolbar {
     display: flex;
     justify-content: space-between;
     align-items: center;
     background: var(--surface-color);
     padding: 1rem 1.5rem;
     border-radius: var(--radius-md);
     border: 1px solid var(--border-color);
     margin-bottom: 3rem;
}

.view-options {
     display: flex;
     gap: 0.5rem;
}

.view-options button {
     padding: 0.5rem 1rem;
     border: 1px solid var(--border-color);
     border-radius: var(--radius-sm);
     font-size: 0.75rem;
     font-weight: 700;
     text-transform: uppercase;
}

.view-options button.active {
     background: var(--primary-color);
     color: #fff;
     border-color: var(--primary-color);
}

.results-info {
     font-size: var(--fs-sm);
     color: var(--text-muted);
}

.grid-system {
     display: grid;
     gap: var(--spacing-xl);
}

.grid-system.view-grid {
     grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
}

.grid-system.view-list,
.grid-system.view-magazine {
     grid-template-columns: 1fr;
}

@media (max-width: 768px) {
     .toolbar {
          flex-direction: column;
          gap: 1.2rem;
          text-align: center;
          padding: 1.5rem;
          margin-bottom: 2rem;
     }

     .view-options {
          width: 100%;
          justify-content: center;
     }

     .grid-system {
          gap: 1.5rem;
     }
}
</style>
