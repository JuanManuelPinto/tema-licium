<template>
     <!-- Tarjeta versátil diseñada para mostrar tanto registros individuales como colecciones -->
     <router-link :to="link" :class="['card-item', `view-${viewMode}`, { 'is-reverse': reverse }]">

          <!-- Contenedor de medios: gestión de miniaturas y estados vacíos -->
          <div class="card-media">
               <img v-if="item.thumbnail" :src="thumbUrl" :alt="item.title" class="card-img" loading="lazy" />
               <div v-else class="card-no-img">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
                         opacity="0.4">
                         <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                         <circle cx="9" cy="9" r="2" />
                         <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                    </svg>
                    <span>{{ typeLabel }}</span>
               </div>

               <!-- Etiqueta flotante que indica la tipografía del elemento (solo si hay imagen) -->
               <div class="card-badge" v-if="item.thumbnail">{{ typeLabel }}</div>

               <!-- Botón de Plugin: Añadir al Portafolio -->
               <button class="btn-workspace" :class="{ 'is-saved': isSaved }" @click.prevent="toggleWorkspace" :title="isSaved ? 'Quitar del Portafolio' : 'Guardar en Portafolio'">
                    <svg v-if="!isSaved" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                         <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                    <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                         <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
               </button>
          </div>

          <!-- Bloque de información: título, descripción condensada y llamada a la acción -->
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
/**
 * Componente CommonCard.
 * 
 * Es el bloque de construcción fundamental para los listados. Permite tres modos
 * de visualización (Grid, List, Magazine) y se adapta dinámicamente al tipo
 * de contenido (Registro o Colección).
 */

import { computed, inject } from 'vue';

const props = defineProps({
     // Datos crudos del elemento (API response)
     item: { type: Object, required: true },
     // Categoría del elemento: 'record' o 'collection'
     type: { type: String, default: 'record' },
     // Estrategia visual: 'grid' (mosaico), 'list' (fila simple) o 'magazine' (diseño editorial)
     viewMode: { type: String, default: 'grid' },
     // Invierte el orden de imagen/texto en el modo 'magazine'
     reverse: { type: Boolean, default: false }
});

// Workspace API inyectada por el plugin
const workspace = inject('workspace');

const toggleWorkspace = (e) => {
     e.preventDefault(); // Evitar navegación al hacer clic en el botón
     if (isSaved.value) {
          workspace.removeItem(props.item.id, props.type);
     } else {
          workspace.addItem(props.item, props.type);
     }
};

const isSaved = computed(() => {
     if (!workspace) return false;
     return workspace.hasItem(props.item.id, props.type);
});

// Genera la ruta de destino según el tipo de objeto
const link = computed(() => ({
     name: props.type === 'collection' ? 'collection-detail' : 'record-detail',
     params: { id: props.item.id }
}));

// Texto descriptivo del tipo de contenido
const typeLabel = computed(() => props.type === 'collection' ? 'Colección' : 'Registro');

// Determina si se debe renderizar la descripción (se oculta en vista Grid por espacio)
const shouldShowDesc = computed(() => props.viewMode !== 'grid');

/**
 * Limpia el contenido HTML de la descripción y trunca el texto
 * para mantener la consistencia visual en los listados.
 */
const cleanDesc = computed(() => {
     let d = props.item.description || '';
     return d.replace(/<[^>]*>?/gm, '').substring(0, 150) + (d.length > 150 ? '...' : '');
});

/**
 * Resuelve la URL de la imagen y aplica lógica de optimización de tamaño
 * basada en el contexto de visualización actual.
 */
