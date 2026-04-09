<template>
  <div class="media-view-page container fade-in">
    <header class="page-header">
      <div class="header-nav">
        <button @click="$router.back()" class="btn-back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Volver al registro
        </button>
      </div>
      <div v-if="record">
        <h1 class="page-title">Medios de <span class="highlight">{{ record.title }}</span></h1>
        <p class="page-subtitle">Galería completa con {{ record.media_items?.length }} elementos.</p>
      </div>
    </header>

    <div v-if="loading" class="loading-wrapper"><span class="loader"></span></div>
    <div v-else-if="record" class="media-grid">
      <div v-for="(m, idx) in record.media_items" :key="m.id" class="media-card" @click="openLightbox(idx)">
        <div class="media-thumb-wrapper">
          <img :src="getThumbnail(m.thumbnail || m.path, 'large')" :alt="m.title || 'Imagen'" class="media-img"
            loading="lazy" />
          <div class="media-overlay">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
            </svg>
          </div>
        </div>
        <div class="media-info">
          <h3 class="media-title" v-if="m.title">{{ m.title }}</h3>
          <div class="media-actions-row">
            <router-link :to="{ name: 'media-detail', params: { id: getId(m) }, query: { from: route.fullPath } }"
              class="btn-media-detail" @click.stop>
              Ver detalles
            </router-link>
            <a v-if="isPdf(m)" :href="getOriginalUrl(m)" target="_blank" class="btn-view-pdf" @click.stop>
              Ver PDF
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Lightbox -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showLightbox" class="lightbox" @click.self="closeLightbox">
          <button class="lightbox-close" @click="closeLightbox">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>

          <button class="lightbox-nav prev" @click="prevImage" v-if="record.media_items?.length > 1">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>

          <div class="lightbox-viewer" :class="{ 'is-zoomed': isZoomed }">
            <img
              :src="getThumbnail(record.media_items[currentImageIndex]?.path || record.media_items[currentImageIndex]?.thumbnail, 'large')"
              class="lightbox-img" @click="toggleZoom" />
            <div class="lightbox-caption" v-if="record.media_items[currentImageIndex]?.title">
              {{ record.media_items[currentImageIndex].title }}
            </div>
          </div>

          <button class="lightbox-nav next" @click="nextImage" v-if="record.media_items?.length > 1">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const record = ref(null);
const loading = ref(true);

const showLightbox = ref(false);
const currentImageIndex = ref(0);
const isZoomed = ref(false);

