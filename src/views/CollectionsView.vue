<template>
     <div class="container section-padding fade-in">
          <header class="page-header">
               <h1 class="page-title">Listado de <span class="highlight">Colecciones</span></h1>
               <p class="page-subtitle">Explora todas las colecciones disponibles.</p>
          </header>

          <div class="toolbar" v-if="!loading">
               <div class="view-options">
                    <button v-for="mode in ['grid', 'list', 'magazine']" :key="mode" @click="viewMode = mode"
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
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import CommonCard from '../components/CommonCard.vue';
import ThePagination from '../components/ThePagination.vue';

const route = useRoute();
const router = useRouter();

const collections = ref([]);
const loading = ref(true);
const viewMode = ref('grid');
const currentPage = ref(1);
const totalItems = ref(0);
const itemsPerPage = ref(12);

const allowedViewModes = new Set(['grid', 'list', 'magazine']);
const isSyncingFromRoute = ref(false);

const parsePage = (p) => {
     const n = Number.parseInt(String(p ?? ''), 10);
     return Number.isFinite(n) && n > 0 ? n : 1;
};

const parseView = (v) => {
     const s = String(v ?? '');
     return allowedViewModes.has(s) ? s : 'grid';
};

const syncStateFromRoute = () => {
     isSyncingFromRoute.value = true;
     viewMode.value = parseView(route.query.view);
     currentPage.value = parsePage(route.query.page);
     isSyncingFromRoute.value = false;
};

const pushStateToRoute = async () => {
     if (isSyncingFromRoute.value) return;
     const nextQuery = {
          ...route.query,
          view: viewMode.value,
          page: String(currentPage.value),
     };

     if (route.query.view === nextQuery.view && String(route.query.page ?? '') === nextQuery.page) return;

     await router.push({ query: nextQuery });
};

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
};

onMounted(() => {
     syncStateFromRoute();
     fetchCollections();
});

watch(
     () => [route.query.page, route.query.view],
     () => {
          const nextPage = parsePage(route.query.page);
          const nextView = parseView(route.query.view);
          const shouldRefetch = nextPage !== currentPage.value;
          viewMode.value = nextView;
          currentPage.value = nextPage;
          if (shouldRefetch) fetchCollections();
     }
);

watch(viewMode, () => {
     pushStateToRoute();
});
watch(currentPage, () => {
     pushStateToRoute();
     fetchCollections();
});
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
     grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr));
}

.grid-layout.view-list,
.grid-layout.view-magazine {
     grid-template-columns: 1fr;
}

@media (max-width: 768px) {
     .toolbar {
          flex-direction: column;
          gap: 1.2rem;
          text-align: center;
          padding: 1.5rem;
          margin-bottom: 2rem;
     }

     .view-options {
          width: 100%;
          justify-content: center;
     }

     .grid-layout {
          gap: 1.5rem;
     }
}
</style>
