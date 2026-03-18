<template>
     <div class="record-page fade-in">
          <div v-if="loading" class="loading-wrapper"><span class="loader"></span> Cargando registro...</div>

          <div v-else-if="record" class="record-container">
               <!-- Header con navegación y título -->
               <header class="record-header container">
                    <div class="header-nav">
                         <button @click="$router.go(-1)" class="btn-back">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                   stroke-width="2">
                                   <path d="m15 18-6-6 6-6" />
                              </svg>
                              Volver
                         </button>
                         <div class="breadcrumb">
                              <span>Catálogo</span> / <span>Detalle de Registro</span>
                         </div>
                    </div>

                    <div class="title-section">
                         <div class="meta-badges">
                              <span class="badge">Registro</span>
                              <div v-if="record.collections?.length" class="collection-links">
                                   <router-link v-for="col in record.collections" :key="col.id"
                                        :to="{ name: 'collection-detail', params: { id: col.id } }"
                                        class="collection-link">
                                        {{ col.title }}
                                   </router-link>
                              </div>
                         </div>
                         <h1 class="record-title">{{ record.title }}</h1>
                    </div>
               </header>

               <div class="record-content container">
                    <div class="content-grid">
                         <!-- Columna Principal: Medios -->
                         <div class="media-section">
                              <div class="sticky-media">
                                   <div class="main-image-wrapper">
                                        <img v-if="record.thumbnail" :src="getThumbnail(record.thumbnail, 'large')"
                                             class="main-img" alt="Imagen del registro" />
                                        <div v-else class="no-img-placeholder">Sin Imagen Disponible</div>
                                   </div>

                                   <!-- Galería -->
                                   <div class="gallery-section" v-if="record.media_items?.length">
                                        <h3 class="section-label">Galería de Imágenes</h3>
                                        <div class="gallery-scroll">
                                             <div v-for="m in record.media_items" :key="m.id" class="gallery-thumb">
                                                  <img :src="getThumbnail(m.thumbnail || m.path, 'small')"
                                                       :alt="m.title || 'Miniatura'" />
                                             </div>
                                        </div>
                                   </div>
                              </div>
                         </div>

                         <!-- Columna Secundaria: Información -->
                         <div class="info-section">
                              <div class="description-area" v-if="record.description">
                                   <h3 class="section-label">Descripción</h3>
                                   <div class="description-text" v-html="record.description"></div>
                              </div>

                              <!-- Ficha Técnica -->
                              <div class="metadata-card" v-if="record.canonical_joined_metadata">
                                   <h3 class="section-label">Ficha Técnica</h3>
                                   <div class="metadata-list">
                                        <template v-for="(meta, key) in record.canonical_joined_metadata" :key="key">
                                             <div class="metadata-item" v-if="meta.values?.length">
                                                  <div class="metadata-label">{{ meta.label || key }}</div>
                                                  <div class="metadata-value">
                                                       {{ meta.values.map(v => formatValue(v)).join(', ') }}
                                                  </div>
                                             </div>
                                        </template>
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>
          </div>
     </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const record = ref(null);
const loading = ref(true);

const fetchDetail = async () => {
     loading.value = true;
     try {
          const id = route.params.id;
          const res = await axios.get(`/api/glam/record/${id}`, {
               params: {
                    with_labels: 1,
                    fields: 'id,title,description,canonical_joined_metadata,thumbnail,collections.id,collections.title,media_items.id,media_items.path,media_items.thumbnail,media_items.title'
               }
          });
          record.value = res.data.item || res.data;
     } catch (e) {
          console.error("Error al cargar detalle:", e);
     } finally {
          loading.value = false;
          window.scrollTo({ top: 0, behavior: 'smooth' });
     }
};

/**
 * Extrae el texto legible de un valor de metadato complejo
 */
const formatValue = (val) => {
     if (!val) return '';
     if (typeof val !== 'object') return val;
     // Prioridad de campos para mostrar texto traducido o etiquetas
     return val.translated_label || val.label || val['@value'] || val.value || val['@id'] || JSON.stringify(val);
};

const getThumbnail = (path, size = 'large') => {
     if (!path) return '';
     const domain = 'https://arcadium.cluster24.libnamic.eu';
     let full = path.startsWith('http') ? path : `${domain}${path}`;
     return full.replace(/size=\w+/, `size=${size}`);
};

watch(() => route.params.id, (id) => { if (id) fetchDetail(); });
onMounted(fetchDetail);
</script>

<style scoped>
.record-page {
     padding-bottom: var(--spacing-3xl);
}

.record-header {
     margin-bottom: 3rem;
}

