<template>
     <div class="workspace-container" :class="{ 'is-active': workspaceState.isActive }">
          <!-- Botón Flotante para activar/desactivar -->
          <button class="workspace-toggle" @click="api.toggle()" title="Mi Portafolio">
               <svg v-if="!workspaceState.isActive" width="24" height="24" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
               </svg>
               <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
               </svg>
               <span class="badge" v-if="totalItems > 0 && !workspaceState.isActive">
                    {{ totalItems }}
               </span>
          </button>

          <!-- Panel Lateral del Portafolio -->
          <div class="workspace-panel">
               <div class="panel-header">
                    <h2>Mi Portafolio</h2>
                    <span class="item-count">{{ totalItems }} items</span>
               </div>

               <div class="panel-body">
                    <div v-if="totalItems === 0" class="empty-state">
                         <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                              stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                         </svg>
                         <p>No tienes registros guardados.</p>
                         <p class="hint">Usa el botón "Guardar" en las tarjetas para añadir elementos aquí.</p>
                    </div>

                    <div v-else class="item-list">
                         <!-- Sección de Colecciones -->
                         <div v-if="workspaceState.collections.length > 0" class="section">
                              <h3>Colecciones Guardadas</h3>
                              <div v-for="item in workspaceState.collections" :key="'col-' + item.id"
                                   class="workspace-item">
                                   <img :src="item.thumbnail || 'https://via.placeholder.com/50'" alt="thumb"
                                        class="item-thumb" />
                                   <div class="item-info">
                                        <h4>{{ item.title || 'Sin Título' }}</h4>
                                        <button class="btn-remove"
                                             @click="api.removeItem(item.id, 'collection')">Quitar</button>
                                   </div>
                              </div>
                         </div>

                         <!-- Sección de Registros -->
                         <div v-if="workspaceState.records.length > 0" class="section">
                              <h3>Registros Guardados</h3>
                              <div v-for="item in workspaceState.records" :key="'rec-' + item.id"
                                   class="workspace-item">
                                   <img :src="item.thumbnail || 'https://via.placeholder.com/50'" alt="thumb"
                                        class="item-thumb" />
                                   <div class="item-info">
                                        <h4>{{ item.title || 'Sin Título' }}</h4>
                                        <button class="btn-remove"
                                             @click="api.removeItem(item.id, 'record')">Quitar</button>
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>

               <div class="panel-footer" v-if="totalItems > 0">
                    <button class="btn-action" @click="exportItems">Exportar a PDF</button>
                    <button class="btn-clear" @click="api.clear()">Vaciar todo</button>
               </div>
          </div>

          <!-- Fondo oscuro al abrir el panel en móvil -->
          <div class="workspace-overlay" @click="api.toggle()"></div>

          <!-- Plantilla Oculta para PDF Export -->
          <div ref="pdfTemplateRef" class="pdf-export-template">
               <div class="pdf-header">
                    <h1>LICIUM GADIR</h1>
                    <h2>Portafolio de Selección Documental</h2>
                    <p class="pdf-date">Fecha de Exportación: {{ new Date().toLocaleDateString() }}</p>
               </div>

               <div class="pdf-body">
                    <!-- Colecciones en PDF -->
                    <div v-if="workspaceState.collections.length > 0" class="pdf-section">
                         <h3>Colecciones ({{ workspaceState.collections.length }})</h3>
                         <div class="pdf-grid">
                              <div v-for="item in workspaceState.collections" :key="'pdf-col-' + item.id"
                                   class="pdf-item">
                                   <img v-if="item.thumbnail" :src="item.thumbnail" class="pdf-thumb"
                                        crossorigin="anonymous" />
                                   <div class="pdf-info">
                                        <h4>{{ item.title || 'Sin Título' }}</h4>
                                        <div class="pdf-meta-list">
                                             <div v-if="item.identifier" class="pdf-meta">
                                                  <strong>Identificador:</strong> {{ item.identifier }}
                                             </div>
                                             <div v-if="item.creator" class="pdf-meta"><strong>Autor/Creador:</strong>
                                                  {{ item.creator }}</div>
                                             <div v-if="item.date" class="pdf-meta"><strong>Fecha:</strong> {{ item.date
                                             }}</div>
                                             <div v-if="item.type" class="pdf-meta"><strong>Tipo:</strong> {{ item.type
                                             }}</div>
                                        </div>
                                        <p v-if="item.description" class="pdf-desc">
                                             {{ stripHtml(item.description) }}
                                        </p>
                                        <span class="pdf-id">Ref: {{ item.id }}</span>
                                   </div>
                              </div>
                         </div>
                    </div>

                    <!-- Registros en PDF -->
                    <div v-if="workspaceState.records.length > 0" class="pdf-section">
                         <h3>Registros Documentales ({{ workspaceState.records.length }})</h3>
                         <div class="pdf-grid">
                              <div v-for="item in workspaceState.records" :key="'pdf-rec-' + item.id" class="pdf-item">
                                   <img v-if="item.thumbnail" :src="item.thumbnail" class="pdf-thumb"
                                        crossorigin="anonymous" />
                                   <div class="pdf-info">
                                        <h4>{{ item.title || 'Sin Título' }}</h4>
                                        <div class="pdf-meta-list">
                                             <div v-if="item.identifier" class="pdf-meta">
                                                  <strong>Identificador:</strong> {{ item.identifier }}
                                             </div>
                                             <div v-if="item.creator" class="pdf-meta"><strong>Autor/Creador:</strong>
                                                  {{ item.creator }}</div>
                                             <div v-if="item.date" class="pdf-meta"><strong>Fecha:</strong> {{ item.date
                                             }}</div>
                                             <div v-if="item.type" class="pdf-meta"><strong>Tipo:</strong> {{ item.type
                                             }}</div>
                                        </div>
                                        <p v-if="item.description" class="pdf-desc">
                                             {{ stripHtml(item.description) }}
                                        </p>
                                        <span class="pdf-id">Ref: {{ item.id }}</span>
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>
          </div>
     </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import html2pdf from 'html2pdf.js';

