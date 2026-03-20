<template>
     <!-- Vista de Detalle de Registro: Interfaz enriquecida para la exploración de metadatos y medios -->
     <div class="record-page fade-in">

          <!-- Estado de carga: Visualización transicional durante la recuperación de datos -->
          <div v-if="loading" class="loading-wrapper">
               <span class="loader"></span>
               Cargando registro...
          </div>

          <!-- Contenedor principal del registro: Renderizado una vez confirmada la disponibilidad de datos -->
          <div v-else-if="record" class="record-container">

               <!-- Encabezado del registro: Gestión de navegación y jerarquía de títulos -->
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
                              <!-- Referencias a colecciones que contienen este registro -->
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

                         <!-- Bloque Multimedia: Gestión de imagen principal y carrusel de galería -->
                         <div class="media-section">
                              <div class="sticky-media">
                                   <!-- Visualizador principal con trigger para el modo a pantalla completa -->
                                   <div class="main-image-wrapper" @click="openLightbox"
                                        title="Click para ver en grande">
                                        <img v-if="selectedImage" :src="getThumbnail(selectedImage, 'large')"
                                             class="main-img" alt="Imagen del registro" />
                                        <img v-else-if="record.thumbnail" :src="getThumbnail(record.thumbnail, 'large')"
                                             class="main-img" alt="Imagen del registro" />
                                        <div v-else class="no-img-placeholder">Registro</div>
                                   </div>

                                   <!-- Selector de galería para registros con múltiples elementos de medios -->
                                   <div class="gallery-section" v-if="record.media_items?.length">
                                        <h3 class="section-label">Galería de Imágenes</h3>
                                        <div class="gallery-scroll">
                                             <div v-for="(m, idx) in record.media_items" :key="m.id"
                                                  class="gallery-thumb" :class="{ 'active': isSelected(m) }"
                                                  @click="setMainImage(m)">
                                                  <img :src="getThumbnail(m.thumbnail || m.path, 'small')"
                                                       :alt="m.title || 'Miniatura'" />
                                             </div>
                                        </div>
                                   </div>
                              </div>
                         </div>

                         <!-- Bloque Informativo: Descripción narrativa y ficha técnica de metadatos -->
                         <div class="info-section">
                              <!-- Área de descripción con soporte para contenido HTML -->
                              <div class="description-area" v-if="record.description">
                                   <h3 class="section-label">Descripción</h3>
                                   <div class="description-text" v-html="record.description"></div>
                              </div>

                              <!-- Ficha técnica institucional basada en metadatos canónicos -->
                              <div class="metadata-card" v-if="record.canonical_joined_metadata">
                                   <h3 class="section-label">Ficha Técnica</h3>
                                   <div class="metadata-list">
                                        <template v-for="(meta, key) in record.canonical_joined_metadata" :key="key">
                                             <div class="metadata-item" v-if="meta.values?.length">
                                                  <div class="metadata-label">{{ meta.label || key }}</div>
                                                  <div class="metadata-value">
                                                       {{meta.values.map(v => formatValue(v)).join(', ')}}
                                                  </div>
                                             </div>
                                        </template>
                                   </div>
                              </div>
                         </div>

                    </div>
               </div>

               <!-- Visor Inmersivo (Lightbox): Proyectado mediante Teleport para evitar colisiones de Z-index -->
               <Teleport to="body">
                    <Transition name="fade">
                         <div v-if="showLightbox" class="lightbox" @click.self="closeLightbox">

                              <!-- Interfaz de control del visor -->
                              <button class="lightbox-close" @click="closeLightbox" title="Cerrar">
                                   <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        stroke-width="2.5">
                                        <path d="M18 6 6 18M6 6l12 12" />
                                   </svg>
                              </button>

                              <!-- Controles de navegación secuencial -->
                              <button class="lightbox-nav prev" @click="prevImage"
                                   v-if="record.media_items?.length > 1">
                                   <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        stroke-width="2">
                                        <path d="m15 18-6-6 6-6" />
                                   </svg>
                              </button>

                              <!-- Contenedor de la imagen proyectada con soporte para zoom reactivo -->
                              <div class="lightbox-viewer" :class="{ 'is-zoomed': isZoomed }">
                                   <img :src="getThumbnail(record.media_items[currentImageIndex]?.path || record.media_items[currentImageIndex]?.thumbnail || record.thumbnail, 'large')"
                                        class="lightbox-img" @click="toggleZoom"
                                        :title="isZoomed ? 'Click para reducir' : 'Click para zoom'" />

                                   <div class="lightbox-caption" v-if="record.media_items[currentImageIndex]?.title">
                                        {{ record.media_items[currentImageIndex].title }}
                                   </div>
                              </div>

                              <button class="lightbox-nav next" @click="nextImage"
                                   v-if="record.media_items?.length > 1">
                                   <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        stroke-width="2">
                                        <path d="m9 18 6-6-6-6" />
                                   </svg>
                              </button>

                         </div>
                    </Transition>
               </Teleport>

          </div>
     </div>
