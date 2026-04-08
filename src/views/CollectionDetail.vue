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

          <!-- Cabecera de la Colección: Presentación visual con imagen de fondo (se oculta si no hay miniatura) -->
          <div v-else-if="collection" class="collection-hero" :class="{ 'no-thumb': !collection.thumbnail }">
               <div class="hero-bg" v-if="collection.thumbnail">
                    <img :src="getThumbnail(collection.thumbnail, 'large')" />
                    <div class="overlay"></div>
               </div>
               <div class="hero-content">
                    <span class="badge" v-if="collection.thumbnail">Colección</span>
                    <h1 class="hero-title">{{ collection.title }}</h1>
                    <p class="hero-desc" v-if="collection.description">{{ collection.description }}</p>
               </div>
          </div>

          <!-- Sección de Contenidos: Listado de registros vinculados a esta colección -->
          <div class="records-section">
               <div class="section-header">
                    <h2 class="title-md">Obras en esta Colección</h2>
                    <div class="section-meta-actions">
                          <button @click="showChildrenModal = true" class="btn-info-section" v-if="collection?.children?.length" title="Ver subcolecciones">
                               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                               </svg>
                               Subcolecciones
                          </button>
                          <button @click="showMetadataModal = true" class="btn-info-section" v-if="collection?.joined_metadata" title="Ver detalles de la colección">
                               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 16v-4" />
                                    <path d="M12 8h.01" />
                               </svg>
                               Ficha Técnica
                          </button>
                          <span class="count">{{ totalItems }} resultados</span>
                     </div>
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

     <!-- Modal de Metadatos de la Colección -->
     <Teleport to="body">
          <Transition name="fade">
               <div v-if="showMetadataModal" class="metadata-modal-overlay" @click.self="closeMetadataModal">
                    <div class="metadata-modal">
                         <header class="modal-header">
                              <h2>Detalles de la Colección</h2>
                              <button class="modal-close" @click="closeMetadataModal" title="Cerrar">
                                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                        <path d="M18 6 6 18M6 6l12 12" />
                                   </svg>
                              </button>
                         </header>
                         
                         <div class="modal-body">
                              <div class="modal-section" v-if="collection">
                                   <h3 class="modal-subtitle">Identificación</h3>
                                   <div class="system-meta-grid">
                                        <div class="system-meta-item" v-if="collection.id">
                                             <div class="system-meta-label">ID Sistema</div>
                                             <div class="system-meta-value">{{ collection.id }}</div>
                                        </div>
                                   </div>
                              </div>

                              <div class="modal-section" v-if="collection.joined_metadata">
                                   <h3 class="modal-subtitle">Metadatos Completos</h3>
                                   <div class="full-metadata-list">
                                        <div v-for="(meta, key) in collection.joined_metadata" :key="key" class="full-metadata-item">
                                             <div class="full-metadata-label">{{ meta.label || key }}</div>
                                             <div class="full-metadata-value">
                                                  <div class="metadata-values-container" v-if="meta.values?.length">
                                                        <div v-for="(v, index) in meta.values" :key="index" class="metadata-value-entry">
                                                             <span v-if="v.type" class="type-badge" :class="'type-' + v.type.replace('.', '-')">{{ v.type }}</span>
                                                             <span class="value-content">
                                                                  <template v-if="v.type === 'uri' || v.type === 'uri.resource' || v.type === 'uri.recurso'">
                                                                       <a :href="v.value || v['@id']" target="_blank" class="meta-link">{{ formatValue(v) }}</a>
                                                                  </template>
                                                                  <template v-else-if="(v.type === 'record' || v.type === 'collection' || v.type === 'resource' || v.type === 'recurso') && v.id">
                                                                       <router-link :to="{ name: (v.type === 'record' || v.type === 'resource' || v.type === 'recurso') ? 'record-detail' : 'collection-detail', params: { id: v.id } }" class="meta-link" @click="closeMetadataModal">
                                                                            {{ formatValue(v) }}
                                                                       </router-link>
                                                                  </template>
                                                                  <template v-else-if="v.type === 'authority' || v.type === 'autoridad'">
                                                                       <a v-if="v.uri || v['@id'] || (v.value && v.value.toString().startsWith('http'))" 
                                                                          :href="v.uri || v['@id'] || v.value" target="_blank" class="meta-link authority-link">
                                                                            {{ formatValue(v) }}
                                                                       </a>
                                                                       <span v-else class="authority-value">{{ formatValue(v) }}</span>
                                                                  </template>
                                                                  <template v-else-if="v.type === 'vocabulary' || v.type === 'vocabulario'">
                                                                       <a v-if="v.uri || v['@id'] || (v.value && v.value.toString().startsWith('http'))" 
                                                                          :href="v.uri || v['@id'] || v.value" target="_blank" class="meta-link vocabulary-link">
                                                                            {{ formatValue(v) }}
                                                                       </a>
                                                                       <span v-else class="vocabulary-value">{{ formatValue(v) }}</span>
                                                                  </template>
                                                                  <template v-else>
                                                                       {{ formatValue(v) }}
                                                                  </template>
                                                             </span>
                                                        </div>
                                                   </div>
                                                   <template v-else>—</template>
                                             </div>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>
          </Transition>
     </Teleport>

     <!-- Modal de Subcolecciones (Hijos) -->
     <Teleport to="body">
          <Transition name="fade">
               <div v-if="showChildrenModal" class="metadata-modal-overlay" @click.self="closeChildrenModal">
                    <div class="metadata-modal children-modal">
                         <header class="modal-header">
                              <h2>Subcolecciones de {{ collection?.title }}</h2>
                              <button class="modal-close" @click="closeChildrenModal" title="Cerrar">
                                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                        <path d="M18 6 6 18M6 6l12 12" />
                                   </svg>
                              </button>
                         </header>
                         
                         <div class="modal-body">
                              <div class="children-grid">
                                   <CommonCard 
                                        v-for="child in collection?.children" 
                                        :key="child.id" 
                                        :item="child" 
                                        type="collection" 
                                        @click="closeChildrenModal" />
                              </div>
                         </div>
                    </div>
               </div>
          </Transition>
     </Teleport>
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