const props = defineProps({
     workspaceState: { type: Object, required: true },
     api: { type: Object, required: true }
});

const pdfTemplateRef = ref(null);

const totalItems = computed(() => props.workspaceState.records.length + props.workspaceState.collections.length);

const stripHtml = (html) => {
     if (!html) return '';
     return html.replace(/<[^>]*>?/gm, '').substring(0, 100) + '...';
};

const exportItems = () => {
     if (!pdfTemplateRef.value) return;

     // Mostrar temporalmente el template para que html2pdf pueda leerlo
     pdfTemplateRef.value.style.display = 'block';

     const opt = {
          margin: 15,
          filename: 'licium_portafolio.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['css', 'legacy'], avoid: '.pdf-item' }
     };

     // Generar el PDF
     html2pdf().set(opt).from(pdfTemplateRef.value).save().then(() => {
          // Volver a ocultar el template
          pdfTemplateRef.value.style.display = 'none';
     });
};
</script>

<style scoped>
.workspace-container {
     position: fixed;
     top: 0;
     left: 0;
     width: 100%;
     height: 100%;
     pointer-events: none;
     z-index: 9999;
}

.workspace-toggle {
     position: fixed;
     bottom: 2rem;
     right: 2rem;
     width: 60px;
     height: 60px;
     border-radius: 50%;
     background: var(--primary-color, #0056b3);
     color: #fff;
     border: none;
     box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
     display: flex;
     align-items: center;
     justify-content: center;
     cursor: pointer;
     pointer-events: auto;
     transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), background 0.3s;
     z-index: 10001;
}

