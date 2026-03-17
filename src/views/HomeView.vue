<template>
     <div class="home-page fade-in">
          <!-- Hero Section -->
          <section class="hero">
               <div class="hero-media">
                    <img src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=928&auto=format&fit=crop"
                         alt="Patrimonio" />
                    <div class="hero-overlay"></div>
               </div>

               <div class="container hero-content">
                    <h1 class="hero-title">Ejemplo Theme <br /> <span class="highlight">LICIUM</span></h1>
                    <p class="hero-text">Tema propio de Licium.</p>

                    <div class="search-box">
                         <input v-model="searchQuery" type="text" placeholder="¿Qué deseas encontrar?"
                              @keyup.enter="onSearch" />
                         <button @click="onSearch" class="btn-search-icon">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                   stroke-width="2.5">
                                   <circle cx="11" cy="11" r="8" />
                                   <path d="m21 21-4.35-4.35" />
                              </svg>
                         </button>
                    </div>
               </div>
          </section>

          <!-- Colecciones Destacadas -->
          <section class="section-padding">
               <div class="container">
                    <div class="section-header">
                         <div class="header-titles">
                              <h2 class="title-lg">Colecciones Destacadas</h2>
                              <p class="subtitle">Descubre todas nuestras colecciones.</p>
                         </div>
                         <router-link to="/collections" class="btn-outline">Ver todas</router-link>
                    </div>

                    <div v-if="loading" class="loading-wrapper"><span class="loader"></span></div>
                    <div v-else class="tiles-grid">
                         <router-link v-for="col in collections" :key="col.id"
                              :to="{ name: 'collection-detail', params: { id: col.id } }" class="visual-tile">
                              <img v-if="col.thumbnail" :src="getLargeThumb(col.thumbnail)" alt="" class="tile-img" />
                              <div class="tile-overlay"></div>
                              <div class="tile-content">
                                   <span class="tile-tag">Colección</span>
                                   <h3 class="tile-title">{{ col.title }}</h3>
                                   <p class="tile-desc">{{ truncate(col.description, 80) }}</p>
                              </div>
                         </router-link>
                    </div>
               </div>
          </section>

          <!-- Banner CTA Intermedio -->
          <section class="cta-banner">
               <div class="container cta-inner">
                    <div class="cta-text">
                         <h2 class="cta-title">Buscador Avanzado</h2>
                         <p>Accede al buscador de registros y colecciones avanzado.</p>
                    </div>
                    <router-link to="/search" class="btn-primary">Buscador Avanzado</router-link>
               </div>
          </section>

          <!-- Novedades (Mismo estilo que colecciones) -->
          <section class="section-padding">
               <div class="container">
                    <div class="section-header">
                         <div class="header-titles">
                              <h2 class="title-lg">Últimos Registros</h2>
                              <p class="subtitle">Registros añadidos recientemente.</p>
                         </div>
                         <router-link to="/explore" class="link-more">Explorar catálogo →</router-link>
                    </div>

                    <div v-if="loading" class="loading-wrapper"><span class="loader"></span></div>
                    <div v-else class="tiles-grid">
                         <router-link v-for="record in records" :key="record.id"
                              :to="{ name: 'record-detail', params: { id: record.id } }" class="visual-tile">
                              <img v-if="record.thumbnail" :src="getLargeThumb(record.thumbnail)" alt=""
                                   class="tile-img" />
                              <div class="tile-overlay"></div>
                              <div class="tile-content">
                                   <span class="tile-tag">Registro</span>
                                   <h3 class="tile-title">{{ record.title }}</h3>
                                   <p class="tile-desc" v-if="record.author">{{ record.author }}</p>
                              </div>
                         </router-link>
                    </div>
               </div>
          </section>
     </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const searchQuery = ref('');
const collections = ref([]);
const records = ref([]);
const loading = ref(true);

const onSearch = () => {
     if (searchQuery.value.trim()) {
          router.push({ name: 'search', query: { q: searchQuery.value } });
     }
};

const getLargeThumb = (path) => {
     if (!path) return '';
     const domain = 'https://arcadium.cluster24.libnamic.eu';
     let full = path.startsWith('http') ? path : `${domain}${path}`;
     return full.replace(/size=\w+/, 'size=large');
};

const truncate = (str, len) => {
     if (!str) return '';
     return str.length > len ? str.substring(0, len) + '...' : str;
};

const init = async () => {
     try {
          // Cargamos 4 colecciones y 4 registros para mantener la simetría
          const [resCol, resRec] = await Promise.all([
               axios.get('/api/glam/collection', { params: { limit: 4, fields: 'id,thumbnail,title,description' } }),
               axios.get('/api/glam/record', { params: { limit: 4, fields: 'id,thumbnail,title,author,description' } })
          ]);
          collections.value = resCol.data.items || [];
          records.value = resRec.data.items || [];
     } catch (e) {
          console.error("Home Error:", e);
     } finally {
          loading.value = false;
     }
};

onMounted(init);
</script>

<style scoped>
/* Hero */
.hero {
     position: relative;
     height: 75vh;
     min-height: 500px;
     display: flex;
     align-items: center;
     justify-content: center;
     margin-top: calc(var(--header-height) * -1);
     overflow: hidden;
}

.hero-media {
     position: absolute;
     inset: 0;
     z-index: 0;
}

.hero-media img {
     width: 100%;
     height: 100%;
     object-fit: cover;
     filter: brightness(0.4) contrast(1.1);
}

