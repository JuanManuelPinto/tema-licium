<template>
     <div class="media-detail-page fade-in">
          <div v-if="loading" class="loading-wrapper">
               <span class="loader"></span>
               Cargando detalle del medio...
          </div>

          <div v-else-if="media" class="media-detail-container">
               <!-- Barra de navegación superior -->
               <header class="media-header container">
                    <div class="header-nav">
                         <button @click="$router.go(-1)" class="btn-back">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                   <path d="m15 18-6-6 6-6" />
                              </svg>
                              Volver
                         </button>
                         <div class="breadcrumb">
                              <span>Catálogo</span> / <span>Detalle de Medio</span>
                         </div>
                    </div>
               </header>

               <div class="media-content container">
                    <div class="media-grid">
                         <!-- Visualizador del Medio -->
                         <div class="media-preview-section">
                              <div class="media-main-wrapper" :class="{ 'is-pdf': isPdf }">
                                   <template v-if="isPdf">
                                        <object :data="pdfUrl" type="application/pdf" class="pdf-viewer">
                                              <div class="pdf-fallback">
                                                   <a :href="clearPdfUrl" target="_blank" class="btn-primary">Abrir PDF</a>
                                              </div>
                                         </object>
                                   </template>
                                   <template v-else>
                                        <img :src="getThumbnail(media.path || media.thumbnail, 'large')" :alt="media.title || 'Medio'" class="main-media-img" @click="openOriginal" />
                                        <div class="media-expand-overlay" @click="openOriginal">
                                             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                                             </svg>
                                             <span>Ver original</span>
                                        </div>
                                   </template>
                              </div>
                              
                              <div class="media-actions">
                                   <a :href="downloadUrl" download target="_blank" class="btn-primary">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                             <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                             <polyline points="7 10 12 15 17 10" />
                                             <line x1="12" y1="15" x2="12" y2="3" />
                                        </svg>
                                        {{ isPdf ? 'Descargar PDF' : 'Descargar Original' }}
                                   </a>
                                   <button v-if="media.record_id" @click="goToRecord" class="btn-secondary">
                                        Ir al Registro
                                   </button>
                              </div>
                         </div>

                         <!-- Información Técnica y del Contexto -->
                         <div class="media-info-section">
                              <div class="info-card">
                                   <div class="info-header">
                                        <span class="badge">Detalles Técnicos</span>
                                        <h1 class="media-title">{{ media.title || 'Sin título' }}</h1>
                                   </div>

                                   <div class="technical-tags" v-if="media.extension || media.mimetype || media.title">
                                        <span class="tech-tag type-tag" v-if="media.extension || media.mimetype">
                                             {{ media.extension?.toUpperCase() || media.mimetype?.split('/')[1]?.toUpperCase() }}
                                        </span>
                                        <span class="tech-tag file-tag" v-if="media.title">{{ media.title }}</span>
                                   </div>

                                   <!-- Atributos Principales (Prioridad Record -> Prioridad Media Meta) -->
                                   <div class="tech-attributes">
                                        <div class="attr-row" v-if="media.record">
                                             <span class="attr-label">Registro</span>
                                             <span class="attr-value">{{ media.record.title }}</span>
                                        </div>
                                        <div class="attr-row" v-if="media.record?.author || getMetaValue('author') || getMetaValue('autor')">
                                             <span class="attr-label">Autor</span>
                                             <span class="attr-value">{{ media.record?.author || getMetaValue('author') || getMetaValue('autor') }}</span>
                                        </div>
                                        <div class="attr-row" v-if="media.record?.date || getMetaValue('date') || getMetaValue('fecha')">
                                             <span class="attr-label">Fecha</span>
                                             <span class="attr-value">{{ media.record?.date || getMetaValue('date') || getMetaValue('fecha') }}</span>
                                        </div>
                                   </div>

                                   <!-- Metadatos del Medio -->
                                   <div class="media-metadata-section">
                                        <div class="media-metadata" v-if="media.joined_metadata && Object.keys(media.joined_metadata).length > 0">
                                             <div v-for="(meta, key) in media.joined_metadata" :key="key" class="meta-row">
                                                  <span class="meta-label">{{ meta.label || key }}</span>
                                                  <div class="meta-values">
                                                       <span v-for="(v, i) in meta.values" :key="i" class="meta-value">
                                                            <template v-if="v.type === 'uri' || v.type === 'uri.resource' || v.type === 'uri.recurso'">
                                                                 <a :href="v.uri || v['@id'] || v.value" target="_blank" class="meta-link">{{ formatValue(v) }}</a>
                                                            </template>
                                                            <template v-else-if="getRouteName(v.type) && (v.id || v['@id'])">
                                                                 <router-link :to="{ name: getRouteName(v.type), params: { id: getId(v) } }" class="meta-link">
                                                                      {{ formatValue(v) }}
                                                                 </router-link>
                                                            </template>
                                                            <template v-else>
                                                                 {{ formatValue(v) }}
                                                            </template>
                                                       </span>
                                                  </div>
                                             </div>
                                        </div>
                                        <div v-else class="no-metadata-info">
                                             <div class="no-meta-icon">
                                                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                                       <circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>
                                                  </svg>
                                             </div>
                                             <p>No existen detalles adicionales para este medio.</p>
                                        </div>
                                   </div>

                                   <!-- Registro Asociado -->
                                   <div class="associated-record" v-if="media.record">
                                        <h3 class="section-label">Registro Vinculado</h3>
                                        <div class="record-mini-card">
                                             <div class="record-thumb" v-if="media.record.thumbnail">
                                                  <img :src="getThumbnail(media.record.thumbnail, 'small')" alt="Registro" />
                                             </div>
                                             <div class="record-info">
                                                  <h4 class="record-title">{{ media.record.title }}</h4>
                                                  <div class="record-desc-mini" v-if="media.record.description" v-html="truncate(media.record.description, 120)"></div>
                                                  <router-link :to="{ name: 'record-detail', params: { id: getId(media.record_id) } }" class="record-link">
                                                       Ver ficha completa
                                                  </router-link>
                                             </div>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>
          </div>
     </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const media = ref(null);