.header-nav {
     display: flex;
     justify-content: space-between;
     align-items: center;
     padding: 1.5rem 0;
     border-bottom: 1px solid var(--border-color);
     margin-bottom: 2rem;
}

.btn-back {
     display: flex;
     align-items: center;
     gap: 0.5rem;
     color: var(--text-secondary);
     font-weight: 600;
     font-size: var(--fs-xs);
     text-transform: uppercase;
     letter-spacing: 0.1em;
     transition: color 0.3s;
}

.btn-back:hover {
     color: var(--primary-color);
}

.breadcrumb {
     font-size: var(--fs-xs);
     color: var(--text-muted);
     text-transform: uppercase;
     letter-spacing: 0.05em;
}

.meta-badges {
     display: flex;
     align-items: center;
     gap: 1rem;
     margin-bottom: 1.5rem;
}

.collection-links {
     display: flex;
     gap: 0.5rem;
     flex-wrap: wrap;
}

.collection-link {
     font-size: 0.7rem;
     font-weight: 700;
     color: var(--primary-color);
     background: rgba(212, 175, 55, 0.08);
     padding: 0.3rem 0.8rem;
     border-radius: var(--radius-full);
     text-transform: uppercase;
     transition: all 0.3s;
}

.collection-link:hover {
     background: var(--primary-color);
     color: #fff;
}

.record-title {
     font-size: var(--fs-4xl);
     line-height: 1.1;
     max-width: 900px;
}

.content-grid {
     display: grid;
     grid-template-columns: 1fr;
     gap: 4rem;
}

@media (min-width: 1024px) {
     .content-grid {
          grid-template-columns: 1fr 1fr;
          align-items: start;
     }

     .sticky-media {
          position: sticky;
          top: 120px;
     }
}

.main-image-wrapper {
     background: #fff;
     border-radius: var(--radius-lg);
     overflow: hidden;
     border: 1px solid var(--border-color);
     box-shadow: var(--shadow-md);
     aspect-ratio: 4/3;
     display: flex;
     align-items: center;
     justify-content: center;
     margin-bottom: 2rem;
}

.main-img {
     width: 100%;
     height: 100%;
     object-fit: contain;
     padding: 2rem;
}

.no-img-placeholder {
     color: var(--text-muted);
     font-style: italic;
}

.section-label {
     font-size: var(--fs-xs);
     text-transform: uppercase;
     letter-spacing: 0.15em;
     color: var(--primary-color);
     margin-bottom: 1.5rem;
     font-weight: 800;
     display: block;
     border-bottom: 1px solid var(--border-color);
     padding-bottom: 0.5rem;
}

.gallery-scroll {
     display: flex;
     gap: 1rem;
     overflow-x: auto;
     padding-bottom: 1rem;
     scrollbar-width: thin;
}

.gallery-thumb {
     flex: 0 0 100px;
     height: 100px;
     border-radius: var(--radius-md);
     overflow: hidden;
     border: 1px solid var(--border-color);
     cursor: pointer;
     transition: transform 0.3s;
}

.gallery-thumb:hover {
     transform: scale(1.05);
}

.gallery-thumb img {
     width: 100%;
     height: 100%;
     object-fit: cover;
}

.description-area {
     margin-bottom: 4rem;
}

.description-text {
     font-size: 1.1rem;
     line-height: 1.8;
     color: var(--text-secondary);
}

.metadata-card {
     background: var(--surface-card);
     padding: 3rem;
     border-radius: var(--radius-lg);
     border: 1px solid var(--border-color);
     box-shadow: var(--shadow-sm);
}

.metadata-list {
     display: grid;
     gap: 1.5rem;
}

.metadata-item {
     display: grid;
     grid-template-columns: 160px 1fr;
     gap: 2rem;
     padding-bottom: 1rem;
     border-bottom: 1px solid var(--border-color);
}

.metadata-label {
     font-size: var(--fs-xs);
     font-weight: 700;
     color: var(--text-muted);
     text-transform: uppercase;
}

.metadata-value {
     font-size: 1rem;
     color: var(--text-primary);
     line-height: 1.4;
}

@media (max-width: 768px) {
     .record-title {
          font-size: var(--fs-2xl);
     }

     .metadata-card {
          padding: 1.5rem;
          margin: 0 -0.5rem;
          width: calc(100% + 1rem);
     }

     .metadata-item {
          grid-template-columns: 1fr;
          gap: 0.4rem;
     }

     .main-image-wrapper {
          aspect-ratio: 1/1;
     }

     .description-text {
          font-size: 1rem;
     }
}
</style>
