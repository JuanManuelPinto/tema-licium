<template>
     <div class="container section-padding fade-in">
          <div class="action-bar">
               <button @click="$router.push('/collections')" class="btn-back">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                         <path d="m15 18-6-6 6-6" />
                    </svg>
                    Todas las colecciones
               </button>
          </div>

          <div v-if="loadingCol" class="loading-wrapper"><span class="loader"></span> Cargando...</div>

          <div v-else-if="collection" class="collection-hero">
               <div class="hero-bg">
                    <img v-if="collection.thumbnail" :src="getThumbnail(collection.thumbnail, 'large')" />
                    <div class="overlay"></div>
               </div>
               <div class="hero-content">
                    <span class="badge">Colección</span>
                    <h1 class="hero-title">{{ collection.title }}</h1>
                    <p class="hero-desc">{{ collection.description }}</p>
               </div>
          </div>

          <!-- Obras de la Colección -->
          <div class="records-section">
               <div class="section-header">
                    <h2 class="title-md">Obras en esta Colección</h2>
                    <span class="count">{{ totalItems }} resultados</span>
               </div>

               <div v-if="loadingRec" class="loading-wrapper"><span class="loader"></span></div>
               <div v-else-if="records.length === 0" class="empty">No hay obras registradas en esta colección.</div>
               <div v-else>
                    <div class="grid-auto">
                         <CommonCard v-for="record in records" :key="record.id" :item="record" type="record" />
                    </div>

                    <ThePagination :current-page="currentPage" :total-items="totalItems" :items-per-page="itemsPerPage"
                         @change="onPageChange" />
               </div>
          </div>
     </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import CommonCard from '../components/CommonCard.vue';
import ThePagination from '../components/ThePagination.vue';

const route = useRoute();
const collection = ref(null);
const records = ref([]);
const loadingCol = ref(true);
const loadingRec = ref(true);

const currentPage = ref(1);
const totalItems = ref(0);
const itemsPerPage = ref(20);

const fetchInfo = async () => {
     loadingCol.value = true;
     try {
          const id = route.params.id;
          const res = await axios.get(`/api/glam/collection/${id}`, { params: { fields: 'id,thumbnail,title,description' } });
          collection.value = res.data.item || res.data;
     } catch (e) { console.error(e); }
     finally { loadingCol.value = false; }
};

const fetchRecords = async () => {
     loadingRec.value = true;
     const offset = (currentPage.value - 1) * itemsPerPage.value;
     const id = route.params.id;
     try {
          const domain = {
               op: "and",
               children: [
                    { type: "condition", field: "sites", operator: "in", value: [8] },
                    { type: "condition", field: "collections", operator: "in", value: [parseInt(id)] }
               ]
          };
          const res = await axios.get(`/api/glam/record`, {
               params: { limit: itemsPerPage.value, offset, fields: 'thumbnail,title,author,id', domain: JSON.stringify(domain) }
          });
          records.value = res.data.items || [];
          totalItems.value = res.data.total_items || res.data.total || 0;
     } catch (e) { console.error(e); }
     finally { loadingRec.value = false; }
};

const onPageChange = (p) => { currentPage.value = p; fetchRecords(); };

const getThumbnail = (path, size = 'large') => {
     if (!path) return '';
     const domain = 'https://arcadium.cluster24.libnamic.eu';
     let full = path.startsWith('http') ? path : `${domain}${path}`;
     return full.replace(/size=\w+/, `size=${size}`);
};

watch(() => route.params.id, (id) => { if (id) { fetchInfo(); fetchRecords(); } });
onMounted(() => { fetchInfo(); fetchRecords(); });
</script>

<style scoped>
.action-bar {
     margin-bottom: 2rem;
}

.btn-back {
     display: flex;
     align-items: center;
     gap: 0.5rem;
     color: var(--text-secondary);
     font-weight: 600;
     text-transform: uppercase;
     font-size: 0.8rem;
}

.collection-hero {
     position: relative;
     height: 500px;
     border-radius: var(--radius-lg);
     overflow: hidden;
     display: flex;
     align-items: center;
     justify-content: center;
     margin-bottom: 5rem;
}

.hero-bg {
     position: absolute;
     inset: 0;
}

.hero-bg img {
     width: 100%;
     height: 100%;
     object-fit: cover;
     filter: brightness(0.6);
}

.overlay {
     position: absolute;
     inset: 0;
     background: linear-gradient(0deg, var(--bg-color) 0%, transparent 100%);
}

.hero-content {
     position: relative;
     z-index: 10;
     text-align: center;
     color: #fff;
     padding: 2rem;
     max-width: 900px;
}

.hero-title {
     font-size: var(--fs-4xl);
     margin: 1rem 0;
}

.hero-desc {
     font-size: 1.25rem;
     color: rgba(255, 255, 255, 0.9);
}

.records-section {
     margin-top: 2rem;
}

.section-header {
     display: flex;
     justify-content: space-between;
     align-items: center;
     margin-bottom: 3rem;
     padding-bottom: 0.5rem;
     border-bottom: 2px solid var(--border-color);
}

.title-md {
     font-size: var(--fs-2xl);
     margin: 0;
}

.count {
     font-weight: 700;
     color: var(--primary-color);
}

@media (max-width: 768px) {
     .collection-hero {
          height: 400px;
     }
}
</style>