const thumbUrl = computed(() => {
     if (!props.item.thumbnail) return '';
     // const domain = 'https://arcadium.cluster24.libnamic.eu';
     let path = props.item.thumbnail;
     // let full = path.startsWith('http') ? path : `${domain}${path}`;
     const sep = path.startsWith('/') || path.startsWith('http') ? '' : '/';
     let full = path.startsWith('http') ? path : `${sep}${path}`;

     // Ajuste de calidad y tamaño según el modo visual
     if (props.viewMode === 'magazine') return full.replace(/size=\w+/, 'size=large');
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
     text-decoration: none;
     color: inherit;
}

.card-item:hover {
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

.card-no-img {
     width: 100%;
     height: 100%;
     display: flex;
     flex-direction: column;
     align-items: center;
     justify-content: center;
     background: var(--surface-color);
     color: var(--text-muted);
     gap: 0.8rem;
     font-weight: 700;
     text-transform: uppercase;
     letter-spacing: 0.1em;
     font-size: 0.7rem;
     border: 1px dashed var(--border-color);
}

.card-img {
     width: 100%;
     height: 100%;
     object-fit: contain;
     padding: 1.5rem;
     transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
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

.btn-workspace {
     position: absolute;
     bottom: 1rem;
     right: 1rem;
     width: 36px;
     height: 36px;
     border-radius: 50%;
     background: rgba(255, 255, 255, 0.9);
     border: 1px solid var(--border-color);
     color: var(--text-secondary);
     display: flex;
     align-items: center;
     justify-content: center;
     cursor: pointer;
     transition: all 0.2s;
     z-index: 10;
     opacity: 0;
     transform: translateY(10px);
}

.card-item:hover .btn-workspace {
     opacity: 1;
     transform: translateY(0);
}

.btn-workspace:hover {
     background: var(--surface-color);
     color: var(--primary-color);
     transform: scale(1.1) !important;
}

.btn-workspace.is-saved {
     opacity: 1;
     transform: translateY(0);
     color: var(--primary-color);
     border-color: var(--primary-color);
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
     -webkit-line-clamp: 3;
     line-clamp: 3;
     -webkit-box-orient: vertical;
     overflow: hidden;
     overflow-wrap: anywhere;
     word-break: break-word;
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
     height: auto;
     min-height: 220px;
}

.view-list .card-media {
     width: 320px;
     min-width: 320px;
     flex-shrink: 0;
     aspect-ratio: auto;
     display: flex;
     align-items: center;
     justify-content: center;
}

.view-list .card-body {
     justify-content: flex-start;
     min-width: 0;
     /* clave en flex-row para permitir que el texto envuelva */
     flex: 1 1 auto;
}

.view-list .card-title {
     /* En lista priorizamos legibilidad: sin clamp para evitar títulos cortados */
     display: block !important;
     -webkit-line-clamp: initial;
     line-clamp: initial;
     -webkit-box-orient: initial;
     overflow: visible;
     white-space: normal;
     max-width: 100%;
}

/* Magazine Mode - Diseño más elegante y editorial */
.view-magazine {
     flex-direction: row;
     min-height: 450px;
     background: var(--surface-card);
     border: none;
     border-radius: 0;
     border-bottom: 1px solid var(--border-color);
}

.view-magazine:hover {
     transform: none;
     box-shadow: none;
     background: rgba(212, 175, 55, 0.03);
}

.view-magazine.is-reverse {
     flex-direction: row-reverse;
}

.view-magazine .card-media {
     width: 50%;
     aspect-ratio: auto;
     background: transparent;
}

.view-magazine .card-img {
     padding: 3rem;
     object-fit: contain;
}

.view-magazine .card-body {
     padding: 5rem;
     justify-content: center;
     max-width: 600px;
}

.view-magazine .card-title {
     font-size: 3rem;
     font-family: var(--font-heading);
     line-height: 1.1;
     margin-bottom: 2rem;
     -webkit-line-clamp: 4;
     line-clamp: 4;
     color: var(--text-primary);
}

.view-magazine .card-text {
     font-size: 1.2rem;
     line-height: 1.8;
     color: var(--text-secondary);
     margin-bottom: 3rem;
}

.view-magazine .card-badge {
     top: 2rem;
     left: 2rem;
     right: auto;
}

.view-magazine.is-reverse .card-badge {
     right: 2rem;
     left: auto;
}

.view-magazine .btn-more {
     letter-spacing: 0.1em;
     border-bottom: 2px solid var(--primary-color);
     padding-bottom: 0.5rem;
     width: fit-content;
}

@media (max-width: 1100px) {
     .view-magazine .card-body {
          padding: 3rem;
     }

     .view-magazine .card-title {
          font-size: 2.2rem;
     }
}

@media (max-width: 900px) {
     .view-magazine {
          flex-direction: column !important;
          height: auto;
          min-height: auto;
          padding-bottom: 3rem;
     }

     .view-magazine .card-media {
          width: 100%;
          aspect-ratio: 16/9;
     }

     .view-magazine .card-body {
          padding: 2rem;
          max-width: 100%;
     }

     .view-magazine .card-title {
          font-size: 1.8rem;
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