</template>

<script setup>
/**
 * Vista RecordDetail.
 * 
 * Este componente es responsable de orquestar la visualización profunda de un
 * registro individual. Gestiona la recuperación de metadatos exhaustivos,
 * el estado dinámico de la galería multimedia y el ciclo de vida del visor
 * interactivo (lightbox), asegurando una experiencia de usuario fluida y coherente.
 */

import { ref, onMounted, watch, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const record = ref(null);
const loading = ref(true);

// Gestión de la imagen focal de la ficha técnica
const selectedImage = ref(null);

// Estado del sistema de visualización a pantalla completa (Lightbox)
const showLightbox = ref(false);
const currentImageIndex = ref(0);
const isZoomed = ref(false);

/**
 * Solicita los datos detallados del registro al servidor GLAM.
 * Configura la respuesta para incluir etiquetas de metadatos y elementos multimedia.
 */
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

          // Se establece la miniatura por defecto como imagen seleccionada inicial
          selectedImage.value = record.value.thumbnail;

     } catch (e) {
          console.error("Error crítico al recuperar el detalle del registro:", e);
     } finally {
          loading.value = false;
          // Garantiza el posicionamiento superior tras la navegación/carga
          window.scrollTo({ top: 0, behavior: 'smooth' });
     }
};

/**
 * Actualiza la referencia de la imagen principal mostrada en la sección multimedia.
 */
const setMainImage = (media) => {
     const path = media.path || media.thumbnail;
     selectedImage.value = path;
};

/**
 * Predicado para determinar si un medio específico es el que se proyecta actualmente.
 */
const isSelected = (media) => {
     const path = media.path || media.thumbnail;
     return selectedImage.value === path;
};

/**
 * Inicializa la sesión del visor inmersivo.
 * Bloquea el scroll del documento para focalizar la atención del usuario.
 */
const openLightbox = () => {
     if (!record.value) return;

     const items = record.value.media_items || [];
     // Sincronización del índice del visor con la imagen focal actual
     const idx = items.findIndex(m => (m.path || m.thumbnail) === selectedImage.value);

     currentImageIndex.value = idx !== -1 ? idx : 0;
     showLightbox.value = true;
     document.body.style.overflow = 'hidden';
};

/**
 * Finaliza la sesión del visor inmersivo y restaura la interactividad global.
 */
const closeLightbox = () => {
     showLightbox.value = false;
     isZoomed.value = false;
     document.body.style.overflow = '';
};

/**
 * Alterna dinámicamente el estado de zoom (acercamiento) de la imagen proyectada.
 */
const toggleZoom = () => {
     isZoomed.value = !isZoomed.value;
};

/**
 * Transición hacia el siguiente elemento multimedia de la colección.
 * Reinicia el estado de zoom para mantener la coherencia visual.
 */
const nextImage = () => {
     const total = record.value.media_items?.length || 0;
     if (total <= 1) return;
     isZoomed.value = false;
     currentImageIndex.value = (currentImageIndex.value + 1) % total;
};

/**
 * Transición hacia el elemento multimedia previo.
 */
const prevImage = () => {
     const total = record.value.media_items?.length || 0;
     if (total <= 1) return;
     isZoomed.value = false;
     currentImageIndex.value = (currentImageIndex.value - 1 + total) % total;
};

/**
 * Gestor global de teclado para facilitar la navegación rápida y el cierre mediante atajos estándar.
 */
const handleKeydown = (e) => {
     if (!showLightbox.value) return;
     if (e.key === 'Escape') closeLightbox();
     if (e.key === 'ArrowRight') nextImage();
     if (e.key === 'ArrowLeft') prevImage();
};

onMounted(() => {
     window.addEventListener('keydown', handleKeydown);
     fetchDetail();
});

onUnmounted(() => {
     window.removeEventListener('keydown', handleKeydown);
});

/**
 * Normaliza los valores de metadatos complejos priorizando las etiquetas traducidas
 * para asegurar la legibilidad en entornos multilingües o dinámicos.
 */
const formatValue = (val) => {
     if (!val) return '';
     if (typeof val !== 'object') return val;
     return val.translated_label || val.label || val['@value'] || val.value || val['@id'] || JSON.stringify(val);
};

/**
 * Resuelve la ruta absoluta de la imagen aplicando parámetros de optimización
 * para el CDN (tamaño y calidad).
 */
const getThumbnail = (path, size = 'large') => {
     if (!path) return '';
     const domain = 'https://arcadium.cluster24.libnamic.eu';
     let full = path.startsWith('http') ? path : `${domain}${path}`;
     return full.replace(/size=\w+/, `size=${size}`);
};

