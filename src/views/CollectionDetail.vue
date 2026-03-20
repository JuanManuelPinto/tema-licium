<template>
     <div class="container section-padding fade-in">
          <!-- Barra de navegación contextual: Retorno al listado global -->
          <div class="action-bar">
               <button @click="$router.push('/collections')" class="btn-back">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                         <path d="m15 18-6-6 6-6" />
                    </svg>
                    Todas las colecciones
               </button>
          </div>

          <!-- Estado de carga: Transición durante la recuperación de metadatos de la colección -->
          <div v-if="loadingCol" class="loading-wrapper"><span class="loader"></span> Cargando...</div>

          <!-- Cabecera de la Colección: Presentación visual con imagen de fondo y descripción -->
          <div v-else-if="collection" class="collection-hero">
               <div class="hero-bg">
                    <img v-if="collection.thumbnail" :src="getThumbnail(collection.thumbnail, 'large')" />
                    <div class="overlay"></div>
               </div>
               <div class="hero-content">
                    <span class="badge">Colección</span>
                    <h1 class="hero-title">{{ collection.title }}</h1>
                    <p class="hero-desc">{{ collection.description }}</p>
               </div>
          </div>

          <!-- Sección de Contenidos: Listado de registros vinculados a esta colección -->
          <div class="records-section">
               <div class="section-header">
                    <h2 class="title-md">Obras en esta Colección</h2>
                    <span class="count">{{ totalItems }} resultados</span>
               </div>

               <!-- Gestión de estados de carga y resultados vacíos -->
               <div v-if="loadingRec" class="loading-wrapper"><span class="loader"></span></div>
               <div v-else-if="records.length === 0" class="empty">No hay obras registradas en esta colección.</div>
               
               <!-- Visualización de registros mediante rejilla adaptativa -->
               <div v-else>
                    <div class="grid-auto">
                         <CommonCard v-for="record in records" :key="record.id" :item="record" type="record" />
                    </div>

                    <!-- Sistema de navegación paginada para los registros de la colección -->
                    <ThePagination :current-page="currentPage" :total-items="totalItems" :items-per-page="itemsPerPage"
                         @change="onPageChange" />
               </div>
          </div>
     </div>
</template>

<script setup>
/**
 * Vista CollectionDetail.
 * 
 * Este componente gestiona la visualización detallada de una colección específica.
 * Su responsabilidad incluye la recuperación de los metadatos de la propia colección
 * y la carga dinámica de todos los registros bibliográficos o museísticos asociados
 * a la misma, implementando un filtrado por dominio para asegurar la integridad de los datos.
 */

import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import CommonCard from '../components/CommonCard.vue';
import ThePagination from '../components/ThePagination.vue';

const route = useRoute();
const collection = ref(null);
const records = ref([]);
const loadingCol = ref(true);
const loadingRec = ref(true);

const currentPage = ref(1);
const totalItems = ref(0);
const itemsPerPage = ref(20);

/**
 * Recupera la información básica y descriptiva de la colección actual.
 */
const fetchInfo = async () => {
     loadingCol.value = true;
     try {
          const id = route.params.id;
          const res = await axios.get(`/api/glam/collection/${id}`, { params: { fields: 'id,thumbnail,title,description' } });
          collection.value = res.data.item || res.data;
     } catch (e) {
          console.error("Error al recuperar metadatos de la colección:", e);
     } finally {
          loadingCol.value = false;
     }
};

/**
 * Recupera los registros asociados a la colección aplicando un dominio de búsqueda específico.
 * Se utiliza una estructura de consulta compleja para filtrar por ID de colección y sitio.
 */
const fetchRecords = async () => {
     loadingRec.value = true;
     const offset = (currentPage.value - 1) * itemsPerPage.value;
     const id = route.params.id;
     try {
          // Construcción del dominio de filtrado para la API GLAM
          const domain = {
               op: "and",
               children: [
                    { type: "condition", field: "sites", operator: "in", value: [8] },
                    { type: "condition", field: "collections", operator: "in", value: [parseInt(id)] }
               ]
          };
          const res = await axios.get(`/api/glam/record`, {
               params: { limit: itemsPerPage.value, offset, fields: 'thumbnail,title,author,id', domain: JSON.stringify(domain) }
          });
          records.value = res.data.items || [];
          totalItems.value = res.data.total_items || res.data.total || 0;
     } catch (e) {
          console.error("Error al recuperar registros de la colección:", e);
     } finally {
          loadingRec.value = false;
     }
};

/**
 * Controlador para la navegación entre páginas de resultados.
 */
const onPageChange = (p) => {
     currentPage.value = p;
     fetchRecords();
};

/**
 * Normaliza las rutas de las imágenes para solicitar versiones de alta resolución al CDN.
 */
const getThumbnail = (path, size = 'large') => {
     if (!path) return '';
     const domain = 'https://arcadium.cluster24.libnamic.eu';
     let full = path.startsWith('http') ? path : `${domain}${path}`;
     return full.replace(/size=\w+/, `size=${size}`);
};

/**
 * Observa cambios en los parámetros de la ruta para permitir la navegación directa entre colecciones.
 */
watch(() => route.params.id, (id) => { if (id) { fetchInfo(); fetchRecords(); } });

onMounted(() => {
     fetchInfo();
     fetchRecords();
});
</script>


<style scoped>
.action-bar {
     margin-bottom: 2rem;
}

.btn-back {
     display: flex;
     align-items: center;
     gap: 0.5rem;
     color: var(--text-secondary);
     font-weight: 600;
     text-transform: uppercase;
     font-size: 0.8rem;
}

.collection-hero {
     position: relative;
     height: 500px;
     border-radius: var(--radius-lg);
     overflow: hidden;
     display: flex;
     align-items: center;
     justify-content: center;
     margin-bottom: 5rem;
}

.hero-bg {
     position: absolute;
     inset: 0;
}

.hero-bg img {
     width: 100%;
     height: 100%;
     object-fit: cover;
     filter: brightness(0.6);
}

.overlay {
     position: absolute;
     inset: 0;
     background: linear-gradient(0deg, var(--bg-color) 0%, transparent 100%);
}

.hero-content {
     position: relative;
     z-index: 10;
     text-align: center;
     color: #fff;
     padding: 2rem;
     max-width: 900px;
}

.hero-title {
     font-size: var(--fs-4xl);
     margin: 1rem 0;
}

.hero-desc {
     font-size: 1.25rem;
     color: rgba(255, 255, 255, 0.9);
}

.records-section {
     margin-top: 2rem;
}

.section-header {
     display: flex;
     justify-content: space-between;
     align-items: center;
     margin-bottom: 3rem;
     padding-bottom: 0.5rem;
     border-bottom: 2px solid var(--border-color);
}

.title-md {
     font-size: var(--fs-2xl);
     margin: 0;
}

.count {
     font-weight: 700;
     color: var(--primary-color);
}

@media (max-width: 768px) {
     .collection-hero {
          height: auto;
          min-height: 350px;
          margin-bottom: 3rem;
          border-radius: var(--radius-md);
     }

     .hero-title {
          font-size: var(--fs-2xl);
     }

     .hero-desc {
          font-size: 1rem;
     }

     .section-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 0.5rem;
          margin-bottom: 2rem;
     }
}
</style>
