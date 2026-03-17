<template>
     <!-- Tarjeta Reutilizable con Sistema de Diseño -->
     <router-link :to="link" :class="['card-item', `view-${viewMode}`, { 'is-reverse': reverse }]">

          <!-- Imagen / Miniatura -->
          <div class="card-media">
               <img v-if="item.thumbnail" :src="thumbUrl" :alt="item.title" class="card-img" loading="lazy" />
               <div v-else class="card-no-img">
                    <span>{{ typeLabel }}</span>
               </div>

               <!-- Badge flotante -->
               <div class="card-badge">{{ typeLabel }}</div>
          </div>

          <!-- Contenido -->
          <div class="card-body">
               <h3 class="card-title">{{ item.title || 'Sin Título' }}</h3>
               <p class="card-text" v-if="shouldShowDesc">{{ cleanDesc }}</p>

               <div class="card-footer" v-if="viewMode !== 'grid'">
                    <span class="btn-more">Ver Detalles →</span>
               </div>
          </div>
     </router-link>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
     item: { type: Object, required: true },
     type: { type: String, default: 'record' },
     viewMode: { type: String, default: 'grid' },
     reverse: { type: Boolean, default: false }
});

const link = computed(() => ({
     name: props.type === 'collection' ? 'collection-detail' : 'record-detail',
     params: { id: props.item.id }
}));

const typeLabel = computed(() => props.type === 'collection' ? 'Colección' : 'Registro');
const shouldShowDesc = computed(() => props.viewMode !== 'grid');

const cleanDesc = computed(() => {
     let d = props.item.description || '';
     return d.replace(/<[^>]*>?/gm, '').substring(0, 150) + (d.length > 150 ? '...' : '');
});

const thumbUrl = computed(() => {
     if (!props.item.thumbnail) return '';
     const domain = 'https://arcadium.cluster24.libnamic.eu';
     let path = props.item.thumbnail;
     let full = path.startsWith('http') ? path : `${domain}${path}`;

     // Optimización de tamaño según modo
     if (props.viewMode === 'banners') return full.replace(/size=\w+/, 'size=large');
     return full.replace(/size=\w+/, 'size=medium');
});
</script>

<style scoped>
.card-item {
     display: flex;
     flex-direction: column;
     background: var(--surface-card);
     border: 1px solid var(--border-color);
     border-radius: var(--radius-lg);
     overflow: hidden;
     transition: all var(--transition-normal);
}

.card-item:hover {
     transform: translateY(-8px);
     box-shadow: var(--shadow-md);
     border-color: var(--primary-color);
}

.card-media {
     position: relative;
     background: var(--bg-color);
     width: 100%;
     aspect-ratio: 4 / 3;
     overflow: hidden;
}

.card-img {
     width: 100%;
     height: 100%;
     object-fit: contain;
     padding: 1.5rem;
     transition: transform var(--transition-slow);
}

.card-item:hover .card-img {
     transform: scale(1.05);
}

.card-badge {
     position: absolute;
     top: 1rem;
     right: 1rem;
     background: rgba(var(--surface-color), 0.9);
     padding: 0.2rem 0.6rem;
     border-radius: var(--radius-sm);
     font-size: 0.65rem;
     font-weight: 700;
     text-transform: uppercase;
     color: var(--primary-color);
     backdrop-filter: blur(4px);
}

.card-body {
     padding: 1.5rem;
     flex: 1;
     display: flex;
     flex-direction: column;
}

.card-title {
     font-size: 1.25rem;
     margin-bottom: 0.8rem;
     display: -webkit-box;
     -webkit-line-clamp: 2;
     line-clamp: 2;
     -webkit-box-orient: vertical;
     overflow: hidden;
}

.card-text {
     font-size: 0.95rem;
     color: var(--text-secondary);
     margin-bottom: 1.5rem;
     flex: 1;
}

.btn-more {
     color: var(--primary-color);
     font-size: 0.8rem;
     font-weight: 700;
     text-transform: uppercase;
}

/* VARIACIONES DE VISTA */

/* List Mode */
.view-list {
     flex-direction: row;
     height: 200px;
}

.view-list .card-media {
     width: 300px;
     aspect-ratio: auto;
}

.view-list .card-body {
     justify-content: center;
}

/* Banner Mode */
.view-banners {
     flex-direction: row;
     min-height: 400px;
}

.view-banners .card-media {
     width: 45%;
     aspect-ratio: auto;
}

.view-banners .card-body {
     padding: 4rem;
     justify-content: center;
}

.view-banners .card-title {
     font-size: 2.5rem;
     -webkit-line-clamp: 3;
     line-clamp: 3;
}

.view-banners .card-text {
     font-size: 1.1rem;
}

@media (max-width: 900px) {
     .view-banners {
          flex-direction: column;
          height: auto;
     }

     .view-banners .card-media {
          width: 100%;
          aspect-ratio: 16/9;
     }

     .view-banners .card-body {
          padding: 2rem;
     }
}

@media (max-width: 600px) {
     .view-list {
          flex-direction: column;
          height: auto;
     }

     .view-list .card-media {
          width: 100%;
          aspect-ratio: 4/3;
     }
}
</style>
