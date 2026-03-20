<template>
     <div class="container section-padding fade-in">
          <!-- Cabecera de la vista de búsqueda: Contextualización para el usuario -->
          <header class="page-header">
               <h1 class="page-title">Buscador <span class="highlight">Avanzado</span></h1>
               <p class="page-subtitle">Utiliza filtros especializados por campos de ontología y colecciones para localizar
                    registros de manera precisa.</p>
          </header>

          <div class="search-layout">
               <!-- Dispositivo de control para visualización de filtros en interfaces móviles -->
               <button class="filters-toggle-btn" @click="showMobileFilters = !showMobileFilters">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                         <path d="M22 3H2l8 9v6l4 3v-9L22 3z" />
                    </svg>
                    {{ showMobileFilters ? 'Ocultar Filtros' : 'Refinar Búsqueda' }}
               </button>

               <!-- Panel Lateral de Filtros: Motor de configuración de la consulta -->
               <aside class="filters-panel" :class="{ 'is-visible': showMobileFilters }">
                    <!-- Ámbito de búsqueda: Definición de la entidad objetivo -->
                    <div class="filter-group">
                         <div class="group-header">
                              <h3 class="filter-label">¿Qué deseas buscar?</h3>
                              <button class="btn-reset-all" @click="resetAllFilters" title="Limpiar todos los filtros">
                                   Limpiar todo
                              </button>
                         </div>
                         <div class="scope-selector">
                              <label v-for="opt in scopeOptions" :key="opt.val"
                                   :class="{ 'active': form.scope === opt.val }">
                                   <input type="radio" v-model="form.scope" :value="opt.val" /> {{ opt.label }}
                              </label>
                         </div>
                    </div>

                    <!-- Motor de búsqueda rápida: Filtrado por términos generales -->
                    <div class="filter-group">
                         <div class="group-header">
                              <h3 class="filter-label">Búsqueda rápida</h3>
                              <button v-if="form.query" class="btn-reset-single" @click="form.query = ''">×</button>
                         </div>
                         <div class="input-with-icon">
                              <input type="text" v-model="form.query" placeholder="Buscar por título o autor..."
                                   @keyup.enter="handleNewSearch" />
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                   stroke-width="2">
                                   <circle cx="11" cy="11" r="8" />
                                   <path d="m21 21-4.35-4.35" />
                              </svg>
                         </div>
                         <p class="field-hint">Búsqueda transversal por coincidencias fonéticas en títulos y autorías.</p>
                    </div>

                    <!-- Constructor de Reglas: Definición lógica de filtros específicos de campo -->
                    <div class="filter-group">
                         <div class="group-header">
                              <h3 class="filter-label">Filtros específicos</h3>
                              <div class="logic-container">
                                   <span class="logic-label">Lógica:</span>
                                   <div class="logic-btns">
                                        <button @click="form.combine = 'Y'" :class="{ active: form.combine === 'Y' }"
                                             title="Intersección estricta (AND)">Y</button>
                                        <button @click="form.combine = 'O'" :class="{ active: form.combine === 'O' }"
                                             title="Unión flexible (OR)">O</button>
                                   </div>
                              </div>
                         </div>
                         <div class="rules-list">
                              <div v-for="(rule, idx) in form.rules" :key="idx" class="rule-box">
                                   <select v-model="rule.field" aria-label="Campo de búsqueda">
                                        <option v-for="field in availableFields" :key="field.value"
                                             :value="field.value">
                                             {{ field.label }}
                                        </option>
                                   </select>
                                   <input type="text" v-model="rule.value" placeholder="Término de búsqueda..."
                                        @keyup.enter="handleNewSearch" />
                                   <button class="btn-remove" @click="removeRule(idx)" v-if="form.rules.length > 1"
                                        title="Eliminar regla">×</button>
                              </div>
                              <button class="btn-link" @click="addRule">+ Añadir parámetro adicional</button>
                         </div>
                         <div class="logic-explanation">
                              <small v-if="form.combine === 'Y'"><strong>Intersección (AND):</strong> Se requiere el
                                   cumplimiento de todos los criterios simultáneamente.</small>
                              <small v-else><strong>Unión (OR):</strong> Se recuperarán registros que cumplan al menos
                                   uno de los criterios indicados.</small>
                         </div>
                    </div>

                    <!-- Selector de Colección: Filtrado por contexto arqueológico o museístico -->
                    <div class="filter-group">
                         <div class="group-header">
                              <h3 class="filter-label">Colección específica</h3>
                              <button v-if="form.collection" class="btn-reset-single" @click="form.collection = ''">×</button>
                         </div>
                         <select v-model="form.collection" class="main-select" :disabled="form.scope !== 'registros'">
                              <option value="">Todas las colecciones</option>
                              <option v-for="col in collectionsList" :key="col.id" :value="col.id">{{ col.title }}
                              </option>
                         </select>
                         <p v-if="form.scope !== 'registros'" class="field-hint">Filtro exclusivo para búsquedas de registros bibliográficos.</p>
                    </div>

                    <button class="btn-primary w-full" @click="handleNewSearch" :disabled="loading">
                         {{ loading ? 'Procesando...' : 'Ejecutar Búsqueda' }}
                    </button>
               </aside>

               <!-- Visualizador de Resultados: Área principal de despliegue de información -->
               <section class="results-viewer">
                    <!-- Retroalimentación de carga -->
                    <div v-if="loading" class="loading-wrapper"><span class="loader"></span> Sincronizando resultados...</div>
                    
                    <!-- Estado inicial: Invitación a la interacción -->
                    <div v-else-if="!hasSearched" class="initial-state">
                         <div class="placeholder-content">
                              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--border-color)"
                                   stroke-width="1">
                                   <circle cx="11" cy="11" r="8" />
                                   <path d="m21 21-4.35-4.35" />
                              </svg>
                              <h3>Sistema de Búsqueda</h3>
                              <p>Configura los parámetros laterales y activa los filtros para iniciar la consulta.</p>
                         </div>
                    </div>

                    <div v-else>
                         <!-- Estadísticas y herramientas de visualización de resultados -->
                         <div class="results-header">
                              <div class="results-stats">
                                   <h2 class="title-sm">Resultados ({{ totalItems }})</h2>
                                   <span class="results-page-info" v-if="totalItems > 0">
                                        Página {{ currentPage }} de {{ Math.ceil(totalItems / itemsPerPage) }}
                                   </span>
                              </div>
                              <div class="results-actions">
                                   <div class="view-options">
                                        <button v-for="mode in ['grid', 'list', 'magazine']" :key="mode"
                                             @click="viewMode = mode" :class="{ 'active': viewMode === mode }">
                                             {{ mode }}
                                        </button>
                                   </div>
                                   <button @click="handleNewSearch" class="btn-refresh" title="Sincronizar resultados">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                             stroke="currentColor" stroke-width="2">
                                             <path d="M21 2v6h-6" />
                                             <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                                             <path d="M3 22v-6h6" />
                                             <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                                        </svg>
                                   </button>
                              </div>
                         </div>

                         <!-- Caso: No se encontraron registros -->
                         <div v-if="records.length === 0" class="no-data">
                              No se han localizado registros que satisfagan la combinación de filtros actual.
                              <button @click="currentPage = 1; executeSearch()" class="btn-link">Reiniciar paginación</button>
                         </div>

                         <!-- Renderizado de la rejilla de resultados -->
                         <div v-else>
                              <div :class="['grid-layout', `view-${viewMode}`]">
                                   <CommonCard v-for="(record, idx) in records" :key="record.id" :item="record"
                                        :type="record._type" :view-mode="viewMode" :reverse="idx % 2 !== 0" />
                              </div>
                              
                              <!-- Sistema de paginación global -->
                              <div class="pagination-wrapper">
                                   <ThePagination :current-page="currentPage" :total-items="totalItems"
                                        :items-per-page="itemsPerPage" @change="handlePageChange" />
                                   <p class="pagination-hint">Mostrando {{ records.length }} resultados en el lote actual.
                                   </p>
                              </div>
                         </div>
                    </div>
               </section>
          </div>
     </div>
