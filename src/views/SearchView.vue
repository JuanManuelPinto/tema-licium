<template>
     <div class="container section-padding fade-in">
          <header class="page-header">
               <h1 class="page-title">Buscador <span class="highlight">Avanzado</span></h1>
               <p class="page-subtitle">Utiliza filtros avanzados por campos de ontología y colecciones para encontrar
                    registros específicos.</p>
          </header>

          <div class="search-layout">
               <!-- Botón para mostrar filtros en móvil -->
               <button class="filters-toggle-btn" @click="showMobileFilters = !showMobileFilters">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                         <path d="M22 3H2l8 9v6l4 3v-9L22 3z" />
                    </svg>
                    {{ showMobileFilters ? 'Ocultar Filtros' : 'Refinar Búsqueda' }}
               </button>

               <!-- Panel de Filtros (Izquierda) -->
               <aside class="filters-panel" :class="{ 'is-visible': showMobileFilters }">
                    <div class="filter-group">
                         <h3 class="filter-label">¿Qué buscas?</h3>
                         <div class="scope-selector">
                              <label v-for="opt in scopeOptions" :key="opt.val"
                                   :class="{ 'active': form.scope === opt.val }">
                                   <input type="radio" v-model="form.scope" :value="opt.val" /> {{ opt.label }}
                              </label>
                         </div>
                    </div>

                    <div class="filter-group">
                         <h3 class="filter-label">Palabras clave</h3>
                         <div class="input-with-icon">
                              <input type="text" v-model="form.query" placeholder="Buscar en todo el texto..."
                                   @keyup.enter="handleNewSearch" />
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                   stroke-width="2">
                                   <circle cx="11" cy="11" r="8" />
                                   <path d="m21 21-4.35-4.35" />
                              </svg>
                         </div>
                    </div>

                    <div class="filter-group">
                         <div class="group-header">
                              <h3 class="filter-label">Filtros por campo</h3>
                              <div class="logic-btns">
                                   <button @click="form.combine = 'Y'"
                                        :class="{ active: form.combine === 'Y' }">Y</button>
                                   <button @click="form.combine = 'O'"
                                        :class="{ active: form.combine === 'O' }">O</button>
                              </div>
                         </div>
                         <div class="rules-list">
                              <div v-for="(rule, idx) in form.rules" :key="idx" class="rule-box">
                                   <select v-model="rule.field">
                                        <option value="title">Título</option>
                                        <option value="author">Autor</option>
                                        <option value="subject">Materia</option>
                                   </select>
                                   <input type="text" v-model="rule.value" placeholder="Valor..."
                                        @keyup.enter="handleNewSearch" />
                                   <button class="btn-remove" @click="removeRule(idx)"
                                        v-if="form.rules.length > 1">×</button>
                              </div>
                              <button class="btn-link" @click="addRule">+ Añadir campo</button>
                         </div>
                    </div>

                    <div class="filter-group">
                         <h3 class="filter-label">Colección específica</h3>
                         <select v-model="form.collection" class="main-select">
                              <option value="">Todas las colecciones</option>
                              <option v-for="col in collectionsList" :key="col.id" :value="col.id">{{ col.title }}
                              </option>
                         </select>
                    </div>

                    <button class="btn-primary w-full" @click="handleNewSearch" :disabled="loading">
                         {{ loading ? 'Buscando...' : 'Aplicar Filtros' }}
                    </button>
               </aside>

               <!-- Resultados (Derecha) -->
               <section class="results-viewer">
                    <div v-if="loading" class="loading-wrapper"><span class="loader"></span> Buscando...</div>
                    <div v-else-if="!hasSearched" class="initial-state">
                         <div class="placeholder-content">
                              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--border-color)"
                                   stroke-width="1">
                                   <circle cx="11" cy="11" r="8" />
                                   <path d="m21 21-4.35-4.35" />
                              </svg>
                              <h3>Listo para buscar</h3>
                              <p>Configura los filtros y haz clic en aplicar para empezar.</p>
                         </div>
                    </div>
                    <div v-else>
                         <div class="results-header">
                              <h2 class="title-sm">Resultados encontrados ({{ totalItems }})</h2>
                         </div>

                         <div v-if="records.length === 0" class="no-data">
                              No hay coincidencias para estos filtros.
                         </div>
                         <div v-else>
                              <div class="grid-auto">
                                   <CommonCard v-for="record in records" :key="record.id" :item="record"
                                        :type="record._type" />
                              </div>
                              <ThePagination :current-page="currentPage" :total-items="totalItems"
                                   :items-per-page="itemsPerPage" @change="handlePageChange" />
                         </div>
                    </div>
               </section>
          </div>
     </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import CommonCard from '../components/CommonCard.vue';
