<template>
     <div class="container section-padding fade-in">
          <div v-if="loading" class="loading-wrapper"><span class="loader"></span> Cargando registro...</div>

          <div v-else-if="record" class="record-detail">
               <!-- Cabecera de acción -->
               <div class="action-bar">
                    <button @click="$router.go(-1)" class="btn-back">
                         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                              stroke-width="2">
                              <path d="m15 18-6-6 6-6" />
                         </svg>
                         Volver al catálogo
                    </button>
               </div>

               <div class="detail-grid">
                    <!-- Columna de Medios (Izquierda) -->
                    <div class="media-column">
                         <div class="main-image-card">
                              <img v-if="record.thumbnail" :src="getThumbnail(record.thumbnail, 'large')"
                                   class="hero-img" />
                              <div v-else class="no-img">Sin Imagen</div>
                         </div>

                         <!-- Galería si existe -->
                         <div class="gallery" v-if="record.media_items?.length">
                              <h3 class="side-title">Galería de Medios</h3>
                              <div class="gallery-grid">
                                   <div v-for="m in record.media_items" :key="m.id" class="gallery-item">
                                        <img :src="getThumbnail(m.thumbnail || m.path, 'small')" />
                                   </div>
                              </div>
                         </div>
                    </div>

                    <!-- Columna de Datos (Derecha) -->
                    <div class="info-column">
                         <div class="info-header">
                              <span class="badge">Registro</span>
                              <div v-if="record.collections?.length" class="collection-tags">
                                   <router-link v-for="col in record.collections" :key="col.id"
                                        :to="{ name: 'collection-detail', params: { id: col.id } }"
                                        class="collection-tag">
                                        {{ col.title }}
                                   </router-link>
                              </div>
                              <h1 class="record-title">{{ record.title }}</h1>
                         </div>

                         <div v-if="record.description" class="description-box" v-html="record.description"></div>

                         <!-- Ficha Técnica Avanzada -->
                         <div class="technical-table" v-if="record.canonical_joined_metadata">
                              <h3 class="side-title">Ficha Técnica</h3>
                              <div class="table-rows">
                                   <template v-for="(meta, key) in record.canonical_joined_metadata" :key="key">
                                        <div class="table-row" v-if="meta.values?.length">
                                             <div class="row-label">{{ meta.label || key }}</div>
                                             <div class="row-content">
                                                  {{meta.values.map(v => formatValue(v)).join(', ')}}
                                             </div>
                                        </div>
                                   </template>
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
.action-bar {
     margin-bottom: 2rem;
}

.btn-back {
     display: flex;
     align-items: center;
     gap: 0.5rem;
     color: var(--text-secondary);
     font-weight: 600;
     font-size: var(--fs-sm);
     text-transform: uppercase;
}

.btn-back:hover {
     color: var(--primary-color);
}

.detail-grid {
     display: grid;
     grid-template-columns: 1fr;
     gap: 4rem;
}

@media (min-width: 1024px) {
     .detail-grid {
          grid-template-columns: 500px 1fr;
     }
}

.main-image-card {
     background: var(--surface-card);
     border-radius: var(--radius-lg);
     overflow: hidden;
     border: 1px solid var(--border-color);
     box-shadow: var(--shadow-md);
}

.hero-img {
     width: 100%;
     height: auto;
     display: block;
     object-fit: contain;
     background: #fff;
}

.side-title {
     font-size: var(--fs-sm);
     text-transform: uppercase;
     letter-spacing: 0.1em;
     color: var(--primary-color);
     margin-bottom: 1.5rem;
     border-bottom: 1px solid var(--border-color);
     padding-bottom: 0.5rem;
}

.gallery {
     margin-top: 3rem;
}

.gallery-grid {
     display: grid;
     grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
     gap: 1rem;
}

.gallery-item img {
     width: 100%;
     height: 100px;
     object-fit: cover;
     border-radius: var(--radius-sm);
     border: 1px solid var(--border-color);
}

.info-header {
     margin-bottom: 2.5rem;
}

.collection-tags {
     display: flex;
     flex-wrap: wrap;
     gap: 0.5rem;
     margin-top: 1rem;
}

.collection-tag {
     font-size: var(--fs-xs);
     font-weight: 700;
     text-transform: uppercase;
     color: var(--primary-color);
     background: var(--surface-card);
     padding: 0.3rem 0.8rem;
     border-radius: var(--radius-full);
     border: 1px solid var(--border-color);
     transition: all 0.3s;
}

.collection-tag:hover {
     background: var(--primary-color);
     color: #fff;
}

.record-title {
     font-size: var(--fs-4xl);
     margin-top: 1rem;
}

.description-box {
     font-size: 1.15rem;
     color: var(--text-secondary);
     line-height: 1.8;
     margin-bottom: 4rem;
     max-width: 800px;
}

.technical-table {
     background: var(--surface-card);
     padding: 2.5rem;
     border-radius: var(--radius-lg);
     border: 1px solid var(--border-color);
}

.table-rows {
     display: flex;
     flex-direction: column;
     gap: 1.2rem;
}

.table-row {
     display: grid;
     padding-bottom: 1rem;
     border-bottom: 1px dashed var(--border-color);
}

@media (max-width: 600px) {
     .record-title {
          font-size: var(--fs-3xl);
          word-break: break-word;
     }

     .technical-table {
          padding: 1.5rem;
     }

     .table-row {
          grid-template-columns: 1fr;
          gap: 0.5rem;
     }
}

@media (min-width: 600px) {
     .table-row {
          grid-template-columns: 200px 1fr;
          gap: 2rem;
     }
}

.row-label {
     font-weight: 700;
     font-size: var(--fs-xs);
     text-transform: uppercase;
     color: var(--text-muted);
}

.row-content {
     font-size: 1.1rem;
     color: var(--text-primary);
}
</style>