.workspace-toggle:hover {
     transform: scale(1.1);
     background: var(--primary-dark, #003d82);
}

.badge {
     position: absolute;
     top: -5px;
     right: -5px;
     background: #e63946;
     color: white;
     font-size: 0.75rem;
     font-weight: bold;
     width: 24px;
     height: 24px;
     border-radius: 50%;
     display: flex;
     align-items: center;
     justify-content: center;
     border: 2px solid var(--surface-color, #fff);
}

.workspace-panel {
     position: fixed;
     top: 0;
     right: -400px;
     width: 400px;
     max-width: 100vw;
     height: 100vh;
     background: var(--surface-color, #fff);
     box-shadow: -5px 0 25px rgba(0, 0, 0, 0.1);
     display: flex;
     flex-direction: column;
     transition: right 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
     pointer-events: auto;
     z-index: 10000;
     border-left: 1px solid var(--border-color, #eee);
}

.is-active .workspace-panel {
     right: 0;
}

.workspace-overlay {
     position: fixed;
     top: 0;
     left: 0;
     width: 100%;
     height: 100%;
     background: rgba(0, 0, 0, 0.5);
     backdrop-filter: blur(2px);
     opacity: 0;
     transition: opacity 0.4s;
     pointer-events: none;
     z-index: 9999;
}

.is-active .workspace-overlay {
     opacity: 1;
     pointer-events: auto;
}

.panel-header {
     padding: 2rem;
     border-bottom: 1px solid var(--border-color, #eee);
     display: flex;
     justify-content: space-between;
     align-items: center;
     background: var(--surface-color);
}

.panel-header h2 {
     margin: 0;
     font-family: var(--font-heading, serif);
     font-size: 1.5rem;
     color: var(--text-primary, #000);
}

.item-count {
     font-size: 0.85rem;
     color: var(--text-secondary, #666);
     background: var(--bg-color, #f5f5f5);
     padding: 0.25rem 0.75rem;
     border-radius: 1rem;
}

.panel-body {
     flex: 1;
     overflow-y: auto;
     padding: 1.5rem;
}

.empty-state {
     text-align: center;
     color: var(--text-muted, #999);
     margin-top: 3rem;
}

.empty-state svg {
     margin-bottom: 1rem;
     opacity: 0.5;
}

.empty-state .hint {
     font-size: 0.85rem;
     margin-top: 1rem;
}

.item-list {
     display: flex;
     flex-direction: column;
     gap: 1.5rem;
}

.section {
     display: flex;
     flex-direction: column;
     gap: 0.8rem;
}

.section h3 {
     font-size: 0.9rem;
     text-transform: uppercase;
     letter-spacing: 0.05em;
     color: var(--text-secondary, #666);
     margin: 0 0 0.5rem 0;
     border-bottom: 1px solid var(--border-color, #eee);
     padding-bottom: 0.3rem;
}

.workspace-item {
     display: flex;
     gap: 1rem;
     padding: 1rem;
     background: var(--bg-color, #fafafa);
     border: 1px solid var(--border-color, #eee);
     border-radius: var(--radius-md, 8px);
     transition: transform 0.2s;
}

.workspace-item:hover {
     transform: translateX(-4px);
     border-color: var(--primary-color, #0056b3);
}

.item-thumb {
     width: 60px;
     height: 60px;
     object-fit: cover;
     border-radius: var(--radius-sm, 4px);
}

.item-info {
     flex: 1;
     display: flex;
     flex-direction: column;
     justify-content: center;
}

.item-info h4 {
     margin: 0 0 0.5rem 0;
     font-size: 0.95rem;
     color: var(--text-primary, #000);
     display: -webkit-box;
     -webkit-line-clamp: 2;
     -webkit-box-orient: vertical;
     overflow: hidden;
}

.btn-remove {
     align-self: flex-start;
     background: none;
     border: none;
     color: #e63946;
     font-size: 0.8rem;
     cursor: pointer;
     padding: 0;
     font-weight: 600;
}

.btn-remove:hover {
     text-decoration: underline;
}

.panel-footer {
     padding: 1.5rem;
     border-top: 1px solid var(--border-color, #eee);
     display: flex;
     flex-direction: column;
     gap: 0.75rem;
}

.btn-action {
     background: var(--primary-color, #000);
     color: var(--surface-color, #fff);
     border: none;
     padding: 1rem;
     font-weight: bold;
     text-transform: uppercase;
     letter-spacing: 0.1em;
     cursor: pointer;
     border-radius: var(--radius-sm, 4px);
     transition: background 0.2s;
}

.btn-action:hover {
     background: var(--primary-dark, #333);
}

.btn-clear {
     background: none;
     border: 1px solid var(--border-color, #ccc);
     color: var(--text-secondary, #666);
     padding: 0.75rem;
     cursor: pointer;
     border-radius: var(--radius-sm, 4px);
     transition: all 0.2s;
}

.btn-clear:hover {
     background: #e63946;
     color: white;
     border-color: #e63946;
}

/* PDF Export Template Styling */
.pdf-export-template {
     display: none;
     background: #ffffff;
     color: #1a1a1a;
     padding: 40px;
     font-family: var(--font-body, 'Inter', sans-serif);
     width: 790px;
     max-width: 100%;
     box-sizing: border-box;
}

.pdf-header {
     text-align: center;
     border-bottom: 2px solid var(--primary-color, #d4af37);
     padding-bottom: 30px;
     margin-bottom: 50px;
     display: flex;
     flex-direction: column;
     align-items: center;
     gap: 10px;
}

.pdf-header h1 {
     font-family: var(--font-heading, 'Playfair Display', serif);
     font-size: 32pt;
     letter-spacing: 0.25em;
     margin: 0;
     color: var(--text-primary, #1a1a1a);
     text-transform: uppercase;
}

.pdf-header h2 {
     font-family: var(--font-body, 'Inter', sans-serif);
     font-weight: 300;
     font-size: 14pt;
     letter-spacing: 0.1em;
     margin: 0;
     color: var(--primary-color, #d4af37);
     text-transform: uppercase;
}

.pdf-date {
     font-size: 10pt;
     color: var(--text-muted, #888);
     margin-top: 15px;
}

.pdf-section {
     margin-bottom: 50px;
}

.pdf-section h3 {
     font-family: var(--font-heading, 'Playfair Display', serif);
     font-size: 18pt;
     color: var(--text-primary, #1a1a1a);
     border-bottom: 1px solid rgba(0, 0, 0, 0.1);
     padding-bottom: 10px;
     margin-bottom: 30px;
     display: flex;
     align-items: center;
     gap: 15px;
}

.pdf-section h3::before {
     content: '';
     display: block;
     width: 12px;
     height: 12px;
     background: var(--primary-color, #d4af37);
     border-radius: 50%;
}

.pdf-grid {
     display: flex;
     flex-wrap: wrap;
     gap: 20px;
}

.pdf-item {
     width: calc(50% - 10px);
     /* Exactly half minus half the gap */
     display: flex;
     flex-direction: column;
     page-break-inside: avoid;
     background: #fafafa;
     border: 1px solid rgba(0, 0, 0, 0.05);
     border-radius: 6px;
     overflow: hidden;
     box-sizing: border-box;
}

.pdf-thumb {
     width: 100%;
     height: 120px;
     object-fit: cover;
     border-bottom: 1px solid rgba(0, 0, 0, 0.05);
     background: #fff;
}

.pdf-info {
     padding: 12px;
     flex: 1;
     display: flex;
     flex-direction: column;
}

.pdf-info h4 {
     font-family: var(--font-heading, 'Playfair Display', serif);
     font-size: 11pt;
     margin: 0 0 8px 0;
     color: var(--text-primary, #1a1a1a);
     line-height: 1.2;
}

.pdf-meta-list {
     font-size: 8pt;
     color: var(--text-secondary, #4a4a4a);
     margin-bottom: 8px;
     padding-bottom: 8px;
     border-bottom: 1px dashed rgba(0, 0, 0, 0.1);
}

.pdf-meta {
     margin-bottom: 3px;
     white-space: nowrap;
     overflow: hidden;
     text-overflow: ellipsis;
}

.pdf-meta strong {
     color: var(--text-primary, #1a1a1a);
     font-weight: 600;
}

.pdf-desc {
     font-size: 8.5pt;
     color: var(--text-secondary, #4a4a4a);
     line-height: 1.4;
     margin-bottom: 12px;
     flex: 1;
}

.pdf-id {
     font-size: 7.5pt;
     font-family: monospace;
     color: var(--primary-color, #d4af37);
     background: rgba(212, 175, 55, 0.1);
     padding: 3px 6px;
     border-radius: 4px;
     align-self: flex-start;
     letter-spacing: 0.05em;
     font-weight: 600;
}

.pdf-footer {
     text-align: center;
     margin-top: 60px;
     border-top: 1px solid rgba(0, 0, 0, 0.1);
     padding-top: 30px;
     font-size: 9pt;
     color: var(--text-muted, #888);
     letter-spacing: 0.05em;
}
</style>