</template>

<script setup>
/**
 * Vista SearchView.
 * 
 * Este componente es el núcleo de búsqueda de la aplicación. Gestiona un sistema
 * complejo de filtros avanzado, permitiendo consultas granulares sobre campos
 * técnicos (metadatos), filtrado taxonómico por colecciones y soporte para
 * lógica booleana básica (AND/OR). Implementa una arquitectura reactiva que
 * sincroniza las reglas visuales con el motor de consultas de la API GLAM.
 */

import { reactive, ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import CommonCard from '../components/CommonCard.vue';
import ThePagination from '../components/ThePagination.vue';

const route = useRoute();
const showMobileFilters = ref(false);

// Esquema de campos disponibles para el filtrado especializado
const availableFields = [
     { value: 'title', label: 'Título' },
     { value: 'author', label: 'Autor / Creador' },
     { value: 'contributor', label: 'Contribuidor' },
     { value: 'description', label: 'Descripción' },
     { value: 'subject', label: 'Materia / Tema' },
     { value: 'date', label: 'Fecha' },
     { value: 'publisher', label: 'Editor' },
     { value: 'type', label: 'Tipo de recurso' },
     { value: 'format', label: 'Formato / Medio' },
     { value: 'language', label: 'Idioma' },
     { value: 'identifier', label: 'Identificador' },
     { value: 'source', label: 'Fuente' },
     { value: 'relation', label: 'Relación' },
     { value: 'coverage', label: 'Cobertura' },
     { value: 'spatial', label: 'Localización espacial' },
     { value: 'temporal', label: 'Cobertura temporal' },
     { value: 'rights', label: 'Derechos / Licencia' },
     { value: 'provenance', label: 'Procedencia' },
     { value: 'audience', label: 'Audiencia' }
];

// Opciones de alcance para la consulta
const scopeOptions = [
     { val: 'registros', label: 'Registros' },
     { val: 'colecciones', label: 'Colecciones' },
     { val: 'todo', label: 'Todo' }
];

// Estado integral del formulario de búsqueda
const form = reactive({
     scope: 'registros',
     query: '',
     combine: 'Y',
     rules: [{ field: 'title', operator: 'contains', value: '' }],
     collection: ''
});

// Sincronización de reglas de negocio: La colección solo aplica a registros
watch(() => form.scope, (newScope) => {
     if (newScope !== 'registros') form.collection = '';
});

const loading = ref(false);
const hasSearched = ref(false);
const viewMode = ref('grid');
const records = ref([]);
const collectionsList = ref([]);
const totalItems = ref(0);
const currentPage = ref(1);
const itemsPerPage = ref(24);

onMounted(async () => {
     // Precarga de la lista de colecciones para alimentar los selectores de filtrado
     try {
          const res = await axios.get('/api/glam/collection', { params: { fields: 'id,title', limit: 100 } });
          collectionsList.value = res.data.items || [];
     } catch (e) {
          console.error("Error al precargar colecciones:", e);
     }

     // Integración con parámetros de entrada desde el Hero de la Home
     if (route.query.q) {
          form.query = route.query.q;
          form.scope = 'todo';
          executeSearch();
     }
});

/**
 * Restaura el estado original del motor de búsqueda.
 */
const resetAllFilters = () => {
     form.scope = 'registros';
     form.query = '';
     form.combine = 'Y';
     form.rules = [{ field: 'title', operator: 'contains', value: '' }];
     form.collection = '';
     handleNewSearch();
};

/**
 * Añade una nueva fila de regla lógica al constructor de filtros.
 */
const addRule = () => form.rules.push({ field: 'title', operator: 'contains', value: '' });

/**
 * Elimina una regla lógica específica.
 */
const removeRule = (idx) => form.rules.splice(idx, 1);

/**
 * Inicia una nueva búsqueda reseteando la paginación.
 */
const handleNewSearch = () => {
     currentPage.value = 1;
     executeSearch();
};

/**
 * Gestiona el cambio de lote de datos ante eventos de paginación.
 */
const handlePageChange = (p) => {
     currentPage.value = p;
     executeSearch();
};

/**
 * Motor de ejecución de la consulta.
 * Construye dinámicamente el árbol léxico de condiciones requerido por la API GLAM.
 */
const executeSearch = async () => {
     loading.value = true;
     hasSearched.value = true;
     const offset = (currentPage.value - 1) * itemsPerPage.value;

     try {
          // Bloque fundamental: Filtrado por sitio activo
          const conditions = [{ type: "condition", field: "sites", operator: "in", value: [8] }];
          
          if (form.collection) {
               conditions.push({ type: "condition", field: "collections", operator: "in", value: [parseInt(form.collection)] });
          }

          // Inyección de búsqueda rápida multi-campo
          if (form.query) {
               conditions.push({
                    op: 'or',
                    children: [
                         { type: "condition", field: "title", operator: "ilike", value: `%${form.query}%` },
                         { type: "condition", field: "author", operator: "ilike", value: `%${form.query}%` }
                    ]
               });
          }

          // Procesamiento de reglas avanzadas por campo
          const ruleSet = form.rules.filter(r => r.value).map(r => ({
               type: "condition",
               field: r.field,
               operator: 'ilike',
               value: `%${r.value}%`
          }));

          if (ruleSet.length > 0) {
               // Aplicación de la lógica booleana del combinador (Y/O)
               conditions.push({ op: form.combine === 'Y' ? 'and' : 'or', children: ruleSet });
          }

          const params = {
               limit: itemsPerPage.value,
               offset: offset,
               domain: JSON.stringify({ op: "and", children: conditions })
          };

          let results = [];
          let total = 0;

          // Bifurcación de lógica según el ámbito (Scope) seleccionado
          if (form.scope === 'todo') {
               // Estrategia de muestreo combinado para búsqueda universal
               const halfLimit = Math.floor(itemsPerPage.value / 2);

               const [resReg, resCol] = await Promise.all([
                    axios.get('/api/glam/record', { params: { ...params, limit: halfLimit, fields: 'thumbnail,title,author,id' } }),
                    axios.get('/api/glam/collection', { params: { ...params, limit: itemsPerPage.value - halfLimit, fields: 'id,thumbnail,title' } })
               ]);

               const regItems = (resReg.data.items || []).map(i => ({ ...i, _type: 'record' }));
               const colItems = (resCol.data.items || []).map(i => ({ ...i, _type: 'collection' }));

               results = [...regItems, ...colItems];
               total = (resReg.data.total_items || 0) + (resCol.data.total_items || 0);

          } else if (form.scope === 'registros') {
               const resReg = await axios.get('/api/glam/record', { params: { ...params, fields: 'thumbnail,title,author,id' } });
               results = (resReg.data.items || []).map(i => ({ ...i, _type: 'record' }));
               total = resReg.data.total_items || resReg.data.total || 0;

          } else if (form.scope === 'colecciones') {
               const resCol = await axios.get('/api/glam/collection', { params: { ...params, fields: 'id,thumbnail,title' } });
               results = (resCol.data.items || []).map(i => ({ ...i, _type: 'collection' }));
               total = resCol.data.total_items || resCol.data.total || 0;
          }

          records.value = results;
          totalItems.value = total;

     } catch (e) {
          console.error("Fallo crítico en el motor de búsqueda avanzada:", e);
     } finally {
          loading.value = false;
          // Optimización de UX: Asegurar visibilidad de los nuevos resultados
          if (window.innerWidth >= 1024) {
               window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
               const resultsEl = document.querySelector('.results-viewer');
               if (resultsEl) resultsEl.scrollIntoView({ behavior: 'smooth' });
          }
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
          margin-bottom: 2rem;
     }

     .filters-panel {
          display: none;
          position: static;
          margin-bottom: 3rem;
          padding: 1.5rem;
          border-radius: var(--radius-md);
     }

     .filters-panel.is-visible {
          display: block;
          animation: slideDown 0.3s ease-out;
     }

     .results-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 1.5rem;
     }

     .results-actions {
          width: 100%;
          justify-content: space-between;
          flex-wrap: wrap;
     }

     .view-options {
          flex: 1;
          justify-content: center;
     }
}