const loading = ref(true);

const fetchMediaDetail = async () => {
     loading.value = true;
     try {
          let id = route.params.id;
          if (typeof id === 'string' && id.includes('/')) {
               const parts = id.split('/');
               id = parts[parts.length - 1];
          }
          const res = await axios.get(`/api/glam/media/${id}`, {
               params: {
                    with_labels: 1,
                    fields: 'id,title,path,thumbnail,extension,mimetype,joined_metadata,record_id,record.id,record.title,record.thumbnail,record.description,record.author,record.date,attachment'
               }
          });
          media.value = res.data.item || res.data;
     } catch (e) {
          console.error("Error al recuperar detalle del medio:", e);
     } finally {
          loading.value = false;
          window.scrollTo({ top: 0, behavior: 'smooth' });
     }
};

const isPdf = computed(() => {
     if (!media.value) return false;
     const m = media.value;
     const mime = (ensureString(m.mimetype) || ensureString(m.attachment?.mimetype) || '').toLowerCase();
     const ext = (ensureString(m.extension) || ensureString(m.attachment?.extension) || '').toLowerCase();
     const attachmentStr = ensureString(m.attachment).toLowerCase();
     const path = ensureString(m.path).toLowerCase();
     const thumb = ensureString(m.thumbnail).toLowerCase();
     const title = ensureString(m.title).toLowerCase();
     
     return mime.includes('pdf') || 
            ext.includes('pdf') || 
            attachmentStr.includes('.pdf') ||
            path.includes('.pdf') || 
            thumb.includes('.pdf') || 
            title.includes('.pdf');
});

const pdfUrl = computed(() => {
     if (!media.value) return '';
     const base = getOriginalUrl(media.value);
     return `${base}${base.includes('?') ? '&' : '?'}#view=FitH`;
});

const clearPdfUrl = computed(() => {
     if (!media.value) return '#';
     return getOriginalUrl(media.value);
});

const downloadUrl = computed(() => {
     const base = clearPdfUrl.value;
     if (base === '#' || !base.includes('action_get/file')) return base;
     // Añadimos el parámetro download=1 para forzar la descarga en el servidor
     return `${base}${base.includes('?') ? '&' : '?'}download=1`;
});

const formatValue = (val) => {
     if (!val) return '—';
     if (typeof val !== 'object') return val;
     return val.translated_label || val.label || val['@value'] || val.value || JSON.stringify(val);
};

const getRouteName = (type) => {
     if (!type) return null;
     if (type === 'record' || type === 'resource' || type === 'recurso') return 'record-detail';
     if (type === 'collection' || type === 'coleccion') return 'collection-detail';
     if (type === 'media' || type === 'medio') return 'media-detail';
     return null;
};

const getMetaValue = (metaKey) => {
     if (!media.value?.joined_metadata?.[metaKey]) return null;
     const meta = media.value.joined_metadata[metaKey];
     return formatValue(meta.values?.[0]);
};