// Reinicia la carga de datos si el parámetro ID de la ruta cambia durante la sesión
watch(() => route.params.id, (id) => { if (id) fetchDetail(); });
</script>


<style scoped>
/**
 * Estilos específicos de la página de detalle
 */
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
     cursor: pointer;
     transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.main-image-wrapper:hover {
     transform: scale(1.02);
}

.main-img {
     width: 100%;
     height: 100%;
     object-fit: contain;
     padding: 2rem;
}

.no-img-placeholder {
     color: var(--text-muted);
     font-weight: 700;
     text-transform: uppercase;
     letter-spacing: 0.1em;
     font-size: var(--fs-md);
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
     /* Añadimos padding en todos los lados para que el escalado y las sombras no se corten */
     padding: 0.5rem;
     padding-bottom: 1.5rem;
     margin: -0.5rem;
     scrollbar-width: thin;
}

.gallery-thumb {
     flex: 0 0 100px;
     height: 100px;
     border-radius: var(--radius-md);
     overflow: hidden;
     /* Usamos un borde de 2px siempre para evitar que el contenido "salte" al activarse */
     border: 2px solid var(--border-color);
     cursor: pointer;
     transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.gallery-thumb:hover {
     transform: scale(1.05);
     border-color: var(--text-muted);
     z-index: 2;
}

.gallery-thumb.active {
     border-color: var(--primary-color);
     /* Sombra interna para asegurar que sea visible sin depender del clipping del padre */
     box-shadow: 0 0 0 2px var(--primary-color), inset 0 0 0 2px rgba(255, 255, 255, 0.2);
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

<style>
/**
 * Estilos globales del Visor (Lightbox)
 * Se usan estilos no-scoped para permitir que el componente <Teleport> funcione correctamente sobre el <body>.
 */
.lightbox {
     position: fixed;
     inset: 0;
     background: rgba(0, 0, 0, 0.92);
     backdrop-filter: blur(12px);
     z-index: 10000;
     display: flex;
     align-items: center;
     justify-content: center;
     overflow: hidden;
     user-select: none;
}

.lightbox-viewer {
     position: relative;
     max-width: 90vw;
     max-height: 85vh;
     display: flex;
     flex-direction: column;
     align-items: center;
     transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Estado ampliado de la imagen */
.is-zoomed {
     transform: scale(1.4);
}

.lightbox-img {
     max-width: 100%;
     max-height: 80vh;
     object-fit: contain;
     cursor: zoom-in;
     transition: all 0.3s;
     box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
}

.is-zoomed .lightbox-img {
     cursor: zoom-out;
}

.lightbox-caption {
     color: #fff;
     margin-top: 1.5rem;
     font-size: var(--fs-md);
     font-weight: 500;
     text-align: center;
     text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
     opacity: 0.8;
}

/* Botón de cierre en la esquina superior */
.lightbox-close {
     position: absolute;
     top: 2rem;
     right: 2rem;
     color: #fff;
     background: rgba(255, 255, 255, 0.1);
     border: none;
     border-radius: 50%;
     width: 50px;
     height: 50px;
     display: flex;
     align-items: center;
     justify-content: center;
     cursor: pointer;
     transition: all 0.3s;
     z-index: 10010;
}

.lightbox-close:hover {
     background: rgba(255, 255, 255, 0.2);
     transform: rotate(90deg);
}

/* Controles de navegación laterales */
.lightbox-nav {
     position: absolute;
     top: 50%;
     transform: translateY(-50%);
     background: rgba(255, 255, 255, 0.05);
     color: #fff;
     border: none;
     width: 60px;
     height: 100px;
     display: flex;
     align-items: center;
     justify-content: center;
     cursor: pointer;
     transition: all 0.3s;
     z-index: 10005;
}

.lightbox-nav:hover {
     background: rgba(255, 255, 255, 0.15);
}

.lightbox-nav.prev {
     left: 0;
     border-radius: 0 10px 10px 0;
}

.lightbox-nav.next {
     right: 0;
     border-radius: 10px 0 0 10px;
}

/* Animaciones de entrada/salida */
.fade-enter-active,
.fade-leave-active {
     transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
     opacity: 0;
}

/* Ajustes adaptativos para dispositivos móviles */
@media (max-width: 768px) {
     .lightbox-nav {
          width: 44px;
          height: 80px;
     }

     .lightbox-close {
          top: 1rem;
          right: 1rem;
     }

     .lightbox-caption {
          font-size: var(--fs-sm);
          padding: 0 1rem;
     }

     .is-zoomed {
          transform: scale(1.1);
          /* Zoom reducido en móviles para evitar recortes excesivos */
     }
}
</style>