@keyframes slideDown {
     from {
          opacity: 0;
          transform: translateY(-10px);
     }

     to {
          opacity: 1;
          transform: translateY(0);
     }
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
     color: var(--text-primary);
}

.input-with-icon input::placeholder {
     color: var(--text-muted);
}

.input-with-icon svg {
     position: absolute;
     left: 0.8rem;
     color: var(--text-muted);
}

.field-hint {
     font-size: 0.75rem;
     color: var(--text-muted);
     margin-top: 0.5rem;
     font-style: italic;
}

.group-header {
     display: flex;
     justify-content: space-between;
     align-items: center;
     margin-bottom: 1rem;
     gap: 1rem;
}

.logic-container {
     display: flex;
     align-items: center;
     gap: 0.5rem;
}

.logic-label {
     font-size: 0.7rem;
     text-transform: uppercase;
     font-weight: 700;
     color: var(--text-muted);
}

.logic-btns {
     display: flex;
     border: 1px solid var(--border-color);
     border-radius: 4px;
     overflow: hidden;
}

.logic-btns button {
     padding: 0.3rem 0.8rem;
     font-size: 0.75rem;
     font-weight: 700;
     background: var(--bg-color);
     transition: all 0.2s;
}

.logic-btns button.active {
     background: var(--primary-color);
     color: #fff;
}