const showMetadataModal = ref(false);
const showChildrenModal = ref(false);

/**
 * Recupera la información básica y descriptiva de la colección actual.
 */
const fetchInfo = async () => {
     loadingCol.value = true;
     try {
          const id = route.params.id;
          const res = await axios.get(`/api/glam/collection/${id}`, { 
               params: { 
                    with_labels: 1, 
                    fields: 'id,thumbnail,title,description,joined_metadata,children.id,children.title,children.thumbnail' 
               } 
          });
          collection.value = res.data.item || res.data;
     } catch (e) {
          console.error("Error al recuperar metadatos de la colección:", e);
     } finally {
          loadingCol.value = false;
     }
};

/**
 * Control del modal de metadatos.
 */
const closeMetadataModal = () => {
     showMetadataModal.value = false;
     document.body.style.overflow = '';
};

const closeChildrenModal = () => {
     showChildrenModal.value = false;
     document.body.style.overflow = '';
};

/**
 * Formateo de valores de metadatos.
 */
const formatValue = (val) => {
     if (!val) return '';
     if (typeof val !== 'object') return val;
     return val.translated_label || val.label || val['@value'] || val.value || val['@id'] || JSON.stringify(val);
};

const handleKeydown = (e) => {
     if (e.key === 'Escape') {
          if (showMetadataModal.value) closeMetadataModal();
          if (showChildrenModal.value) closeChildrenModal();
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
     window.addEventListener('keydown', handleKeydown);
     fetchInfo();
     fetchRecords();
});

import { onUnmounted } from 'vue';
onUnmounted(() => {
     window.removeEventListener('keydown', handleKeydown);
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
     background: var(--bg-color);
}

.collection-hero.no-thumb {
     height: auto;
     min-height: 250px;
     background: var(--surface-card);
     border: 1px solid var(--border-color);
     margin-bottom: 3rem;
}

.collection-hero.no-thumb .hero-content {
     color: var(--text-primary);
}

.collection-hero.no-thumb .hero-desc {
     color: var(--text-secondary);
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
          align-items: stretch;
          gap: 1.5rem;
          margin-bottom: 2rem;
     }

     .hero-content {
          padding: 1.5rem;
          width: 100%;
     }
}

.section-meta-actions {
     display: flex;
     align-items: center;
     gap: 1rem;
     flex-wrap: wrap;
}

@media (max-width: 600px) {
     .section-meta-actions {
          gap: 0.75rem;
     }

     .btn-info-section {
          flex: 1 1 calc(50% - 0.5rem);
          min-width: 140px;
          justify-content: center;
          padding: 0.6rem 0.5rem;
          font-size: 10px;
     }

     .count {
          width: 100%;
          text-align: center;
          margin-top: 0.5rem;
          font-size: var(--fs-sm);
     }
}

@media (max-width: 400px) {
     .btn-info-section {
          flex: 1 1 100%;
     }
}

.btn-info-section {
     display: inline-flex;
     align-items: center;
     gap: 0.5rem;
     background: var(--surface-card);
     border: 1px solid var(--border-color);
     color: var(--text-secondary);
     padding: 0.6rem 1.2rem;
     border-radius: var(--radius-md);
     font-size: var(--fs-xs);
     font-weight: 700;
     text-transform: uppercase;
     transition: all 0.3s;
     cursor: pointer;
}

.btn-info-section:hover {
     background: var(--primary-color);
     border-color: var(--primary-color);
     color: #fff;
     transform: translateY(-2px);
     box-shadow: var(--shadow-sm);
}

.btn-info-section svg {
     color: var(--primary-color);
     transition: inherit;
}

.btn-info-section:hover svg {
     color: #fff;
}

/* Metadata Modal Styles */
.metadata-modal-overlay {
     position: fixed;
     inset: 0;
     background: rgba(0, 0, 0, 0.7);
     backdrop-filter: blur(10px);
     z-index: 10000;
     display: flex;
     align-items: center;
     justify-content: center;
     padding: 1rem;
}

