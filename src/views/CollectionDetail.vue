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
                                                                  <template v-else-if="getRouteName(v) && (v.id || v['@id'])">
                                                                       <router-link :to="{ name: getRouteName(v), params: { id: getId(v) }, query: { from: route.fullPath } }" class="meta-link" @click="closeMetadataModal">
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

     <!-- Modal de Detalle de Autoridad (Persona/Entidad/Lugar) -->
     <Teleport to="body">
          <Transition name="fade">
               <div v-if="showAuthorityModal" class="metadata-modal-overlay" @click.self="closeAuthorityModal">
                    <div class="metadata-modal authority-modal-card">
                         <header class="modal-header">
                              <div class="modal-header-nav">
                                   <button class="modal-close" @click="closeAuthorityModal" title="Cerrar">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                             <path d="M18 6 6 18M6 6l12 12" />
                                        </svg>
                                   </button>
                              </div>
                         </header>

                         <div class="modal-body">
                              <div v-if="authorityLoading" class="loading-wrapper auth-loading">
                                   <span class="loader"></span>
                              </div>

                              <div v-else-if="selectedAuthority" class="authority-content">
                                   <div class="authority-hero">
                                        <div class="authority-portrait">
                                             <img v-if="selectedAuthority.thumbnail" 
                                                  :src="getThumbnail(selectedAuthority.thumbnail, 'large')" 
                                                  :alt="selectedAuthority.title" />
                                             <div v-else class="authority-portrait-placeholder">
                                                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
                                                       <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                                                  </svg>
                                             </div>
                                        </div>
                                        <div class="authority-main-info">
                                             <span class="authority-type-tag">Ficha de Autoridad</span>
                                             <h2 class="authority-name">{{ selectedAuthority.title }}</h2>
                                             <div v-if="selectedAuthority.metadata?.type" class="authority-subtitle">
                                                  {{ formatValue(selectedAuthority.metadata.type) }}
                                             </div>
                                        </div>
                                   </div>

                                   <div class="authority-details">
                                        <template v-if="selectedAuthority.description || hasAuthorityLinks(selectedAuthority.metadata)">
                                             <div class="authority-section" v-if="selectedAuthority.description">
                                                  <h3 class="modal-subtitle">Descripción</h3>
                                                  <div class="authority-desc-text" v-html="selectedAuthority.description"></div>
                                             </div>

                                             <div class="authority-section" v-if="hasAuthorityLinks(selectedAuthority.metadata)">
                                                  <h3 class="modal-subtitle">Enlaces e Identificadores</h3>
                                                  <div class="authority-links-grid">
                                                       <template v-for="(v, k) in selectedAuthority.metadata" :key="k">
                                                            <a v-if="(k.includes('wikidata') || k.includes('wikipedia') || k.includes('viaf') || k.includes('isni') || k.includes('gnd') || k.includes('external')) && ensureString(v)"
                                                               :href="ensureString(v)" target="_blank" class="authority-link-item">
                                                                 <div class="auth-link-icon" :style="{ backgroundColor: getAuthorityLinkColor(k) }">
                                                                      {{ getAuthorityLinkIcon(k) }}
                                                                 </div>
                                                                 <div class="auth-link-details">
                                                                      <span class="auth-link-label">{{ k }}</span>
                                                                      <span class="auth-link-val">{{ ensureString(v) }}</span>
                                                                 </div>
                                                            </a>
                                                       </template>
                                                  </div>
                                             </div>
                                        </template>
                                        <div v-else class="no-authority-details">
                                             <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="opacity: 0.3; margin-bottom: 1rem;">
                                                  <path d="M12 8v4" /><path d="M12 16h.01" /><circle cx="12" cy="12" r="10" />
                                             </svg>
                                             <p>No existen detalles adicionales para esta autoridad.</p>
                                        </div>
                                   </div>
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

// Gestión del Modal de Autoridades
const showAuthorityModal = ref(false);
const authorityLoading = ref(false);
const selectedAuthority = ref(null);

const hasAuthorityLinks = (metadata) => {
    if (!metadata) return false;
    return Object.keys(metadata).some(k => 
        k.includes('wikidata') || k.includes('wikipedia') || k.includes('viaf') || 
        k.includes('isni') || k.includes('gnd') || k.includes('external')
    );
};

const ensureString = (val) => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'string') return val;
    if (Array.isArray(val)) return val.length > 0 ? ensureString(val[0]) : '';
    if (typeof val === 'object') {
        const candidate = val.translated_label || val.label || val.value || val['@id'] || val.uri || val.id || '';
        return typeof candidate === 'string' ? candidate : ensureString(candidate);
    }
    return String(val);
};

const openAuthorityModal = async (id) => {
    if (!id) return;
    showAuthorityModal.value = true;
    authorityLoading.value = true;
    selectedAuthority.value = null;
    document.body.style.overflow = 'hidden';

    try {
        const res = await axios.get(`/api/core/authority/${id}`, { params: { with_labels: 1 } });
        selectedAuthority.value = res.data.item || res.data;
    } catch (e) {
        console.error("Error al recuperar detalle de la autoridad:", e);
    } finally {
        authorityLoading.value = false;
    }
};

const closeAuthorityModal = () => {
    showAuthorityModal.value = false;
    document.body.style.overflow = '';
};