.logic-explanation {
     margin-top: 1rem;
     padding: 0.8rem;
     background: rgba(212, 175, 55, 0.05);
     border-left: 3px solid var(--primary-color);
     border-radius: 4px;
}

.logic-explanation small {
     color: var(--text-secondary);
     line-height: 1.4;
     display: block;
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
     color: var(--text-primary);
}

.rule-box input::placeholder {
     color: var(--text-muted);
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

.btn-reset-all {
     font-size: 0.65rem;
     text-transform: uppercase;
     color: var(--text-muted);
     font-weight: 700;
     padding: 0.2rem 0.5rem;
     border-radius: 4px;
     border: 1px solid var(--border-color);
     background: var(--bg-color);
     transition: all 0.2s;
}

.btn-reset-all:hover {
     background: #dc3545;
     color: #fff;
     border-color: #dc3545;
}

.btn-reset-single {
     font-size: 1.2rem;
     color: var(--text-muted);
     line-height: 1;
     padding: 0 0.2rem;
     transition: color 0.2s;
}

.btn-reset-single:hover {
     color: #dc3545;
}

.main-select {
     width: 100%;
     padding: 0.8rem;
     border-radius: var(--radius-sm);
     border: 1px solid var(--border-color);
     background: var(--bg-color);
     color: var(--text-primary);
}

.main-select:disabled {
     opacity: 0.5;
     cursor: not-allowed;
     background: var(--border-color);
}

.w-full {
     width: 100%;
}

.results-header {
     margin-bottom: 2rem;
     border-bottom: 1px solid var(--border-color);
     padding-bottom: 1rem;
     display: flex;
     justify-content: space-between;
     align-items: center;
}

.results-stats {
     display: flex;
     flex-direction: column;
     gap: 0.2rem;
}

.results-page-info {
     font-size: 0.75rem;
     color: var(--text-muted);
     font-weight: 600;
}

.results-actions {
     display: flex;
     align-items: center;
     gap: 1.5rem;
}

.view-options {
     display: flex;
     gap: 0.5rem;
}

.view-options button {
     padding: 0.4rem 0.8rem;
     border: 1px solid var(--border-color);
     border-radius: var(--radius-sm);
     font-size: 0.65rem;
     font-weight: 700;
     text-transform: uppercase;
     background: var(--surface-color);
     color: var(--text-muted);
     transition: all 0.2s;
}

.view-options button.active {
     background: var(--primary-color);
     color: #fff;
     border-color: var(--primary-color);
}

.view-options button:hover:not(.active) {
     border-color: var(--primary-color);
     color: var(--primary-color);
}

.btn-refresh {
     padding: 0.5rem;
     border-radius: var(--radius-sm);
     color: var(--text-muted);
     transition: all 0.2s;
     border: 1px solid transparent;
}

.btn-refresh:hover {
     background: var(--bg-color);
     color: var(--primary-color);
     border-color: var(--border-color);
}

.pagination-wrapper {
     margin-top: 3rem;
     text-align: center;
}

.pagination-hint {
     font-size: 0.8rem;
     color: var(--text-muted);
     margin-top: -1rem;
     font-style: italic;
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

.grid-layout {
     display: grid;
     gap: var(--spacing-xl);
}

.grid-layout.view-grid {
     grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
}

.grid-layout.view-list,
.grid-layout.view-magazine {
     grid-template-columns: 1fr;
}
</style>