const fetchRecord = async () => {
  loading.value = true;
  try {
    const id = route.params.id;
    const res = await axios.get(`/api/glam/record/${id}`, {
      params: {
        fields: 'id,title,media_items.id,media_items.path,media_items.thumbnail,media_items.title,media_items.mimetype,media_items.extension,media_items.attachment'
      }
    });
    record.value = res.data.item || res.data;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const ensureString = (val) => {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (Array.isArray(val)) return val.length > 0 ? ensureString(val[0]) : '';
  if (typeof val === 'object') {
    const candidate = val.translated_label || val.label || val.value || val['@id'] || val.uri || val.id || val.filename || '';
    return typeof candidate === 'string' ? candidate : ensureString(candidate);
  }
  return String(val);
};

const getThumbnail = (rawPath, size = 'large') => {
  const path = ensureString(rawPath);
  if (!path) return '';
  const domain = 'https://arcadium.cluster24.libnamic.eu';
  let full = path.startsWith('http') ? path : `${domain}${path}`;
  return full.replace(/size=\w+/, `size=${size}`);
};

const isPdf = (m) => {
  if (!m) return false;
  // Comprobar mimetype y extensión tanto en el nivel superior como dentro de attachment
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
};

const getOriginalUrl = (m) => {
  if (!m) return '#';
  const domain = 'https://arcadium.cluster24.libnamic.eu';

  // 1. Prioridad: URL directa del adjunto si está disponible en la respuesta
  const attachmentUrl = m.attachment?.url || m.url;
  if (attachmentUrl && typeof attachmentUrl === 'string') {
    return attachmentUrl.startsWith('http') ? attachmentUrl : `${domain}${attachmentUrl}`;
  }

  // 2. Prioridad: ID específico del adjunto (distinto del ID del medio)
  const attachmentId = m.attachment?.id || m.attachment_id;
  if (attachmentId) {
    return `${domain}/api/core/attachment/action_get/file?attachment_id=${attachmentId}`;
  }

  // 3. Fallback: ID del medio (para compatibilidad)
  const mediaId = getId(m);
  if (mediaId && mediaId !== '#') {
    return `${domain}/api/core/attachment/action_get/file?attachment_id=${mediaId}`;
  }

  // 4. Último recurso: Resolver por rutas
  const path = ensureString(m.path || m.thumbnail);
  if (!path || path === '#') return '#';
  const separator = path.startsWith('http') || path.startsWith('/') ? '' : '/';
  return path.startsWith('http') ? path : `${domain}${separator}${path}`;
};

const getId = (m) => {
  const rawId = m.id || m['@id'];
  if (!rawId) return null;
  if (typeof rawId === 'string' && rawId.includes('/')) {
    const parts = rawId.split('/');
    return parts[parts.length - 1];
  }
  return rawId;
};

const openLightbox = (index) => {
  currentImageIndex.value = index;
  showLightbox.value = true;
  document.body.style.overflow = 'hidden';
};

const closeLightbox = () => {
  showLightbox.value = false;
  isZoomed.value = false;
  document.body.style.overflow = '';
};

const toggleZoom = () => isZoomed.value = !isZoomed.value;
const nextImage = () => {
  const total = record.value.media_items?.length || 0;
  isZoomed.value = false;
  currentImageIndex.value = (currentImageIndex.value + 1) % total;
};
const prevImage = () => {
  const total = record.value.media_items?.length || 0;
  isZoomed.value = false;
  currentImageIndex.value = (currentImageIndex.value - 1 + total) % total;
};

const handleKeydown = (e) => {
  if (!showLightbox.value) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowRight') nextImage();
  if (e.key === 'ArrowLeft') prevImage();
};

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
  fetchRecord();
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
.media-view-page {
  padding-top: var(--spacing-xl);
  padding-bottom: var(--spacing-3xl);
}

.header-nav {
  margin-bottom: 2rem;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-weight: 600;
  font-size: var(--fs-xs);
  text-transform: uppercase;
  transition: color 0.3s;
}

.btn-back:hover {
  color: var(--primary-color);
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

.media-card {
  background: var(--surface-card);
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.media-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-md);
}

.media-thumb-wrapper {
  position: relative;
  aspect-ratio: 1/1;
  overflow: hidden;
  background: #fff;
  border-bottom: 1px solid var(--border-color);
}

.media-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 1rem;
  transition: transform 0.5s;
}

.media-card:hover .media-img {
  transform: scale(1.05);
}

.media-overlay {
  position: absolute;
  inset: 0;
  background: rgba(var(--primary-color-rgb), 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
  color: #fff;
}

.media-card:hover .media-overlay {
  opacity: 1;
}

.media-info {
  padding: 0.75rem 1rem;
}

.media-actions-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.media-title {
  font-size: 0.8rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-media-detail,
.btn-view-pdf {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-decoration: underline;
  text-underline-offset: 2px;
  transition: all 0.3s;
}

.btn-media-detail {
  color: var(--primary-color);
}

.btn-view-pdf {
  color: #e74c3c;
}

.btn-media-detail:hover,
.btn-view-pdf:hover {
  color: var(--text-primary);
  text-underline-offset: 4px;
}

@media (max-width: 768px) {
  .media-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 1rem;
  }

  .media-img {
    padding: 0.5rem;
  }
}

@media (max-width: 480px) {
  .media-grid {
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 0.75rem;
  }
}

.loading-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 40vh;
}
</style>

<style>
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
</style>