const getId = (val) => {
     if (!val) return null;
     const rawId = Array.isArray(val) ? val[0] : val;
     if (!rawId) return null;
     
     if (typeof rawId === 'string' && rawId.includes('/')) {
          const parts = rawId.split('/');
          return parts[parts.length - 1];
     }
     return rawId;
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

const getThumbnail = (rawPath, size = 'large') => {
     const path = ensureString(rawPath);
     if (!path) return '';
     // const domain = 'https://arcadium.cluster24.libnamic.eu';
     const sep = path.startsWith('/') || path.startsWith('http') ? '' : '/';
     // let full = path.startsWith('http') ? path : `${domain}${sep}${path}`;
     let full = path.startsWith('http') ? path : `${sep}${path}`;
     return full.replace(/size=\w+/, `size=${size}`);
};

const getOriginalUrl = (m) => {
     if (!m) return '#';
     // const domain = 'https://arcadium.cluster24.libnamic.eu';

     // 1. Prioridad: URL directa del adjunto si está disponible
     const attachmentUrl = m.attachment?.url || m.url;
     if (attachmentUrl && typeof attachmentUrl === 'string') {
          // return attachmentUrl.startsWith('http') ? attachmentUrl : `${domain}${attachmentUrl}`;
          const sep = attachmentUrl.startsWith('/') || attachmentUrl.startsWith('http') ? '' : '/';
          return attachmentUrl.startsWith('http') ? attachmentUrl : `${sep}${attachmentUrl}`;
     }

     // 2. Prioridad: ID específico del adjunto (distinto del ID del medio)
     const attachmentId = m.attachment?.id || m.attachment_id;
     if (attachmentId) {
          // return `${domain}/api/core/attachment/action_get/file?attachment_id=${attachmentId}`;
          return `/api/core/attachment/action_get/file?attachment_id=${attachmentId}`;
     }

     // 3. Fallback: ID del medio
     const mediaId = getId(m);
     if (mediaId && mediaId !== '#') {
          // return `${domain}/api/core/attachment/action_get/file?attachment_id=${mediaId}`;
          return `/api/core/attachment/action_get/file?attachment_id=${mediaId}`;
     }

     // 4. Fallback por rutas
     const path = ensureString(m.path || m.thumbnail || m);
     if (!path || path === '#') return '#';
     const sep = path.startsWith('/') || path.startsWith('http') ? '' : '/';
     // return path.startsWith('http') ? path : `${domain}${sep}${path}`;
     return path.startsWith('http') ? path : `${sep}${path}`;
};

const openOriginal = () => {
     if (media.value) {
          window.open(clearPdfUrl.value, '_blank');
     }
};

const goToRecord = () => {
     if (media.value?.record_id) {
          router.push({ name: 'record-detail', params: { id: getId(media.value.record_id) } });
     }
};

const truncate = (str, len) => {
     if (!str) return '';
     const clean = str.replace(/<[^>]*>?/gm, '');
     return clean.length > len ? clean.substring(0, len) + '...' : clean;
};

onMounted(() => {
     fetchMediaDetail();
});
</script>

<style scoped>
.media-detail-page {
     padding-bottom: var(--spacing-3xl);
}

.media-header {
     margin-bottom: 2rem;
}

.header-nav {
     display: flex;
     justify-content: space-between;
     align-items: center;
     padding: 1.5rem 0;
     border-bottom: 1px solid var(--border-color);
     gap: 1rem;
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
}

.media-grid {
     display: grid;
     grid-template-columns: 1.2fr 0.8fr;
     gap: 4rem;
     align-items: start;
}

@media (max-width: 1024px) {
     .media-grid {
          grid-template-columns: 1fr;
          gap: 2rem;
     }
}

.media-main-wrapper {
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
     cursor: pointer;
     position: relative;
}

.main-media-img {
     width: 100%;
     height: 100%;
     object-fit: contain;
     padding: 2rem;
     transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.pdf-viewer {
     width: 100%;
     height: 100%;
     border: none;
     border-radius: var(--radius-lg);
     background: #f5f5f5;
}

.media-main-wrapper.is-pdf {
     aspect-ratio: auto;
     height: 80vh;
     max-height: 900px;
     min-height: 600px;
     cursor: default;
     padding: 0;
}

.media-main-wrapper:hover .main-media-img {
     transform: scale(1.02);
}

.media-expand-overlay {
     position: absolute;
     inset: 0;
     background: rgba(0, 0, 0, 0.4);
     display: flex;
     flex-direction: column;
     align-items: center;
     justify-content: center;
     gap: 1rem;
     color: #fff;
     opacity: 0;
     transition: opacity 0.3s;
     backdrop-filter: blur(4px);
}

.media-main-wrapper:hover .media-expand-overlay {
     opacity: 1;
}

.media-actions {
     display: flex;
     gap: 1rem;
     flex-wrap: wrap;
}

.btn-secondary {
     padding: 0.8rem 1.8rem;
     border-radius: var(--radius-md);
     border: 1px solid var(--border-color);
     background: var(--surface-card);
     color: var(--text-primary);
     font-weight: 600;
     font-size: var(--fs-sm);
     text-transform: uppercase;
     transition: all 0.3s;
}

.btn-secondary:hover {
     background: var(--bg-color);
     border-color: var(--text-muted);
}

.info-card {
     background: var(--surface-card);
     padding: 2.5rem;
     border-radius: var(--radius-lg);
     border: 1px solid var(--border-color);
     box-shadow: var(--shadow-sm);
}

.media-title {
     font-size: var(--fs-2xl);
     margin: 1rem 0;
     line-height: 1.2;
     word-break: break-all;
}

.technical-tags {
     display: flex;
     gap: 0.5rem;
     margin-bottom: 2rem;
}

.tech-tag {
     background: var(--bg-color);
     color: var(--text-muted);
     padding: 0.4rem 0.8rem;
     border-radius: var(--radius-sm);
     font-size: 0.7rem;
     font-weight: 700;
     text-transform: uppercase;
     border: 1px solid var(--border-color);
}

.type-tag {
     background: var(--primary-color);
     color: #fff;
     border-color: var(--primary-color);
}

.tech-attributes {
     margin-bottom: 2.5rem;
     background: var(--bg-color);
     padding: 1.5rem;
     border-radius: var(--radius-md);
     display: flex;
     flex-direction: column;
     gap: 1rem;
}

.attr-row {
     display: flex;
     justify-content: space-between;
     align-items: center;
}

.attr-label {
     font-size: var(--fs-xs);
     font-weight: 700;
     color: var(--text-muted);
     text-transform: uppercase;
}

.attr-value {
     font-size: var(--fs-sm);
     font-weight: 600;
     color: var(--text-primary);
     text-align: right;
     flex: 1;
     margin-left: 2rem;
}

.meta-values {
     display: flex;
     flex-direction: column;
     align-items: flex-end;
     gap: 0.25rem;
}

.media-metadata {
     margin-bottom: 3rem;
     display: flex;
     flex-direction: column;
     gap: 1rem;
     max-height: 400px;
     overflow-y: auto;
     padding-right: 1rem;
}

.record-desc-mini {
     font-size: 0.85rem;
     color: var(--text-secondary);
     margin-bottom: 1rem;
     line-height: 1.6;
}

.meta-row {
     display: flex;
     justify-content: space-between;
     padding-bottom: 0.8rem;
     border-bottom: 1px solid var(--border-color);
     gap: 1rem;
}

.meta-label {
     font-size: var(--fs-xs);
     font-weight: 700;
     color: var(--text-muted);
     text-transform: uppercase;
}

.meta-value {
     font-size: var(--fs-sm);
     font-weight: 600;
     color: var(--text-primary);
     text-align: right;
}

.section-label {
     font-size: var(--fs-xs);
     text-transform: uppercase;
     letter-spacing: 0.1em;
     color: var(--primary-color);
     margin-bottom: 1.2rem;
     font-weight: 800;
     display: block;
}

.record-mini-card {
     display: flex;
     gap: 1.5rem;
     background: var(--bg-color);
     padding: 1.5rem;
     border-radius: var(--radius-md);
     align-items: center;
}

.record-thumb {
     width: 80px;
     height: 80px;
     flex-shrink: 0;
     border-radius: var(--radius-sm);
     overflow: hidden;
     border: 1px solid var(--border-color);
}

.record-thumb img {
     width: 100%;
     height: 100%;
     object-fit: cover;
}

.record-info {
     flex: 1;
}

.record-info .record-title {
     font-size: var(--fs-base);
     margin-bottom: 0.5rem;
     color: var(--text-primary);
}

.record-link {
     color: var(--primary-color);
     font-size: var(--fs-xs);
     font-weight: 700;
     text-transform: uppercase;
     text-decoration: underline;
}
.no-metadata-info {
     display: flex;
     flex-direction: column;
     align-items: center;
     justify-content: center;
     padding: 3rem 1.5rem;
     text-align: center;
     background: var(--bg-color);
     border: 1px dashed var(--border-color);
     border-radius: var(--radius-lg);
     color: var(--text-muted);
     margin-bottom: 3rem;
}

.no-meta-icon {
     margin-bottom: 1rem;
     opacity: 0.4;
     color: var(--primary-color);
}

.no-metadata-info p {
     font-size: 0.9rem;
     font-weight: 600;
     margin: 0;
}
</style>