.hero-overlay {
     position: absolute;
     inset: 0;
     background: linear-gradient(0deg, var(--bg-color) 0%, transparent 100%);
}

.hero-content {
     position: relative;
     z-index: 10;
     text-align: center;
     color: #fff;
}

.hero-title {
     font-size: var(--fs-hero);
     margin-bottom: 2rem;
     text-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
     color: #ffffff;
}

.hero-title .highlight {
     color: var(--primary-color);
}

.hero-text {
     font-size: 1.25rem;
     color: rgba(255, 255, 255, 0.9);
     max-width: 600px;
     margin: 0 auto 3rem;
     text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.search-box {
     background: #fff;
     max-width: 600px;
     margin: 0 auto;
     padding: 0.5rem;
     border-radius: var(--radius-full);
     display: flex;
     box-shadow: var(--shadow-lg);
}

.search-box input {
     flex: 1;
     border: none;
     padding: 0 1.5rem;
     font-size: 1.1rem;
     outline: none;
     border-radius: var(--radius-full);
     color: #000;
}

.btn-search-icon {
     background: var(--primary-color);
     color: #fff;
     width: 50px;
     height: 50px;
     border-radius: 50%;
     display: flex;
     align-items: center;
     justify-content: center;
}

/* Section Header */
.section-header {
     display: flex;
     justify-content: space-between;
     align-items: flex-end;
     margin-bottom: 3rem;
}

.title-lg {
     font-size: var(--fs-3xl);
     margin: 0;
}

.subtitle {
     color: var(--text-secondary);
     margin: 0.5rem 0 0;
}

.link-more {
     color: var(--primary-color);
     font-weight: 700;
     text-transform: uppercase;
     font-size: var(--fs-xs);
}

.btn-outline {
     border: 1px solid var(--primary-color);
     color: var(--primary-color);
     padding: 0.6rem 1.5rem;
     border-radius: var(--radius-sm);
     font-weight: 700;
     font-size: 0.75rem;
     text-transform: uppercase;
     transition: all 0.3s;
}

.btn-outline:hover {
     background: var(--primary-color);
     color: #fff;
}

/* Visual Tiles */
.tiles-grid {
     display: grid;
     grid-template-columns: repeat(4, 1fr);
     gap: 1.5rem;
}

.visual-tile {
     position: relative;
     height: 500px;
     border-radius: var(--radius-lg);
     overflow: hidden;
     display: flex;
     align-items: flex-end;
     padding: 2rem;
     transition: var(--transition-normal);
     text-decoration: none;
}

.visual-tile:hover {
     transform: translateY(-10px);
     box-shadow: var(--shadow-lg);
}

.tile-img {
     position: absolute;
     inset: 0;
     width: 100%;
     height: 100%;
     object-fit: cover;
     transition: var(--transition-slow);
}

.visual-tile:hover .tile-img {
     transform: scale(1.1);
}

/* Overlay mejorado para legibilidad del texto */
.tile-overlay {
     position: absolute;
     inset: 0;
     background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.2) 40%, rgba(0, 0, 0, 0.7) 70%, rgba(0, 0, 0, 0.95) 100%);
     transition: opacity 0.3s ease;
}

.tile-content {
     position: relative;
     z-index: 2;
     color: #fff;
     width: 100%;
}

.tile-tag {
     font-size: 0.7rem;
     font-weight: 800;
     text-transform: uppercase;
     letter-spacing: 0.15em;
     color: var(--primary-color);
     margin-bottom: 0.8rem;
     display: block;
     text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.tile-title {
     font-size: 1.6rem;
     margin-bottom: 1rem;
     line-height: 1.2;
     font-weight: 700;
     color: #fff;
     text-shadow: 0 2px 10px rgba(0, 0, 0, 0.8);
}

.tile-desc {
     font-size: 0.95rem;
     color: rgba(255, 255, 255, 0.9);
     line-height: 1.5;
     text-shadow: 0 1px 5px rgba(0, 0, 0, 0.5);
}

@media (max-width: 1200px) {
     .tiles-grid {
          grid-template-columns: repeat(2, 1fr);
     }
}

@media (max-width: 600px) {
     .hero {
          height: 60vh;
          min-height: 400px;
          margin-top: 0;
          padding-top: var(--header-height);
     }

     .hero-title {
          font-size: 2.2rem;
          margin-bottom: 1.5rem;
     }

     .hero-text {
          font-size: 1rem;
          margin-bottom: 2rem;
     }

     .search-box {
          border-radius: var(--radius-md);
          padding: 0.3rem;
     }

     .search-box input {
          padding: 0 1rem;
          font-size: 1rem;
     }

     .btn-search-icon {
          width: 44px;
          height: 44px;
     }

     .section-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 1.5rem;
          margin-bottom: 2rem;
     }

     .tiles-grid {
          grid-template-columns: 1fr;
          gap: 1rem;
     }

     .visual-tile {
          height: 350px;
          padding: 1.5rem;
     }

     .tile-title {
          font-size: 1.3rem;
     }
}

/* CTA Banner */
.cta-banner {
     background: var(--surface-color);
     border-block: 1px solid var(--border-color);
     padding: 4rem 0;
     margin: 4rem 0;
}

.cta-inner {
     display: flex;
     justify-content: space-between;
     align-items: center;
     gap: 2rem;
}

.cta-title {
     font-size: var(--fs-2xl);
     margin-bottom: 0.5rem;
}

@media (max-width: 768px) {
     .cta-inner {
          flex-direction: column;
          text-align: center;
     }
}
</style>