import ThePagination from '../components/ThePagination.vue';

const route = useRoute();
const showMobileFilters = ref(false);
const scopeOptions = [
     { val: 'registros', label: 'Registros' },
     { val: 'colecciones', label: 'Colecciones' },
     { val: 'todo', label: 'Todo' }
];

const form = reactive({
     scope: 'registros',
     query: '',
     combine: 'Y',
     rules: [{ field: 'title', operator: 'contains', value: '' }],
     collection: ''
});

const loading = ref(false);
const hasSearched = ref(false);
const records = ref([]);
const collectionsList = ref([]);
const totalItems = ref(0);
const currentPage = ref(1);
const itemsPerPage = ref(20);

onMounted(async () => {
     try {
          const res = await axios.get('/api/glam/collection', { params: { fields: 'id,title', limit: 100 } });
          collectionsList.value = res.data.items || [];
     } catch (e) { console.error(e); }

     if (route.query.q) {
          form.query = route.query.q;
          form.scope = 'todo';
          executeSearch();
     }
});

const addRule = () => form.rules.push({ field: 'title', operator: 'contains', value: '' });
const removeRule = (idx) => form.rules.splice(idx, 1);
const handleNewSearch = () => { currentPage.value = 1; executeSearch(); };
const handlePageChange = (p) => { currentPage.value = p; executeSearch(); };

const executeSearch = async () => {
     loading.value = true;
     hasSearched.value = true;
     const offset = (currentPage.value - 1) * itemsPerPage.value;

     try {
          const conditions = [{ type: "condition", field: "sites", operator: "in", value: [8] }];
          if (form.collection) {
               conditions.push({ type: "condition", field: "collections", operator: "in", value: [parseInt(form.collection)] });
          }

          const ruleSet = form.rules.filter(r => r.value).map(r => ({
               type: "condition",
               field: r.field,
               operator: 'ilike',
               value: `%${r.value}%`
          }));

          if (ruleSet.length > 0) {
               conditions.push({ op: form.combine === 'Y' ? 'and' : 'or', children: ruleSet });
          }

          const params = {
               limit: itemsPerPage.value,
               offset: offset,
               domain: JSON.stringify({ op: "and", children: conditions }),
               search: form.query || undefined
          };

          let results = [];
          let total = 0;

          if (form.scope !== 'colecciones') {
               const resReg = await axios.get('/api/glam/record', { params: { ...params, fields: 'thumbnail,title,author,id' } });
               results = [...results, ...(resReg.data.items || []).map(i => ({ ...i, _type: 'record' }))];
               total += resReg.data.total_items || resReg.data.total || 0;
          }

          if (form.scope !== 'registros') {
               const resCol = await axios.get('/api/glam/collection', { params: { ...params, fields: 'id,thumbnail,title' } });
               results = [...results, ...(resCol.data.items || []).map(i => ({ ...i, _type: 'collection' }))];
               total += resCol.data.total_items || resCol.data.total || 0;
          }

          records.value = results;
          totalItems.value = total;
     } catch (e) {
          console.error(e);
     } finally {
          loading.value = false;
          window.scrollTo({ top: 300, behavior: 'smooth' });
     }
};
</script>

<style scoped>
.page-header {
     text-align: center;
     margin-bottom: 4rem;
}

.page-title {
     font-size: var(--fs-4xl);
}

.highlight {
     color: var(--primary-color);
}

.search-layout {
     display: grid;
     grid-template-columns: 1fr;
     gap: 3rem;
     align-items: start;
}

@media (min-width: 1024px) {
     .search-layout {
          grid-template-columns: 350px 1fr;
     }
}

.filters-panel {
     background: var(--surface-color);
     padding: 2rem;
     border-radius: var(--radius-lg);
     border: 1px solid var(--border-color);
     position: sticky;
     top: 100px;
     transition: all 0.3s ease;
}

