<template>
     <!-- Componente de paginación reutilizable -->
     <div class="pagination-container" v-if="totalPages > 1">
          <!-- Botón Anterior -->
          <button class="pagination-btn" :disabled="currentPage === 1" @click="$emit('change', currentPage - 1)">
               <span class="arrow">←</span> Anterior
          </button>

          <!-- Indicador de página -->
          <div class="pagination-info">
               <span class="current-page">{{ currentPage }}</span>
               <span class="separator">/</span>
               <span class="total-pages">{{ totalPages }}</span>
          </div>

          <!-- Botón Siguiente -->
          <button class="pagination-btn" :disabled="currentPage === totalPages"
               @click="$emit('change', currentPage + 1)">
               Siguiente <span class="arrow">→</span>
          </button>
     </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
     currentPage: { type: Number, required: true },
     totalItems: { type: Number, required: true },
     itemsPerPage: { type: Number, required: true }
});

defineEmits(['change']);

// Calcula el número total de páginas basándose en los ítems totales
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