.metadata-modal {
     background: var(--surface-color);
     width: 100%;
     max-width: 800px;
     max-height: 90vh;
     border-radius: var(--radius-xl);
     box-shadow: 0 40px 100px rgba(0, 0, 0, 0.6);
     display: flex;
     flex-direction: column;
     border: 1px solid rgba(255, 255, 255, 0.1);
     animation: modalSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
     position: relative;
     overflow: hidden;
}

@keyframes modalSlideUp {
     from { transform: translateY(40px); opacity: 0; }
     to { transform: translateY(0); opacity: 1; }
}

.modal-header {
     padding: 1.5rem 2rem;
     border-bottom: 1px solid var(--border-color);
     display: flex;
     justify-content: space-between;
     align-items: center;
     flex-shrink: 0;
}

.modal-header h2 {
     margin: 0;
     font-size: var(--fs-xl);
     color: var(--text-primary);
     font-weight: 800;
}

.modal-close {
     background: var(--surface-card);
     border: 1px solid var(--border-color);
     color: var(--text-secondary);
     border-radius: var(--radius-full);
     width: 38px;
     height: 38px;
     display: flex;
     align-items: center;
     justify-content: center;
     transition: all 0.3s;
     cursor: pointer;
}

.modal-close:hover {
     background: var(--primary-color);
     color: #fff;
     border-color: var(--primary-color);
     transform: rotate(90deg);
}

.modal-body {
     padding: 2rem;
     overflow-y: auto;
     flex: 1;
     scrollbar-width: thin;
     scrollbar-color: var(--primary-color) transparent;
}

.modal-section {
     margin-bottom: 3rem;
}

.modal-subtitle {
     font-size: var(--fs-xs);
     text-transform: uppercase;
     letter-spacing: 0.15em;
     color: var(--primary-color);
     margin-bottom: 1.5rem;
     font-weight: 800;
     display: flex;
     align-items: center;
     gap: 0.8rem;
}

.modal-subtitle::after {
     content: '';
     flex: 1;
     height: 1px;
     background: var(--border-color);
}

.system-meta-grid {
     display: grid;
     grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
     gap: 1.2rem;
}

.system-meta-item {
     background: var(--surface-card);
     padding: 1.2rem;
     border-radius: var(--radius-lg);
     border: 1px solid var(--border-color);
     transition: all 0.3s;
}

.system-meta-item:hover {
     border-color: var(--primary-color);
     transform: translateY(-2px);
}

.system-meta-label {
     font-size: 10px;
     text-transform: uppercase;
     color: var(--text-muted);
     margin-bottom: 0.5rem;
     font-weight: 700;
     letter-spacing: 0.05em;
}

.system-meta-value {
     font-size: 0.95rem;
     font-weight: 600;
     color: var(--text-primary);
     word-break: break-all;
     line-height: 1.4;
}

.full-metadata-list {
     display: flex;
     flex-direction: column;
     gap: 0.5rem;
}

.full-metadata-item {
     display: grid;
     grid-template-columns: 240px 1fr;
     gap: 2rem;
     padding: 1.2rem;
     border-radius: var(--radius-md);
     transition: background 0.2s;
}

.full-metadata-item:nth-child(odd) {
     background: rgba(var(--primary-color-rgb), 0.02);
}

.full-metadata-item:hover {
     background: rgba(var(--primary-color-rgb), 0.05);
}

.full-metadata-label {
     font-size: var(--fs-xs);
     font-weight: 800;
     color: var(--text-muted);
     text-transform: uppercase;
     letter-spacing: 0.05em;
}

.full-metadata-value {
     font-size: 1rem;
     color: var(--text-primary);
     line-height: 1.6;
}

/* CHILDREN (HIJOS) MODAL SPECIFICS */
.children-modal {
     max-width: 950px;
}

.children-grid {
     display: grid;
     grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
     gap: 1.5rem;
}

/* RESPONSIVIDAD AVANZADA PARA MODALES */
@media (max-width: 900px) {
     .full-metadata-item {
          grid-template-columns: 180px 1fr;
          gap: 1.5rem;
     }

     .children-grid {
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
     }
}

@media (max-width: 768px) {
     .metadata-modal-overlay {
          padding: 0;
     }

     .metadata-modal {
          max-height: 100vh;
          border-radius: 0;
          height: 100%;
     }
     
     .modal-header {
          padding: 1.2rem 1.5rem;
     }

     .modal-body {
          padding: 1.5rem;
     }

     .full-metadata-item {
          grid-template-columns: 1fr;
          gap: 0.5rem;
          padding: 1rem 0;
          border-radius: 0;
          border-bottom: 1px solid var(--border-color);
          background: transparent !important;
     }

     .full-metadata-label {
          font-size: 10px;
     }

     .modal-section {
          margin-bottom: 2rem;
     }

     .children-grid {
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
     }
}

@media (max-width: 480px) {
     .system-meta-grid {
          grid-template-columns: 1fr;
     }

     .modal-header h2 {
          font-size: 1.2rem;
     }

     .children-grid {
          grid-template-columns: 1fr;
     }
}
</style>