.filters-toggle-btn {
     display: none;
     width: 100%;
     padding: 1rem;
     background: var(--surface-color);
     border: 1px solid var(--primary-color);
     color: var(--primary-color);
     border-radius: var(--radius-md);
     font-weight: 700;
     align-items: center;
     justify-content: center;
     gap: 0.8rem;
     text-transform: uppercase;
     font-size: var(--fs-xs);
     margin-bottom: 1rem;
     box-shadow: var(--shadow-sm);
}

@media (max-width: 1023px) {
     .filters-toggle-btn {
          display: flex;
     }

     .filters-panel {
          display: none;
          position: static;
          margin-bottom: 2rem;
     }

     .filters-panel.is-visible {
          display: block;
          animation: slideDown 0.3s ease-out;
     }
}

@keyframes slideDown {
     from { opacity: 0; transform: translateY(-10px); }
     to { opacity: 1; transform: translateY(0); }
}

.filter-group {
     margin-bottom: 2rem;
}

.filter-label {
     font-size: var(--fs-xs);
     text-transform: uppercase;
     color: var(--text-muted);
     margin-bottom: 1rem;
     font-weight: 700;
     letter-spacing: 0.05em;
}

.scope-selector {
     display: flex;
     flex-direction: column;
     gap: 0.5rem;
}

.scope-selector label {
     padding: 0.6rem 1rem;
     border-radius: var(--radius-sm);
     border: 1px solid var(--border-color);
     cursor: pointer;
     font-size: var(--fs-sm);
     transition: var(--transition-fast);
}

.scope-selector label.active {
     background: rgba(212, 175, 55, 0.1);
     border-color: var(--primary-color);
     color: var(--primary-color);
     font-weight: 600;
}

.scope-selector input {
     display: none;
}

.input-with-icon {
     position: relative;
     display: flex;
     align-items: center;
     background: var(--bg-color);
     border-radius: var(--radius-sm);
     border: 1px solid var(--border-color);
}

.input-with-icon input {
     width: 100%;
     border: none;
     background: none;
     padding: 0.8rem 1rem 0.8rem 2.5rem;
     outline: none;
}

.input-with-icon svg {
     position: absolute;
     left: 0.8rem;
     color: var(--text-muted);
}

.group-header {
     display: flex;
     justify-content: space-between;
     align-items: center;
     margin-bottom: 1rem;
}

.logic-btns {
     display: flex;
     border: 1px solid var(--border-color);
     border-radius: 4px;
     overflow: hidden;
}

.logic-btns button {
     padding: 0.2rem 0.6rem;
     font-size: 0.7rem;
     font-weight: 700;
}

.logic-btns button.active {
     background: var(--primary-color);
     color: #fff;
}

.rules-list {
     display: flex;
     flex-direction: column;
     gap: 0.8rem;
}

.rule-box {
     position: relative;
     display: flex;
     flex-direction: column;
     gap: 0.4rem;
     background: var(--bg-color);
     padding: 0.8rem;
     border-radius: 4px;
     border: 1px solid var(--border-color);
}

.rule-box select,
.rule-box input {
     border: 1px solid var(--border-color);
     padding: 0.4rem;
     border-radius: 4px;
     font-size: 0.85rem;
}

.btn-remove {
     position: absolute;
     top: 0;
     right: 0;
     padding: 0.2rem 0.5rem;
     color: #dc3545;
     font-weight: bold;
}

.btn-link {
     font-size: 0.75rem;
     color: var(--primary-color);
     font-weight: 700;
     text-align: left;
     margin-top: 0.5rem;
}

.main-select {
     width: 100%;
     padding: 0.8rem;
     border-radius: var(--radius-sm);
     border: 1px solid var(--border-color);
     background: var(--bg-color);
}

.w-full {
     width: 100%;
}

.results-header {
     margin-bottom: 2rem;
     border-bottom: 1px solid var(--border-color);
     padding-bottom: 1rem;
}

.title-sm {
     font-size: var(--fs-xl);
}

.initial-state {
     height: 400px;
     display: flex;
     align-items: center;
     justify-content: center;
     text-align: center;
}

.placeholder-content {
     color: var(--text-muted);
}

.placeholder-content h3 {
     margin-top: 1.5rem;
     color: var(--text-secondary);
}

.no-data {
     text-align: center;
     padding: 5rem;
     color: var(--text-muted);
     font-style: italic;
}
</style>
