<template>
     <!-- Componente de control de paginación para la navegación entre conjuntos de datos -->
     <div class="pagination-container" v-if="totalPages > 1">
          <!-- Botón de retroceso: Deshabilitado si el usuario se encuentra en la primera página -->
          <button class="pagination-btn" :disabled="currentPage === 1" @click="$emit('change', currentPage - 1)">
               <span class="arrow">←</span> Anterior
          </button>

          <!-- Indicador visual del estado actual de la paginación -->
          <div class="pagination-info">
               <span class="current-page">{{ currentPage }}</span>
               <span class="separator">/</span>
               <span class="total-pages">{{ totalPages }}</span>
          </div>

          <!-- Botón de avance: Deshabilitado al alcanzar la última página disponible -->
          <button class="pagination-btn" :disabled="currentPage === totalPages"
               @click="$emit('change', currentPage + 1)">
               Siguiente <span class="arrow">→</span>
          </button>
     </div>
</template>

<script setup>
/**
 * Componente ThePagination.
 * 
 * Facilita la navegación secuencial a través de múltiples páginas de resultados.
 * Calcula automáticamente el rango total y emite eventos de cambio de página.
 */

import { computed } from 'vue';

const props = defineProps({
     // Índice de la página actualmente visualizada
     currentPage: { type: Number, required: true },
     // Cantidad total de elementos en el conjunto de datos completo
     totalItems: { type: Number, required: true },
     // Límite de elementos permitidos por cada página
     itemsPerPage: { type: Number, required: true }
});

// Definición del evento emitido al usuario final para solicitar un cambio de página
defineEmits(['change']);

/**
 * Cálculo derivado del número total de páginas.
 * Utiliza Math.ceil para asegurar que los elementos residuales tengan su propia página.
 */
const totalPages = computed(() => Math.ceil(props.totalItems / props.itemsPerPage));
</script>


<style scoped>
.pagination-container {
     display: flex;
     justify-content: center;
     align-items: center;
     gap: 2rem;
     margin: 4rem 0;
     padding-top: 2rem;
     border-top: 1px solid var(--border-color);
}

.pagination-btn {
     display: flex;
     align-items: center;
     gap: 0.5rem;
     padding: 0.8rem 1.5rem;
     background-color: var(--surface-color);
     border: 1px solid var(--border-color);
     border-radius: var(--radius-md);
     color: var(--text-primary);
     font-weight: 600;
     text-transform: uppercase;
     font-size: 0.85rem;
}

.pagination-btn:hover:not(:disabled) {
     border-color: var(--accent-color);
     color: var(--accent-color);
}

.pagination-btn:disabled {
     opacity: 0.4;
     cursor: not-allowed;
}

.pagination-info {
     display: flex;
     gap: 0.5rem;
     font-family: var(--font-heading);
     font-size: 1.2rem;
     color: var(--text-secondary);
}

.current-page {
     color: var(--text-primary);
     font-weight: 700;
}

.separator {
     opacity: 0.3;
}

@media (max-width: 600px) {
     .pagination-container {
          gap: 1rem;
     }

     .pagination-btn {
          padding: 0.6rem 1rem;
          font-size: 0.75rem;
     }

     .pagination-info {
          font-size: 1rem;
     }
}
</style>
