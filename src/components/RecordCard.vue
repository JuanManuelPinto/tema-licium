<template>
     <!-- Tarjeta simplificada para la visualización rápida de registros -->
     <div class="record-card" v-if="record">
          <!-- Contenedor de la miniatura del registro -->
          <div class="image-container">
               <img :src="record.thumbnail || 'https://via.placeholder.com/300x200'"
                    :alt="record.title || 'Imagen de registro'">
               
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
          <!-- Información básica: Título del registro -->
          <div class="info">
               <h3>{{ record.title || 'Sin título' }}</h3>
          </div>
     </div>
</template>

<script setup>
/**
 * Componente RecordCard.
 * 
 * Una representación visual compacta de un registro, optimizada para
 * ser utilizada en rejillas de resultados o secciones de recomendaciones.
 */

import { inject, computed } from 'vue';

// Definición de las propiedades recibidas (props)
const props = defineProps(['record']);

// Workspace API inyectada por el plugin
const workspace = inject('workspace');

const toggleWorkspace = (e) => {
     e.preventDefault();
     if (isSaved.value) {
          workspace.removeItem(props.record.id, 'record');
     } else {
          workspace.addItem(props.record, 'record');
     }
};

const isSaved = computed(() => {
     if (!workspace) return false;
     return workspace.hasItem(props.record.id, 'record');
});
</script>


<style lang="scss" scoped>
@use "../assets/scss/variables" as *;

.record-card {
     background: white;
     border-radius: $border-radius;
     overflow: hidden;
     box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
     transition: $transition;
     cursor: pointer;

     &:hover {
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
     }

     .image-container {
          height: 200px;
          position: relative;

          img {
               width: 100%;
               height: 100%;
               object-fit: cover;
          }

          .btn-workspace {
               position: absolute;
               bottom: 0.5rem;
               right: 0.5rem;
               width: 32px;
               height: 32px;
               border-radius: 50%;
               background: var(--surface-color);
               border: 1px solid var(--border-color);
               color: var(--text-primary);
               display: flex;
               align-items: center;
               justify-content: center;
               cursor: pointer;
               transition: all 0.2s;
               opacity: 0;
               transform: translateY(10px);
               z-index: 10;
          }
     }

     &:hover .btn-workspace {
          opacity: 1;
          transform: translateY(0);
     }

     .btn-workspace:hover {
          background: var(--surface-color, #fff);
          color: var(--primary-color, #0056b3);
          transform: scale(1.1);
     }

     .btn-workspace.is-saved {
          opacity: 1;
          transform: translateY(0);
          color: var(--primary-color, #0056b3);
          border-color: var(--primary-color, #0056b3);
     }

     .info {
          padding: 1rem;

          h3 {
               font-size: 1.1rem;
               margin: 0.5rem 0;
               color: $primary-color;
               display: -webkit-box;
               -webkit-line-clamp: 2;
               -webkit-box-orient: vertical;
               overflow: hidden;
          }
     }
}
</style>