const getAuthorityLinkIcon = (key) => {
    const k = key.toLowerCase();
    if (k.includes('wikidata')) return 'WD';
    if (k.includes('wikipedia')) return 'W';
    if (k.includes('viaf')) return 'VIAF';
    if (k.includes('isni')) return 'ISNI';
    if (k.includes('gnd')) return 'GND';
    if (k.includes('congress')) return 'LC';
    return '🔗';
};

const getAuthorityLinkColor = (key) => {
    const k = key.toLowerCase();
    if (k.includes('wikidata')) return '#006699';
    if (k.includes('wikipedia')) return '#333333';
    if (k.includes('viaf')) return '#cc3333';
    return 'var(--primary-color)';
};
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
     if (!val) return '—';
     if (typeof val !== 'object') return val;
     return val.translated_label || val.label || val['@value'] || val.value || JSON.stringify(val);
};

const getId = (val) => {
     if (!val) return null;
     // Si recibimos un objeto de metadato, extraemos el id o @id
     let rawId = (typeof val === 'object' && !Array.isArray(val)) ? (val.id || val['@id']) : val;
     
     // Si aún así es un array, tomamos el primer elemento (corrige crash de Vue Router)
     if (Array.isArray(rawId)) rawId = rawId[0];
     
     if (!rawId) return null;
     if (typeof rawId === 'string' && rawId.includes('/')) {
          const parts = rawId.split('/');
          return parts[parts.length - 1];
     }
     return rawId;
};

const getRouteName = (v) => {
     if (!v) return null;
     const type = typeof v === 'object' ? v.type : v;
     const model = typeof v === 'object' ? (v.model || v.resource_type || v.target_model) : null;

     if (model === 'glam.record') return 'record-detail';
     if (model === 'glam.collection') return 'collection-detail';
     if (model === 'glam.media') return 'media-detail';

     if (type === 'record' || type === 'resource' || type === 'recurso') return 'record-detail';
     if (type === 'collection' || type === 'coleccion') return 'collection-detail';
     if (type === 'media' || type === 'medio') return 'media-detail';
     return null;
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
     // const domain = 'https://arcadium.cluster24.libnamic.eu';
     // let full = path.startsWith('http') ? path : `${domain}${path}`;
     const sep = path.startsWith('/') || path.startsWith('http') ? '' : '/';
     let full = path.startsWith('http') ? path : `${sep}${path}`;
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
     flex-direction: column;
     align-items: center;
     justify-content: center;
     margin-bottom: 5rem;
     background: var(--bg-color);
}

.hero-no-thumb-icon {
     margin-bottom: 1.5rem;
     color: var(--primary-color);
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

/* Authority Modal Specific Styles */
.authority-wrapper {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    flex-wrap: wrap;
}

.btn-authority-info {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    background: rgba(var(--primary-color-rgb), 0.1);
    color: var(--primary-color);
    border: 1px solid rgba(var(--primary-color-rgb), 0.2);
    padding: 0.3rem 0.7rem;
    border-radius: var(--radius-full);
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    transition: all 0.3s;
    cursor: pointer;
}

.btn-authority-info:hover {
    background: var(--primary-color);
    color: #fff;
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
}

.authority-modal-card {
    max-width: 650px !important;
}

.authority-hero {
    display: flex;
    gap: 2rem;
    margin-bottom: 2.5rem;
    padding-bottom: 2.5rem;
    border-bottom: 1px solid var(--border-color);
}

.authority-portrait {
    width: 180px;
    height: 180px;
    border-radius: var(--radius-lg);
    overflow: hidden;
    background: var(--surface-card);
    flex-shrink: 0;
    border: 1px solid var(--border-color);
}

.authority-portrait img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.authority-portrait-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
}

.authority-main-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.authority-type-tag {
    display: inline-block;
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    color: var(--primary-color);
    margin-bottom: 0.5rem;
    letter-spacing: 0.1em;
}

.authority-name {
    font-size: var(--fs-2xl);
    margin: 0 0 0.5rem 0;
    color: var(--text-primary);
    line-height: 1.2;
}

.authority-subtitle {
    font-size: 1rem;
    color: var(--text-secondary);
    font-style: italic;
}

.authority-desc-text {
    font-size: 0.95rem;
    line-height: 1.7;
    color: var(--text-primary);
    margin-bottom: 2rem;
}

.authority-links-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1rem;
}

.authority-link-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.8rem 1rem;
    background: var(--surface-card);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    text-decoration: none;
    transition: all 0.3s;
}

.authority-link-item:hover {
    border-color: var(--primary-color);
    transform: translateY(-2px);
    box-shadow: var(--shadow-sm);
}

.auth-link-icon {
    width: 36px;
    height: 36px;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 900;
    color: #fff;
    flex-shrink: 0;
}

.auth-link-details {
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.auth-link-label {
    font-size: 10px;
    text-transform: uppercase;
    color: var(--text-muted);
    font-weight: 700;
}

.auth-link-val {
    font-size: 0.85rem;
    color: var(--text-primary);
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

@media (max-width: 600px) {
    .authority-hero {
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 1.5rem;
    }

    .authority-portrait {
        width: 150px;
        height: 150px;
    }
}
.no-authority-details {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    text-align: center;
    background: rgba(var(--primary-color-rgb), 0.03);
    border-radius: var(--radius-lg);
    border: 1px dashed var(--border-color);
    color: var(--text-muted);
}

.no-authority-details p {
    font-size: 1rem;
    font-weight: 600;
}
</style>
