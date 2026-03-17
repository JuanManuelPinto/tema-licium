<template>
     <div class="container section-padding fade-in">
          <header class="page-header">
               <h1 class="page-title">Listado de <span class="highlight">Colecciones</span></h1>
               <p class="page-subtitle">Explora todas las colecciones disponibles.</p>
          </header>

          <div class="toolbar" v-if="!loading">
               <div class="view-options">
                    <button v-for="mode in ['grid', 'list', 'banners']" :key="mode" @click="viewMode = mode"
                         :class="{ 'active': viewMode === mode }">
                         {{ mode }}
                    </button>
               </div>
               <div class="stats">{{ totalItems }} Colecciones encontradas</div>
          </div>

          <div v-if="loading" class="loading-wrapper"><span class="loader"></span></div>
          <div v-else>
               <div :class="['grid-layout', `view-${viewMode}`]">
                    <CommonCard v-for="(col, idx) in collections" :key="col.id" :item="col" type="collection"
                         :view-mode="viewMode" :reverse="idx % 2 !== 0" />
               </div>

               <ThePagination :current-page="currentPage" :total-items="totalItems" :items-per-page="itemsPerPage"
                    @change="onPageChange" />
          </div>
     </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import CommonCard from '../components/CommonCard.vue';
import ThePagination from '../components/ThePagination.vue';

const collections = ref([]);
const loading = ref(true);
const viewMode = ref('grid');
const currentPage = ref(1);
const totalItems = ref(0);
const itemsPerPage = ref(12);

const fetchCollections = async () => {
     loading.value = true;
     const offset = (currentPage.value - 1) * itemsPerPage.value;
     try {
          const res = await axios.get('/api/glam/collection', {
               params: { limit: itemsPerPage.value, offset, fields: 'id,title,thumbnail,description' }
          });
          collections.value = res.data.items || [];
          totalItems.value = res.data.total_items || res.data.total || 0;
     } catch (e) {
          console.error(e);
     } finally {
          loading.value = false;
          window.scrollTo({ top: 0, behavior: 'smooth' });
     }
};

const onPageChange = (p) => {
     currentPage.value = p;
     fetchCollections();
};

onMounted(fetchCollections);
</script>

<style scoped>
.page-header {
     text-align: center;
     margin-bottom: 4rem;
}

.page-title {
     font-size: var(--fs-4xl);
     margin-bottom: 1rem;
}

.page-title .highlight {
     color: var(--primary-color);
}

.page-subtitle {
     color: var(--text-secondary);
     font-size: var(--fs-lg);
     max-width: 600px;
     margin: 0 auto;
}

.toolbar {
     display: flex;
     justify-content: space-between;
     align-items: center;
     background: var(--surface-color);
     padding: 1rem 1.5rem;
     border-radius: var(--radius-md);
     border: 1px solid var(--border-color);
     margin-bottom: 3rem;
}

.view-options {
     display: flex;
     gap: 0.5rem;
}

.view-options button {
     padding: 0.5rem 1rem;
     border: 1px solid var(--border-color);
     border-radius: var(--radius-sm);
     font-size: 0.75rem;
     font-weight: 700;
     text-transform: uppercase;
}

.view-options button.active {
     background: var(--primary-color);
     color: #fff;
     border-color: var(--primary-color);
}

.stats {
     font-size: var(--fs-sm);
     color: var(--text-muted);
     font-weight: 600;
}

.grid-layout {
     display: grid;
     gap: var(--spacing-xl);
}

.grid-layout.view-grid {
     grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
}

.grid-layout.view-list,
.grid-layout.view-banners {
     grid-template-columns: 1fr;
}

@media (max-width: 768px) {
     .toolbar {
          flex-direction: column;
          gap: 1rem;
     }
}
</style>
