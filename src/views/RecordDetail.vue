<template>
     <!-- Vista de Detalle de Registro: Interfaz enriquecida para la exploración de metadatos y medios -->
     <div class="record-page fade-in">

          <!-- Estado de carga: Visualización transicional durante la recuperación de datos -->
          <div v-if="loading" class="loading-wrapper">
               <span class="loader"></span>
               Cargando registro...
          </div>

          <!-- Contenedor principal del registro: Renderizado una vez confirmada la disponibilidad de datos -->
          <div v-else-if="record" class="record-container">

               <!-- Encabezado del registro: Gestión de navegación y jerarquía de títulos -->
               <header class="record-header container">
                    <div class="header-nav">
                         <button @click="$router.go(-1)" class="btn-back">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                   stroke-width="2">
                                   <path d="m15 18-6-6 6-6" />
                              </svg>
                              Volver
                         </button>
                         <div class="breadcrumb">
                              <span>Catálogo</span> / <span>Detalle de Registro</span>
                         </div>
                    </div>

                    <div class="title-section">
                         <div class="meta-badges">
                              <span class="badge">Registro</span>
                              <!-- Referencias a colecciones que contienen este registro -->
                              <div v-if="record.collections?.length" class="collection-links">
                                   <router-link v-for="col in record.collections" :key="col.id"
                                        :to="{ name: 'collection-detail', params: { id: col.id } }"
                                        class="collection-link">
                                        {{ col.title }}
                                   </router-link>
                              </div>
                         </div>
                         <h1 class="record-title">{{ record.title }}</h1>
                    </div>
               </header>

               <div class="record-content container">
                    <div class="content-grid">

                         <!-- Bloque Multimedia: Gestión de imagen principal y carrusel de galería -->
                         <div class="media-section">
                              <div class="sticky-media">
                                   <!-- Visualizador principal con trigger para el modo a pantalla completa -->
                                   <div class="main-image-wrapper"
                                        :class="{ 'is-pdf': isPdfSelected, 'no-click': !hasImage || isPdfSelected }"
                                        @click="hasImage && !isPdfSelected && openLightbox"
                                        :title="hasImage && !isPdfSelected ? 'Click para ver en grande' : ''">

                                        <template v-if="hasImage">
                                             <!-- Vista previa para documentos PDF -->
                                             <div v-if="isPdfSelected" class="pdf-main-preview">
                                                  <div class="pdf-icon-wrapper">
                                                       <svg width="64" height="64" viewBox="0 0 24 24" fill="none"
                                                            stroke="currentColor" stroke-width="1.2">
                                                            <path
                                                                 d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                            <polyline points="14 2 14 8 20 8" />
                                                            <line x1="9" y1="13" x2="15" y2="13" />
                                                            <line x1="9" y1="17" x2="15" y2="17" />
                                                            <line x1="9" y1="9" x2="10" y2="9" />
                                                       </svg>
                                                  </div>
                                                  <div class="pdf-actions">
                                                       <span class="pdf-tag">Documento PDF</span>
                                                       <router-link v-if="selectedMediaItem"
                                                            :to="{ name: 'media-detail', params: { id: getId(selectedMediaItem) }, query: { from: route.fullPath } }"
                                                            class="btn-view-doc">
                                                            Abrir en visor interactivo
                                                       </router-link>
                                                  </div>
                                             </div>

                                             <!-- Visualización de imagen estándar -->
                                             <img v-else :src="getThumbnail(selectedImage || record.thumbnail, 'large')"
                                                  class="main-img" alt="Imagen del registro" />
                                        </template>

                                        <!-- Estado vacío: Sin medios disponibles -->
                                        <div v-else class="no-img-placeholder">
                                             <div class="no-img-icon">
                                                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
                                                       stroke="currentColor" stroke-width="1.2">
                                                       <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                                                       <circle cx="9" cy="9" r="2" />
                                                       <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                                                  </svg>
                                             </div>
                                             <span>Sin material visual disponible</span>
                                        </div>
                                   </div>

                                   <div v-if="record.media_items?.length" class="main-media-actions">
                                        <router-link :to="{ name: 'record-media', params: { id: record.id } }"
                                             class="btn-primary btn-media-view">
                                             <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                                  stroke="currentColor" stroke-width="2.5">
                                                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                                                  <circle cx="9" cy="9" r="2" />
                                                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                                             </svg>
                                             Ver todos los medios ({{ record.media_items.length }})
                                        </router-link>
                                   </div>

                                   <!-- Selector de galería para registros con múltiples elementos de medios -->
                                   <div class="gallery-section" v-if="record.media_items?.length">
                                        <h3 class="section-label">Galería de Imágenes</h3>
                                        <div class="gallery-scroll">
                                             <div v-for="(m, idx) in displayedMedia" :key="m.id" class="gallery-thumb"
                                                  :class="{ 'active': isSelected(m) }" @click="setMainImage(m)">
                                                  <img :src="getThumbnail(m.thumbnail || m.path, 'small')"
                                                       :alt="m.title || 'Miniatura'" />
                                             </div>

                                             <!-- Botón Ver más si hay más de 2 medios -->
                                             <router-link v-if="hasMoreMedia"
                                                  :to="{ name: 'record-media', params: { id: record.id } }"
                                                  class="btn-more-media">
                                                  <div class="more-content">
                                                       <span>+{{ record.media_items.length - 2 }}</span>
                                                       <small>Ver todos</small>
                                                  </div>
                                             </router-link>
                                        </div>
                                   </div>
                              </div>
                         </div>

                         <!-- Bloque Informativo: Descripción narrativa y ficha técnica de metadatos -->
                         <div class="info-section">
                              <!-- Área de descripción con soporte para contenido HTML -->
                              <div class="description-area" v-if="record.description">
                                   <h3 class="section-label">Descripción</h3>
                                   <div class="description-text" v-html="record.description"></div>
                              </div>

                              <!-- Ficha técnica institucional basada en metadatos canónicos -->
                              <div class="metadata-card" v-if="record.canonical_joined_metadata">
                                   <div class="metadata-header">
                                        <h3 class="section-label">Ficha Técnica</h3>
                                        <div class="metadata-actions-group">
                                             <button @click="exportToPdf" class="btn-info-detail"
                                                  title="Exportar a PDF">
                                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                                       stroke="currentColor" stroke-width="2.5">
                                                       <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                                       <polyline points="7 10 12 15 17 10"></polyline>
                                                       <line x1="12" y1="15" x2="12" y2="3"></line>
                                                  </svg>
                                                  PDF
                                             </button>
                                             <button @click="showMetadataModal = true" class="btn-info-detail"
                                                  title="Ver metadatos completos">
                                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                                       stroke="currentColor" stroke-width="2.5">
                                                       <circle cx="12" cy="12" r="10" />
                                                       <path d="M12 16v-4" />
                                                       <path d="M12 8h.01" />
                                                  </svg>
                                                  Metadatos
                                             </button>
                                        </div>
                                   </div>
                                   <div class="metadata-list">
                                        <template v-for="(meta, key) in record.canonical_joined_metadata" :key="key">
                                             <div class="metadata-item" v-if="meta.values?.length">
                                                  <div class="metadata-label">{{ meta.label || key }}</div>
                                                  <div class="metadata-value">
                                                       <div class="metadata-values-container">
                                                            <div v-for="(v, index) in meta.values" :key="index"
                                                                 class="metadata-value-entry">
                                                                 <span v-if="v.type" class="type-badge"
                                                                      :class="'type-' + v.type.replace('.', '-')">{{
                                                                           v.type }}</span>
                                                                 <span class="value-content">
                                                                      <template
                                                                           v-if="v.type === 'uri' || v.type === 'uri.resource' || v.type === 'uri.recurso'">
                                                                           <a :href="v.uri || v['@id'] || v.value"
                                                                                target="_blank" class="meta-link">{{
                                                                                     formatValue(v) }}</a>
                                                                      </template>
                                                                      <template
                                                                           v-else-if="getRouteName(v) && (v.id || v['@id'])">
                                                                           <router-link
                                                                                :to="{ name: getRouteName(v), params: { id: getId(v) }, query: { from: route.fullPath } }"
                                                                                class="meta-link">
                                                                                {{ formatValue(v) }}
                                                                           </router-link>
                                                                      </template>
                                                                      <template
                                                                           v-else-if="v.type === 'authority' || v.type === 'autoridad'">
                                                                           <div class="authority-wrapper">
                                                                                <a v-if="v.uri || v['@id'] || (v.value && v.value.toString().startsWith('http'))"
                                                                                     :href="v.uri || v['@id'] || v.value"
                                                                                     target="_blank"
                                                                                     class="meta-link authority-link">
                                                                                     {{ formatValue(v) }}
                                                                                </a>
                                                                                <span v-else class="authority-value">{{
                                                                                     formatValue(v) }}</span>

                                                                                <button v-if="getId(v)"
                                                                                     @click="openAuthorityModal(getId(v))"
                                                                                     class="btn-authority-info"
                                                                                     title="Ver detalles de la autoridad">
                                                                                     <svg width="12" height="12"
                                                                                          viewBox="0 0 24 24"
                                                                                          fill="none"
                                                                                          stroke="currentColor"
                                                                                          stroke-width="2.5">
                                                                                          <circle cx="12" cy="12"
                                                                                               r="10" />
                                                                                          <path d="M12 16v-4" />
                                                                                          <path d="M12 8h.01" />
                                                                                     </svg>
                                                                                     Detalles
                                                                                </button>
                                                                           </div>
                                                                      </template>
                                                                      <template
                                                                           v-else-if="v.type === 'vocabulary' || v.type === 'vocabulario'">
                                                                           <a v-if="v.uri || v['@id'] || (v.value && v.value.toString().startsWith('http'))"
                                                                                :href="v.uri || v['@id'] || v.value"
                                                                                target="_blank"
                                                                                class="meta-link vocabulary-link">
                                                                                {{ formatValue(v) }}
                                                                           </a>
                                                                           <span v-else class="vocabulary-value">{{
                                                                                formatValue(v) }}</span>
                                                                      </template>
                                                                      <template v-else>
                                                                           {{ formatValue(v) }}
                                                                      </template>
                                                                 </span>
                                                            </div>
                                                       </div>
                                                  </div>
                                             </div>
                                        </template>
                                   </div>
                              </div>
                         </div>

                    </div>
               </div>

               <!-- Visor Inmersivo (Lightbox): Proyectado mediante Teleport para evitar colisiones de Z-index -->
               <Teleport to="body">
                    <Transition name="fade">
                         <div v-if="showLightbox" class="lightbox" @click.self="closeLightbox">

                              <!-- Interfaz de control del visor -->
                              <button class="lightbox-close" @click="closeLightbox" title="Cerrar">
                                   <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        stroke-width="2.5">
                                        <path d="M18 6 6 18M6 6l12 12" />
                                   </svg>
                              </button>

                              <!-- Controles de navegación secuencial -->
                              <button class="lightbox-nav prev" @click="prevImage"
                                   v-if="record.media_items?.length > 1">
                                   <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        stroke-width="2">
                                        <path d="m15 18-6-6 6-6" />
                                   </svg>
                              </button>

                              <!-- Contenedor de la imagen proyectada con soporte para zoom reactivo -->
                              <div class="lightbox-viewer" :class="{ 'is-zoomed': isZoomed }">
                                   <img :src="getThumbnail(record.media_items[currentImageIndex]?.path || record.media_items[currentImageIndex]?.thumbnail || record.thumbnail, 'large')"
                                        class="lightbox-img" @click="toggleZoom"
                                        :title="isZoomed ? 'Click para reducir' : 'Click para zoom'" />

                                   <div class="lightbox-caption" v-if="record.media_items[currentImageIndex]?.title">
                                        {{ record.media_items[currentImageIndex].title }}
                                   </div>
                              </div>

                              <button class="lightbox-nav next" @click="nextImage"
                                   v-if="record.media_items?.length > 1">
                                   <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        stroke-width="2">
                                        <path d="m9 18 6-6-6-6" />
                                   </svg>
                              </button>

                         </div>
                    </Transition>
               </Teleport>

               <!-- Modal de Metadatos Detallados -->
               <Teleport to="body">
                    <Transition name="fade">
                         <div v-if="showMetadataModal" class="metadata-modal-overlay" @click.self="closeMetadataModal">
                              <div class="metadata-modal">
                                   <header class="modal-header">
                                        <h2>Detalles del Registro</h2>
                                        <button class="modal-close" @click="closeMetadataModal" title="Cerrar">
                                             <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                                  stroke="currentColor" stroke-width="2.5">
                                                  <path d="M18 6 6 18M6 6l12 12" />
                                             </svg>
                                        </button>
                                   </header>

                                   <div class="modal-body">
                                        <div class="modal-section" v-if="record">
                                             <h3 class="modal-subtitle">Identificación del Registro</h3>
                                             <div class="system-meta-grid">
                                                  <div class="system-meta-item"
                                                       v-if="record.identifier || record.metadata?.identifier">
                                                       <div class="system-meta-label">Identificador</div>
                                                       <div class="system-meta-value">{{ formatValue(record.identifier
                                                            ||
                                                            record.metadata?.identifier) }}</div>
                                                  </div>
                                                  <div class="system-meta-item" v-if="record.id">
                                                       <div class="system-meta-label">ID Sistema</div>
                                                       <div class="system-meta-value">{{ record.id }}</div>
                                                  </div>
                                                  <div class="system-meta-item"
                                                       v-if="record.language || record.metadata?.language">
                                                       <div class="system-meta-label">Idioma</div>
                                                       <div class="system-meta-value">{{ formatValue(record.language ||
                                                            record.metadata?.language) }}</div>
                                                  </div>
                                             </div>
                                        </div>

                                        <div class="modal-section" v-if="record.joined_metadata">
                                             <h3 class="modal-subtitle">Ficha Técnica Completa</h3>
                                             <div class="full-metadata-list">
                                                  <div v-for="(meta, key) in record.joined_metadata" :key="key"
                                                       class="full-metadata-item">
                                                       <div class="full-metadata-label">{{ meta.label || key }}</div>
                                                       <div class="full-metadata-value">
                                                            <div class="metadata-values-container"
                                                                 v-if="meta.values?.length">
                                                                 <div v-for="(v, index) in meta.values" :key="index"
                                                                      class="metadata-value-entry">
                                                                      <span v-if="v.type" class="type-badge"
                                                                           :class="'type-' + v.type.replace('.', '-')">{{
                                                                                v.type
                                                                           }}</span>
                                                                      <span class="value-content">
                                                                           <template
                                                                                v-if="v.type === 'uri' || v.type === 'uri.resource' || v.type === 'uri.recurso'">
                                                                                <a :href="v.uri || v['@id'] || v.value"
                                                                                     target="_blank"
                                                                                     class="meta-link">{{ formatValue(v)
                                                                                     }}</a>
                                                                           </template>
                                                                           <template
                                                                                v-else-if="getRouteName(v) && (v.id || v['@id'])">
                                                                                <router-link
                                                                                     :to="{ name: getRouteName(v), params: { id: getId(v) }, query: { from: route.fullPath } }"
                                                                                     class="meta-link">
                                                                                     {{ formatValue(v) }}
                                                                                </router-link>
                                                                           </template>
                                                                           <template
                                                                                v-else-if="v.type === 'authority' || v.type === 'autoridad'">
                                                                                <div class="authority-wrapper">
                                                                                     <a v-if="v.uri || v['@id'] || (v.value && v.value.toString().startsWith('http'))"
                                                                                          :href="v.uri || v['@id'] || v.value"
                                                                                          target="_blank"
                                                                                          class="meta-link authority-link">
                                                                                          {{ formatValue(v) }}
                                                                                     </a>
                                                                                     <span v-else
                                                                                          class="authority-value">{{
                                                                                               formatValue(v) }}</span>

                                                                                     <button v-if="getId(v)"
                                                                                          @click="openAuthorityModal(getId(v))"
                                                                                          class="btn-authority-info"
                                                                                          title="Ver detalles de la autoridad">
                                                                                          <svg width="12" height="12"
                                                                                               viewBox="0 0 24 24"
                                                                                               fill="none"
                                                                                               stroke="currentColor"
                                                                                               stroke-width="2.5">
                                                                                               <circle cx="12" cy="12"
                                                                                                    r="10" />
                                                                                               <path d="M12 16v-4" />
                                                                                               <path d="M12 8h.01" />
                                                                                          </svg>
                                                                                          Detalles
                                                                                     </button>
                                                                                </div>
                                                                           </template>
                                                                           <template
                                                                                v-else-if="v.type === 'vocabulary' || v.type === 'vocabulario'">
                                                                                <a v-if="v.uri || v['@id'] || (v.value && v.value.toString().startsWith('http'))"
                                                                                     :href="v.uri || v['@id'] || v.value"
                                                                                     target="_blank"
                                                                                     class="meta-link vocabulary-link">
                                                                                     {{ formatValue(v) }}
                                                                                </a>
                                                                                <span v-else class="vocabulary-value">{{
                                                                                     formatValue(v) }}</span>
                                                                           </template>
                                                                           <template v-else>
                                                                                {{ formatValue(v) }}
                                                                           </template>
                                                                      </span>
                                                                 </div>
                                                            </div>
                                                            <template v-else>—</template>
                                                       </div>
                                                  </div>
                                             </div>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </Transition>
               </Teleport>

               <!-- Modal de Detalle de Autoridad (Persona/Entidad/Lugar) -->
               <Teleport to="body">
                    <Transition name="fade">
                         <div v-if="showAuthorityModal" class="metadata-modal-overlay"
                              @click.self="closeAuthorityModal">
                              <div class="metadata-modal authority-modal-card">
                                   <header class="modal-header">
                                        <div class="modal-header-nav">
                                             <button class="modal-close" @click="closeAuthorityModal" title="Cerrar">
                                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                                       stroke="currentColor" stroke-width="2.5">
                                                       <path d="M18 6 6 18M6 6l12 12" />
                                                  </svg>
                                             </button>
                                        </div>
                                   </header>

                                   <div class="modal-body">
                                        <div v-if="authorityLoading" class="loading-wrapper auth-loading">
                                             <span class="loader"></span>
                                        </div>

                                        <div v-else-if="selectedAuthority" class="authority-content">
                                             <div class="authority-hero">
                                                  <div class="authority-portrait">
                                                       <img v-if="selectedAuthority.thumbnail"
                                                            :src="getThumbnail(selectedAuthority.thumbnail, 'large')"
                                                            :alt="selectedAuthority.title" />
                                                       <div v-else class="authority-portrait-placeholder">
                                                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
                                                                 stroke="currentColor" stroke-width="1.2">
                                                                 <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                                                 <circle cx="12" cy="7" r="4" />
                                                            </svg>
                                                       </div>
                                                  </div>
                                                  <div class="authority-main-info">
                                                       <span class="authority-type-tag">Ficha de Autoridad</span>
                                                       <h2 class="authority-name">{{ selectedAuthority.title }}</h2>
                                                       <div v-if="selectedAuthority.metadata?.type"
                                                            class="authority-subtitle">
                                                            {{ formatValue(selectedAuthority.metadata.type) }}
                                                       </div>
                                                  </div>
                                             </div>

                                             <div class="authority-details">
                                                  <template
                                                       v-if="selectedAuthority.description || hasAuthorityLinks(selectedAuthority.metadata)">
                                                       <div class="authority-section"
                                                            v-if="selectedAuthority.description">
                                                            <h3 class="modal-subtitle">Descripción</h3>
                                                            <div class="authority-desc-text"
                                                                 v-html="selectedAuthority.description"></div>
                                                       </div>

                                                       <div class="authority-section"
                                                            v-if="hasAuthorityLinks(selectedAuthority.metadata)">
                                                            <h3 class="modal-subtitle">Enlaces e Identificadores</h3>
                                                            <div class="authority-links-grid">
                                                                 <template v-for="(v, k) in selectedAuthority.metadata"
                                                                      :key="k">
                                                                      <a v-if="(k.includes('wikidata') || k.includes('wikipedia') || k.includes('viaf') || k.includes('isni') || k.includes('gnd') || k.includes('external')) && ensureString(v)"
                                                                           :href="ensureString(v)" target="_blank"
                                                                           class="authority-link-item">
                                                                           <div class="auth-link-icon"
                                                                                :style="{ backgroundColor: getAuthorityLinkColor(k) }">
                                                                                {{ getAuthorityLinkIcon(k) }}
                                                                           </div>
                                                                           <div class="auth-link-details">
                                                                                <span class="auth-link-label">{{ k
                                                                                }}</span>
                                                                                <span class="auth-link-val">{{
                                                                                     ensureString(v) }}</span>
                                                                           </div>
                                                                      </a>
                                                                 </template>
                                                            </div>
                                                       </div>
                                                  </template>
                                                  <div v-else class="no-authority-details">
                                                       <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
                                                            stroke="currentColor" stroke-width="1"
                                                            style="opacity: 0.3; margin-bottom: 1rem;">
                                                            <path d="M12 8v4" />
                                                            <path d="M12 16h.01" />
                                                            <circle cx="12" cy="12" r="10" />
                                                       </svg>
                                                       <p>No existen detalles adicionales para este medio.</p>
                                                  </div>
                                             </div>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </Transition>
               </Teleport>

          </div>
     </div>


     <!-- Template Oculto para PDF Export -->
     <div ref="pdfTemplateRef" class="pdf-export-template">
          <div class="pdf-header">
               <h1>LICIUM GADIR</h1>
               <h2>Ficha de Registro Documental</h2>
               <p class="pdf-date">Fecha de Exportación: {{ new Date().toLocaleDateString() }}</p>
          </div>

          <div class="pdf-body" v-if="record">
               <div class="pdf-main-content">
                    <div class="pdf-image-container" v-if="record.thumbnail">
                         <img :src="getThumbnail(record.thumbnail, 'large')" class="pdf-main-image"
                              crossorigin="anonymous" />
                    </div>
                    <div class="pdf-title-section">
                         <h3>{{ record.title || 'Sin Título' }}</h3>
                         <div class="pdf-id-badge">ID: {{ record.id }}</div>
                    </div>
               </div>

               <div class="pdf-description" v-if="record.description" v-html="record.description"></div>

               <div class="pdf-metadata-section" v-if="record.canonical_joined_metadata">
                    <h3>Detalles de la Obra</h3>
                    <table class="pdf-metadata-table">
                         <tbody>
                              <tr v-for="(meta, key) in record.canonical_joined_metadata" :key="'pdf-' + key">
                                   <td class="pdf-meta-label">{{ meta.label || key }}</td>
                                   <td class="pdf-meta-value">
                                        <div v-for="(v, idx) in meta.values" :key="'pdf-val-' + idx">
                                             <a v-if="v.uri || v['@id'] || (v.value && v.value.toString().startsWith('http'))"
                                                  :href="v.uri || v['@id'] || v.value" class="pdf-link">
                                                  {{ formatValue(v) }}
                                             </a>
                                             <span v-else>{{ formatValue(v) }}</span>
                                        </div>
                                   </td>
                              </tr>
                         </tbody>
                    </table>
               </div>

               <div class="pdf-metadata-section" v-if="record.joined_metadata">
                    <h3>Información Descriptiva</h3>
                    <table class="pdf-metadata-table">
                         <tbody>
                              <tr v-for="(meta, key) in record.joined_metadata" :key="'pdf-joined-' + key">
                                   <td class="pdf-meta-label">{{ meta.label || key }}</td>
                                   <td class="pdf-meta-value">
                                        <div v-for="(v, idx) in meta.values" :key="'pdf-jval-' + idx">
                                             <a v-if="v.uri || v['@id'] || (v.value && v.value.toString().startsWith('http'))"
                                                  :href="v.uri || v['@id'] || v.value" class="pdf-link">
                                                  {{ formatValue(v) }}
                                             </a>
                                             <span v-else>{{ formatValue(v) }}</span>
                                        </div>
                                   </td>
                              </tr>
                         </tbody>
                    </table>
               </div>

               <div class="pdf-metadata-section">
                    <h3>Identificación y Sistema</h3>
                    <table class="pdf-metadata-table">
                         <tbody>
                              <tr v-if="record.identifier">
                                   <td class="pdf-meta-label">Identificador</td>
                                   <td class="pdf-meta-value">{{ record.identifier }}</td>
                              </tr>
                              <tr v-if="record.language">
                                   <td class="pdf-meta-label">Idioma</td>
                                   <td class="pdf-meta-value">{{ record.language }}</td>
                              </tr>
                              <tr>
                                   <td class="pdf-meta-label">ID de Sistema</td>
                                   <td class="pdf-meta-value">{{ record.id }}</td>
                              </tr>
                         </tbody>
                    </table>
               </div>
          </div>

     </div>

</template>

<script setup>
/**
 * Vista RecordDetail.
 * 
 * Este componente es responsable de orquestar la visualización profunda de un
 * registro individual. Gestiona la recuperación de metadatos exhaustivos,
 * el estado dinámico de la galería multimedia y el ciclo de vida del visor
 * interactivo (lightbox), asegurando una experiencia de usuario fluida y coherente.
 */

import { ref, onMounted, watch, onUnmounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import html2pdf from 'html2pdf.js';

const route = useRoute();
const record = ref(null);
const loading = ref(true);

// Gestión de la imagen focal de la ficha técnica
const selectedImage = ref(null);

// Estado del sistema de visualización a pantalla completa (Lightbox)
const showLightbox = ref(false);
const currentImageIndex = ref(0);
const isZoomed = ref(false);

const showMetadataModal = ref(false);

// Gestión del Modal de Autoridades (Personas, Entidades, etc.)
const showAuthorityModal = ref(false);
const authorityLoading = ref(false);
const selectedAuthority = ref(null);

const hasAuthorityLinks = (metadata) => {
     if (!metadata) return false;
     return Object.keys(metadata).some(k =>
          k.includes('wikidata') || k.includes('wikipedia') || k.includes('viaf') ||
          k.includes('isni') || k.includes('gnd') || k.includes('external')
     );
};

// Referencia para la exportación PDF
const pdfTemplateRef = ref(null);




const exportToPdf = () => {
     console.log('Iniciando exportación PDF');
     if (!pdfTemplateRef.value) {
          console.error('pdfTemplateRef es null');
          return;
     }

     pdfTemplateRef.value.style.display = 'block';

     const opt = {
          margin: 15,
          filename: `Ficha_${record.value?.id || 'Registro'}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: true, enableLinks: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
     };

     html2pdf().set(opt).from(pdfTemplateRef.value).save().then(() => {
          pdfTemplateRef.value.style.display = 'none';
          console.log('Exportación PDF finalizada');
     }).catch(err => {
          console.error('Error en exportación PDF:', err);
          pdfTemplateRef.value.style.display = 'none';
     });
};



/**
 * Recupera y visualiza el detalle expandido de una autoridad desde el servicio core.
 */
const openAuthorityModal = async (id) => {
     if (!id) return;
     showAuthorityModal.value = true;
     authorityLoading.value = true;
     selectedAuthority.value = null;
     document.body.style.overflow = 'hidden';

     try {
          const res = await axios.get(`/api/core/authority/${id}`, { params: { with_labels: 1 } });
          selectedAuthority.value = res.data.item || res.data;
     } catch (e) {
          console.error("Error al recuperar detalle de la autoridad:", e);
     } finally {
          authorityLoading.value = false;
     }
};

const closeAuthorityModal = () => {
     showAuthorityModal.value = false;
     document.body.style.overflow = '';
};

// Estados para la gestión de medios limitados
const displayedMedia = computed(() => record.value?.media_items?.slice(0, 2) || []);
const hasMoreMedia = computed(() => (record.value?.media_items?.length || 0) > 2);

const selectedMediaItem = computed(() => {
     if (!record.value || !selectedImage.value) return null;
     return record.value.media_items?.find(m => (m.path || m.thumbnail) === selectedImage.value);
});

const hasImage = computed(() => {
     return !!(selectedImage.value || record.value?.thumbnail);
});

const isPdfSelected = computed(() => {
     const m = selectedMediaItem.value;
     if (!m) return ensureString(selectedImage.value).toLowerCase().includes('.pdf');

     const mime = (ensureString(m.mimetype) || ensureString(m.attachment?.mimetype) || '').toLowerCase();
     const ext = (ensureString(m.extension) || ensureString(m.attachment?.extension) || '').toLowerCase();
     const path = ensureString(m.path || m.thumbnail || m.attachment).toLowerCase();

     return mime.includes('pdf') || ext.includes('pdf') || path.includes('.pdf');
});

const isCurrentPdf = computed(() => {
     if (!record.value || !record.value.media_items) return false;
     const m = record.value.media_items[currentImageIndex.value];
     if (!m) return false;
     return m.mimetype === 'application/pdf' || m.extension?.toLowerCase() === 'pdf' || m.path?.toLowerCase().endsWith('.pdf');
});

/**
 * Solicita los datos detallados del registro al servidor GLAM.
 * Configura la respuesta para incluir etiquetas de metadatos y elementos multimedia.
 */
const fetchDetail = async () => {
     loading.value = true;
     try {
          const id = route.params.id;
          const res = await axios.get(`/api/glam/record/${id}`, {
               params: {
                    with_labels: 1,
                    fields: 'id,title,description,canonical_joined_metadata,joined_metadata,thumbnail,collections.id,collections.title,media_items.id,media_items.path,media_items.thumbnail,media_items.title,media_items.mimetype,media_items.extension,media_items.attachment,identifier,language,metadata'
               }
          });

          record.value = res.data.item || res.data;

          // Se establece la miniatura por defecto como imagen seleccionada inicial
          selectedImage.value = record.value.thumbnail;

     } catch (e) {
          console.error("Error crítico al recuperar el detalle del registro:", e);
     } finally {
          loading.value = false;
          // Garantiza el posicionamiento superior tras la navegación/carga
          window.scrollTo({ top: 0, behavior: 'smooth' });
     }
};

/**
 * Actualiza la referencia de la imagen principal mostrada en la sección multimedia.
 */
const setMainImage = (media) => {
     const path = media.path || media.thumbnail;
     selectedImage.value = path;
};

/**
 * Predicado para determinar si un medio específico es el que se proyecta actualmente.
 */
const isSelected = (media) => {
     const path = media.path || media.thumbnail;
     return selectedImage.value === path;
};

/**
 * Inicializa la sesión del visor inmersivo.
 * Bloquea el scroll del documento para focalizar la atención del usuario.
 */
const openLightbox = () => {
     if (!record.value) return;

     const items = record.value.media_items || [];
     // Sincronización del índice del visor con la imagen focal actual
     const idx = items.findIndex(m => (m.path || m.thumbnail) === selectedImage.value);

     currentImageIndex.value = idx !== -1 ? idx : 0;
     showLightbox.value = true;
     document.body.style.overflow = 'hidden';
};

/**
 * Finaliza la sesión del visor inmersivo y restaura la interactividad global.
 */
const closeLightbox = () => {
     showLightbox.value = false;
     isZoomed.value = false;
     document.body.style.overflow = '';
};

/**
 * Gestiona el modal de metadatos detallados.
 */
const closeMetadataModal = () => {
     showMetadataModal.value = false;
     document.body.style.overflow = '';
};

/**
 * Alterna dinámicamente el estado de zoom (acercamiento) de la imagen proyectada.
 */
const toggleZoom = () => {
     isZoomed.value = !isZoomed.value;
};

/**
 * Transición hacia el siguiente elemento multimedia de la colección.
 * Reinicia el estado de zoom para mantener la coherencia visual.
 */
const nextImage = () => {
     const total = record.value.media_items?.length || 0;
     if (total <= 1) return;
     isZoomed.value = false;
     currentImageIndex.value = (currentImageIndex.value + 1) % total;
};

/**
 * Transición hacia el elemento multimedia previo.
 */
const prevImage = () => {
     const total = record.value.media_items?.length || 0;
     if (total <= 1) return;
     isZoomed.value = false;
     currentImageIndex.value = (currentImageIndex.value - 1 + total) % total;
};

/**
 * Gestor global de teclado para facilitar la navegación rápida y el cierre mediante atajos estándar.
 */
const handleKeydown = (e) => {
     if (!showLightbox.value && !showMetadataModal.value) return;
     if (e.key === 'ArrowRight') nextImage();
     if (e.key === 'ArrowLeft') prevImage();
     if (e.key === 'Escape') {
          if (showLightbox.value) closeLightbox();
          if (showMetadataModal.value) closeMetadataModal();
     }
};

onMounted(() => {
     window.addEventListener('keydown', handleKeydown);
     fetchDetail();
});

onUnmounted(() => {
     window.removeEventListener('keydown', handleKeydown);
});

const getAuthorityLinkIcon = (key) => {
     const k = key.toLowerCase();
     if (k.includes('wikidata')) return 'WD';
     if (k.includes('wikipedia')) return 'W';
     if (k.includes('viaf')) return 'VIAF';
     if (k.includes('isni')) return 'ISNI';
     if (k.includes('gnd')) return 'GND';
     if (k.includes('congress')) return 'LC';
     return '🔗';
};

const getAuthorityLinkColor = (key) => {
     const k = key.toLowerCase();
     if (k.includes('wikidata')) return '#006699';
     if (k.includes('wikipedia')) return '#333333';
     if (k.includes('viaf')) return '#cc3333';
     return 'var(--primary-color)';
};

/**
 * Normaliza los valores de metadatos complejos priorizando las etiquetas traducidas
 * para asegurar la legibilidad en entornos multilingües o dinámicos.
 */
const formatValue = (val) => {
     if (!val) return '—';
     if (typeof val !== 'object') return val;
     return val.translated_label || val.label || val['@value'] || val.value || JSON.stringify(val);
};

const getId = (val) => {
     if (!val) return null;
     // Si recibimos un objeto de metadato, extraemos el id o @id
     let rawId = (typeof val === 'object' && !Array.isArray(val)) ? (val.id || val['@id']) : val;

     // Si aún así es un array, tomamos el primer elemento (corrige crash de Vue Router)
     if (Array.isArray(rawId)) rawId = rawId[0];

     if (!rawId) return null;
     if (typeof rawId === 'string' && rawId.includes('/')) {
          const parts = rawId.split('/');
          return parts[parts.length - 1];
     }
     return rawId;
};

const getRouteName = (v) => {
     if (!v) return null;
     const type = typeof v === 'object' ? v.type : v;
     const model = typeof v === 'object' ? (v.model || v.resource_type) : null;

     if (model === 'glam.record') return 'record-detail';
     if (model === 'glam.collection') return 'collection-detail';
     if (model === 'glam.media') return 'media-detail';

     if (type === 'record' || type === 'resource' || type === 'recurso') return 'record-detail';
     if (type === 'collection' || type === 'coleccion') return 'collection-detail';
     if (type === 'media' || type === 'medio') return 'media-detail';
     return null;
};

/**
 * Resuelve la ruta absoluta de la imagen aplicando parámetros de optimización
 * para el CDN (tamaño y calidad).
 */
const ensureString = (val) => {
     if (val === null || val === undefined) return '';
     if (typeof val === 'string') return val;
     if (Array.isArray(val)) return val.length > 0 ? ensureString(val[0]) : '';
     if (typeof val === 'object') {
          const candidate = val.translated_label || val.label || val.value || val['@id'] || val.uri || val.id || '';
          return typeof candidate === 'string' ? candidate : ensureString(candidate);
     }
     return String(val);
};

const getThumbnail = (rawPath, size = 'large') => {
     const path = ensureString(rawPath);
     if (!path) return '';
     // const domain = 'https://arcadium.cluster24.libnamic.eu';
     const sep = path.startsWith('/') || path.startsWith('http') ? '' : '/';
     // let full = path.startsWith('http') ? path : `${domain}${sep}${path}`;
     let full = path.startsWith('http') ? path : `${sep}${path}`;
     return full.replace(/size=\w+/, `size=${size}`);
};

const getOriginalUrl = (m) => {
     if (!m) return '#';
     // const domain = 'https://arcadium.cluster24.libnamic.eu';

     // 1. Prioridad: URL directa del adjunto
     const attachmentUrl = m.attachment?.url || m.url;
     if (attachmentUrl && typeof attachmentUrl === 'string') {
          // return attachmentUrl.startsWith('http') ? attachmentUrl : `${domain}${attachmentUrl}`;
          const sep = attachmentUrl.startsWith('/') || attachmentUrl.startsWith('http') ? '' : '/';
          return attachmentUrl.startsWith('http') ? attachmentUrl : `${sep}${attachmentUrl}`;
     }

     // 2. Prioridad: ID específico del adjunto
     const attachmentId = m.attachment?.id || m.attachment_id;
     if (attachmentId) {
          // return `${domain}/api/core/attachment/action_get/file?attachment_id=${attachmentId}`;
          return `/api/core/attachment/action_get/file?attachment_id=${attachmentId}`;
     }

     // 3. Fallback: ID del objeto media
     const mediaId = (typeof m === 'object') ? getId(m) : null;
     if (mediaId && mediaId !== '#') {
          // return `${domain}/api/core/attachment/action_get/file?attachment_id=${mediaId}`;
          return `/api/core/attachment/action_get/file?attachment_id=${mediaId}`;
     }

     // 4. Resolver por rutas
     const path = ensureString(m);
     if (!path || path === '#') return '#';
     const sep = path.startsWith('/') || path.startsWith('http') ? '' : '/';
     // return path.startsWith('http') ? path : `${domain}${sep}${path}`;
     return path.startsWith('http') ? path : `${sep}${path}`;
};

// Reinicia la carga de datos si el parámetro ID de la ruta cambia durante la sesión
watch(() => route.params.id, (id) => { if (id) fetchDetail(); });
</script>


<style scoped>
/**
 * Estilos específicos de la página de detalle
 */
.record-page {
     padding-bottom: var(--spacing-3xl);
}

.record-header {
     margin-bottom: 3rem;
}

@media (max-width: 768px) {
     .record-header {
          margin-bottom: 1.5rem;
     }
}


.header-nav {
     display: flex;
     flex-wrap: wrap;
     justify-content: space-between;
     align-items: center;
     padding: 1.5rem 0;
     border-bottom: 1px solid var(--border-color);
     margin-bottom: 2rem;
     gap: 1rem;
}

.btn-back {
     display: flex;
     align-items: center;
     gap: 0.5rem;
     color: var(--text-secondary);
     font-weight: 600;
     font-size: var(--fs-xs);
     text-transform: uppercase;
     letter-spacing: 0.1em;
     transition: color 0.3s;
}

.btn-back:hover {
     color: var(--primary-color);
}

.breadcrumb {
     font-size: var(--fs-xs);
     color: var(--text-muted);
     text-transform: uppercase;
     letter-spacing: 0.05em;
}

.meta-badges {
     display: flex;
     align-items: center;
     gap: 1rem;
     margin-bottom: 1.5rem;
}

@media (max-width: 768px) {
     .meta-badges {
          margin-bottom: 0.75rem;
     }
}


.collection-links {
     display: flex;
     gap: 0.5rem;
     flex-wrap: wrap;
}

.collection-link {
     font-size: 0.7rem;
     font-weight: 700;
     color: var(--primary-color);
     background: rgba(212, 175, 55, 0.08);
     padding: 0.3rem 0.8rem;
     border-radius: var(--radius-full);
     text-transform: uppercase;
     transition: all 0.3s;
}

.collection-link:hover {
     background: var(--primary-color);
     color: #fff;
}

.record-title {
     font-size: var(--fs-4xl);
     line-height: 1.1;
     max-width: 900px;
}

.content-grid {
     display: grid;
     grid-template-columns: 1fr;
     gap: 4rem;
}

@media (max-width: 768px) {
     .content-grid {
          /* minmax(0, 1fr) es vital para evitar que elementos anchos expandan el grid */
          grid-template-columns: minmax(0, 1fr);
          gap: 2.5rem;
     }
}


@media (min-width: 1024px) {
     .content-grid {
          grid-template-columns: 1fr 1fr;
          align-items: start;
     }

     .sticky-media {
          position: sticky;
          top: 120px;
     }
}

.main-image-wrapper {
     background: #fff;
     border-radius: var(--radius-lg);
     overflow: hidden;
     border: 1px solid var(--border-color);
     box-shadow: var(--shadow-md);
     aspect-ratio: 4/3;
     display: flex;
     align-items: center;
     justify-content: center;
     margin-bottom: 2rem;
     cursor: pointer;
     transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.main-image-wrapper:hover .main-img {
     transform: scale(1.05);
}

.main-media-actions {
     margin-bottom: 2rem;
}

.btn-media-view {
     width: 100%;
     display: flex;
     align-items: center;
     justify-content: center;
     gap: 0.75rem;
     padding: 1rem;
     font-size: var(--fs-xs);
     letter-spacing: 0.1em;
     background: var(--surface-card);
     border: 1px solid var(--border-color);
     color: var(--text-primary);
}

.btn-media-view:hover {
     background: var(--bg-color);
     border-color: var(--primary-color);
     color: var(--primary-color);
}

.main-img {
     width: 100%;
     height: 100%;
     object-fit: contain;
     padding: 2rem;
     transition: padding 0.3s;
}

@media (max-width: 768px) {
     .main-img {
          padding: 1rem;
     }
}


.no-img-placeholder {
     color: var(--text-muted);
     font-weight: 700;
     text-transform: uppercase;
     letter-spacing: 0.1em;
     font-size: var(--fs-md);
}

.section-label {
     font-size: var(--fs-xs);
     text-transform: uppercase;
     letter-spacing: 0.15em;
     color: var(--primary-color);
     margin-bottom: 1.5rem;
     font-weight: 800;
     display: block;
     border-bottom: 1px solid var(--border-color);
     padding-bottom: 0.5rem;
}

.gallery-scroll {
     display: flex;
     gap: 1rem;
     overflow-x: auto;
     padding: 0.5rem 0;
     margin-bottom: 2rem;
     /* En desktop por defecto envolveremos si hay espacio */
     flex-wrap: wrap;
     overflow-y: hidden;
     transition: all 0.3s;
}

@media (max-width: 1023px) {
     .gallery-scroll {
          flex-wrap: nowrap;
          /* Mostramos una barra de scroll sutil en móvil para indicar que hay más */
          scrollbar-width: thin;
          scrollbar-color: var(--primary-color) transparent;
          padding-bottom: 1rem;
     }

     .gallery-scroll::-webkit-scrollbar {
          display: block;
          height: 3px;
     }

     .gallery-scroll::-webkit-scrollbar-thumb {
          background: var(--primary-color);
          border-radius: 10px;
     }
}



.gallery-thumb {
     flex: 0 0 100px;
     height: 100px;
     border-radius: var(--radius-md);
     overflow: hidden;
     /* Usamos un borde de 2px siempre para evitar que el contenido "salte" al activarse */
     border: 2px solid var(--border-color);
     cursor: pointer;
     transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.gallery-thumb:hover {
     transform: scale(1.05);
     border-color: var(--text-muted);
     z-index: 2;
}

.gallery-thumb.active {
     border-color: var(--primary-color);
     /* Sombra interna para asegurar que sea visible sin depender del clipping del padre */
     box-shadow: 0 0 0 2px var(--primary-color), inset 0 0 0 2px rgba(255, 255, 255, 0.2);
}

.gallery-thumb img {
     width: 100%;
     height: 100%;
     object-fit: cover;
}

.btn-more-media {
     flex: 0 0 100px;
     height: 100px;
     background: var(--surface-color);
     border: 2px dashed var(--border-color);
     border-radius: var(--radius-md);
     display: flex;
     align-items: center;
     justify-content: center;
     text-align: center;
     transition: all 0.3s;
     cursor: pointer;
}

.btn-more-media:hover {
     border-color: var(--primary-color);
     background: rgba(var(--primary-color-rgb), 0.05);
     transform: scale(1.05);
}

.more-content {
     display: flex;
     flex-direction: column;
}

.btn-more-media span {
     display: block;
     font-size: 1.2rem;
     font-weight: 700;
     color: var(--primary-color);
}

.btn-more-media small {
     font-size: 0.65rem;
     text-transform: uppercase;
     font-weight: 700;
     color: var(--text-muted);
     letter-spacing: 0.05em;
}

.description-area {
     margin-bottom: 4rem;
}

.description-text {
     font-size: 1.1rem;
     line-height: 1.8;
     color: var(--text-secondary);
}

.metadata-card {
     background: var(--surface-card);
     padding: 3rem;
     border-radius: var(--radius-lg);
     border: 1px solid var(--border-color);
     box-shadow: var(--shadow-sm);
}

.metadata-header {
     display: flex;
     justify-content: space-between;
     align-items: flex-start;
     margin-bottom: 2rem;
     border-bottom: 1px solid var(--border-color);
     padding-bottom: 0.5rem;
}

.metadata-header .section-label {
     margin-bottom: 0;
     border-bottom: none;
     padding-bottom: 0;
}

.btn-info-detail {
     display: flex;
     align-items: center;
     gap: 0.5rem;
     color: var(--primary-color);
     font-size: var(--fs-xs);
     font-weight: 700;
     text-transform: uppercase;
     letter-spacing: 0.1em;
     background: rgba(var(--primary-color-rgb), 0.05);
     padding: 0.5rem 0.8rem;
     border-radius: var(--radius-md);
     transition: all 0.3s;
}

.btn-info-detail:hover {
     background: var(--primary-color);
     color: #fff;
     transform: translateY(-2px);
}

.metadata-list {
     display: grid;
     gap: 1.5rem;
}

.metadata-item {
     display: grid;
     grid-template-columns: 160px 1fr;
     gap: 2rem;
     padding-bottom: 1rem;
     border-bottom: 1px solid var(--border-color);
}

.metadata-label {
     font-size: var(--fs-xs);
     font-weight: 700;
     color: var(--text-muted);
     text-transform: uppercase;
}

.metadata-value {
     font-size: 1rem;
     color: var(--text-primary);
     line-height: 1.4;
}

@media (max-width: 768px) {
     .record-title {
          font-size: var(--fs-2xl);
     }

     .header-nav {
          padding: 1rem 0;
     }

     .breadcrumb {
          display: none;
          /* Simplificamos ocultando la ruta en móvil para ganar aire */
     }

     .meta-badges {
          flex-wrap: wrap;
          gap: 0.5rem;
     }

     .metadata-card {
          padding: 1.5rem;
          /* Reducimos el sangrado negativo para evitar conflictos con el gutter global */
          margin: 1.5rem 0;
          width: 100%;
     }

     .metadata-item {
          grid-template-columns: 1fr;
          gap: 0.4rem;
     }

     .main-image-wrapper {
          aspect-ratio: 4/3;
          min-height: 200px;
          height: auto;
          margin-bottom: 1.5rem;
          padding: 0;
          overflow: hidden;
     }

     .main-img {
          /* Usamos max-width/height para ser más defensivos con imágenes muy anchas */
          max-width: 100%;
          max-height: 100%;
          width: auto;
          height: auto;
          object-fit: contain;
          padding: 1rem;
     }



     .gallery-thumb {
          /* Usamos un ancho porcentual o calculado para que la siguiente imagen siempre asome */
          flex: 0 0 130px;
          height: 100px;
     }

     .gallery-scroll {
          /* Margen negativo para permitir que el scroll se pegue al borde de la pantalla si es necesario */
          padding-right: 2rem;
     }

     .content-grid {
          gap: 2.5rem;
     }


     .description-area {
          margin-bottom: 3rem;
     }

     .description-text {
          font-size: 1.05rem;
          line-height: 1.7;
     }

     .metadata-card {
          margin: 0;
          padding: 1.5rem;
          border-radius: var(--radius-md);
     }
}
</style>

<style>
/**
 * Estilos globales del Visor (Lightbox)
 * Se usan estilos no-scoped para permitir que el componente <Teleport> funcione correctamente sobre el <body>.
 */
.lightbox {
     position: fixed;
     inset: 0;
     background: rgba(0, 0, 0, 0.92);
     backdrop-filter: blur(12px);
     z-index: 10000;
     display: flex;
     align-items: center;
     justify-content: center;
     overflow: hidden;
     user-select: none;
}

.lightbox-viewer {
     position: relative;
     max-width: 90vw;
     max-height: 85vh;
     display: flex;
     flex-direction: column;
     align-items: center;
     transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Estado ampliado de la imagen */
.is-zoomed {
     transform: scale(1.4);
}

.lightbox-img {
     max-width: 100%;
     max-height: 80vh;
     object-fit: contain;
     cursor: zoom-in;
     transition: all 0.3s;
     box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
}

.is-zoomed .lightbox-img {
     cursor: zoom-out;
}

.lightbox-caption {
     color: #fff;
     margin-top: 1.5rem;
     font-size: var(--fs-md);
     font-weight: 500;
     text-align: center;
     text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
     opacity: 0.8;
}

/* Botón de cierre en la esquina superior */
.lightbox-close {
     position: absolute;
     top: 2rem;
     right: 2rem;
     color: #fff;
     background: rgba(255, 255, 255, 0.1);
     border: none;
     border-radius: 50%;
     width: 50px;
     height: 50px;
     display: flex;
     align-items: center;
     justify-content: center;
     cursor: pointer;
     transition: all 0.3s;
     z-index: 10010;
}

.lightbox-close:hover {
     background: rgba(255, 255, 255, 0.2);
     transform: rotate(90deg);
}

/* Controles de navegación laterales */
.lightbox-nav {
     position: absolute;
     top: 50%;
     transform: translateY(-50%);
     background: rgba(255, 255, 255, 0.05);
     color: #fff;
     border: none;
     width: 60px;
     height: 100px;
     display: flex;
     align-items: center;
     justify-content: center;
     cursor: pointer;
     transition: all 0.3s;
     z-index: 10005;
}

.lightbox-nav:hover {
     background: rgba(255, 255, 255, 0.15);
}

.lightbox-nav.prev {
     left: 0;
     border-radius: 0 10px 10px 0;
}

.lightbox-nav.next {
     right: 0;
     border-radius: 10px 0 0 10px;
}

.pdf-viewer-compact {
     width: 100%;
     height: 100%;
     border: none;
     background: #f5f5f5;
}

.main-image-wrapper.is-pdf {
     cursor: default;
     background: #eee;
}

.lightbox-pdf-viewer {
     width: 80vw;
     height: 80vh;
     border: none;
     border-radius: var(--radius-lg);
     background: #fff;
}

.lightbox-viewer.is-pdf {
     max-width: 95vw;
     max-height: 90vh;
}

/* Animaciones de entrada/salida */
.fade-enter-active,
.fade-leave-active {
     transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
     opacity: 0;
}

/* Ajustes adaptativos para dispositivos móviles */
@media (max-width: 768px) {
     .lightbox-nav {
          width: 44px;
          height: 80px;
     }

     .lightbox-close {
          top: 1rem;
          right: 1rem;
     }

     .lightbox-caption {
          font-size: var(--fs-sm);
          padding: 0 1rem;
     }

     .is-zoomed {
          transform: scale(1.1);
          /* Zoom reducido en móviles para evitar recortes excesivos */
     }
}

/* Metadata Modal Styles */
.metadata-modal-overlay {
     position: fixed;
     inset: 0;
     background: rgba(0, 0, 0, 0.7);
     backdrop-filter: blur(10px);
     z-index: 10000;
     display: flex;
     align-items: center;
     justify-content: center;
     padding: 1rem;
}

.metadata-modal {
     background: var(--surface-color);
     width: 100%;
     max-width: 800px;
     max-height: 90vh;
     border-radius: var(--radius-xl);
     box-shadow: 0 40px 100px rgba(0, 0, 0, 0.6);
     display: flex;
     flex-direction: column;
     border: 1px solid rgba(255, 255, 255, 0.1);
     animation: modalSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
     position: relative;
     overflow: hidden;
}

@keyframes modalSlideUp {
     from {
          transform: translateY(40px);
          opacity: 0;
     }

     to {
          transform: translateY(0);
          opacity: 1;
     }
}

.modal-header {
     padding: 1.5rem 2rem;
     border-bottom: 1px solid var(--border-color);
     display: flex;
     justify-content: space-between;
     align-items: center;
     flex-shrink: 0;
}

.modal-header h2 {
     margin: 0;
     font-size: var(--fs-xl);
     color: var(--text-primary);
     font-weight: 800;
}

.modal-close {
     background: var(--surface-card);
     border: 1px solid var(--border-color);
     color: var(--text-secondary);
     border-radius: var(--radius-full);
     width: 38px;
     height: 38px;
     display: flex;
     align-items: center;
     justify-content: center;
     transition: all 0.3s;
     cursor: pointer;
}

.modal-close:hover {
     background: var(--primary-color);
     color: #fff;
     border-color: var(--primary-color);
     transform: rotate(90deg);
}

.modal-body {
     padding: 2rem;
     overflow-y: auto;
     flex: 1;
     scrollbar-width: thin;
     scrollbar-color: var(--primary-color) transparent;
}

.modal-section {
     margin-bottom: 3rem;
}

.modal-subtitle {
     font-size: var(--fs-xs);
     text-transform: uppercase;
     letter-spacing: 0.15em;
     color: var(--primary-color);
     margin-bottom: 1.5rem;
     font-weight: 800;
     display: flex;
     align-items: center;
     gap: 0.8rem;
}

.modal-subtitle::after {
     content: '';
     flex: 1;
     height: 1px;
     background: var(--border-color);
}

.system-meta-grid {
     display: grid;
     grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
     gap: 1.2rem;
}

.system-meta-item {
     background: var(--surface-card);
     padding: 1.2rem;
     border-radius: var(--radius-lg);
     border: 1px solid var(--border-color);
     transition: all 0.3s;
}

.system-meta-item:hover {
     border-color: var(--primary-color);
     transform: translateY(-2px);
}

.system-meta-label {
     font-size: 10px;
     text-transform: uppercase;
     color: var(--text-muted);
     margin-bottom: 0.5rem;
     font-weight: 700;
     letter-spacing: 0.05em;
}

.system-meta-value {
     font-size: 0.95rem;
     font-weight: 600;
     color: var(--text-primary);
     word-break: break-all;
     line-height: 1.4;
}

.full-metadata-list {
     display: flex;
     flex-direction: column;
     gap: 0.5rem;
}

.full-metadata-item {
     display: grid;
     grid-template-columns: 240px 1fr;
     gap: 2rem;
     padding: 1.2rem;
     border-radius: var(--radius-md);
     transition: background 0.2s;
}

.full-metadata-item:nth-child(odd) {
     background: rgba(var(--primary-color-rgb), 0.02);
}

.full-metadata-item:hover {
     background: rgba(var(--primary-color-rgb), 0.05);
}

.full-metadata-label {
     font-size: var(--fs-xs);
     font-weight: 800;
     color: var(--text-muted);
     text-transform: uppercase;
     letter-spacing: 0.05em;
}

.full-metadata-value {
     font-size: 1rem;
     color: var(--text-primary);
     line-height: 1.6;
}

/* RESPONSIVIDAD AVANZADA */
@media (max-width: 900px) {
     .full-metadata-item {
          grid-template-columns: 180px 1fr;
          gap: 1.5rem;
     }
}

@media (max-width: 768px) {
     .metadata-modal-overlay {
          padding: 0;
     }

     .metadata-modal {
          max-height: 100vh;
          border-radius: 0;
          height: 100%;
     }

     .modal-header {
          padding: 1.2rem 1.5rem;
     }

     .modal-body {
          padding: 1.5rem;
     }

     .full-metadata-item {
          grid-template-columns: 1fr;
          gap: 0.5rem;
          padding: 1rem 0;
          border-radius: 0;
          border-bottom: 1px solid var(--border-color);
          background: transparent !important;
     }

     .full-metadata-label {
          font-size: 10px;
     }

     .modal-section {
          margin-bottom: 2rem;
     }
}

@media (max-width: 480px) {
     .system-meta-grid {
          grid-template-columns: 1fr;
     }

     .modal-header h2 {
          font-size: 1.2rem;
     }
}

.main-image-wrapper.no-click {
     cursor: default !important;
}

.pdf-main-preview {
     width: 100%;
     height: 100%;
     min-height: 400px;
     display: flex;
     flex-direction: column;
     align-items: center;
     justify-content: center;
     background: var(--surface-card);
     padding: 3rem;
     text-align: center;
}

.pdf-icon-wrapper {
     color: var(--primary-color);
     margin-bottom: 2rem;
     opacity: 0.8;
}

.pdf-actions {
     display: flex;
     flex-direction: column;
     align-items: center;
     gap: 1rem;
}

.pdf-tag {
     font-size: 0.75rem;
     font-weight: 800;
     text-transform: uppercase;
     letter-spacing: 0.1em;
     color: var(--text-muted);
}

.btn-view-doc {
     background: var(--primary-color);
     color: #fff;
     padding: 0.8rem 1.5rem;
     border-radius: var(--radius-md);
     font-size: 0.85rem;
     font-weight: 700;
     text-decoration: none;
     transition: all 0.3s;
     box-shadow: var(--shadow-sm);
}

.btn-view-doc:hover {
     transform: translateY(-2px);
     box-shadow: var(--shadow-md);
     filter: brightness(1.1);
}

.no-img-placeholder {
     width: 100%;
     height: 100%;
     min-height: 400px;
     display: flex;
     flex-direction: column;
     align-items: center;
     justify-content: center;
     background: var(--surface-card);
     color: var(--text-muted);
     gap: 1.5rem;
     font-size: var(--fs-sm);
     font-weight: 700;
     border-radius: var(--radius-lg);
     border: 2px dashed var(--border-color);
}

.no-img-icon {
     opacity: 0.4;
     color: var(--primary-color);
}

.no-img-placeholder span {
     opacity: 0.7;
     text-transform: uppercase;
     letter-spacing: 0.05em;
}

/* Authority Modal Specific Styles */
.authority-wrapper {
     display: flex;
     align-items: center;
     gap: 0.8rem;
     flex-wrap: wrap;
}

.btn-authority-info {
     display: inline-flex;
     align-items: center;
     gap: 0.4rem;
     background: rgba(var(--primary-color-rgb), 0.1);
     color: var(--primary-color);
     border: 1px solid rgba(var(--primary-color-rgb), 0.2);
     padding: 0.3rem 0.7rem;
     border-radius: var(--radius-full);
     font-size: 10px;
     font-weight: 800;
     text-transform: uppercase;
     letter-spacing: 0.05em;
     transition: all 0.3s;
     cursor: pointer;
}

.btn-authority-info:hover {
     background: var(--primary-color);
     color: #fff;
     transform: translateY(-1px);
     box-shadow: var(--shadow-sm);
}

.authority-modal-card {
     max-width: 650px !important;
}

.authority-hero {
     display: flex;
     gap: 2rem;
     margin-bottom: 2.5rem;
     padding-bottom: 2.5rem;
     border-bottom: 1px solid var(--border-color);
}

.authority-portrait {
     width: 180px;
     height: 180px;
     border-radius: var(--radius-lg);
     overflow: hidden;
     background: var(--surface-card);
     flex-shrink: 0;
     border: 1px solid var(--border-color);
}

.authority-portrait img {
     width: 100%;
     height: 100%;
     object-fit: cover;
}

.authority-portrait-placeholder {
     width: 100%;
     height: 100%;
     display: flex;
     align-items: center;
     justify-content: center;
     color: var(--text-muted);
}

.authority-main-info {
     flex: 1;
     display: flex;
     flex-direction: column;
     justify-content: center;
}

.authority-type-tag {
     display: inline-block;
     font-size: 10px;
     font-weight: 800;
     text-transform: uppercase;
     color: var(--primary-color);
     margin-bottom: 0.5rem;
     letter-spacing: 0.1em;
}

.authority-name {
     font-size: var(--fs-2xl);
     margin: 0 0 0.5rem 0;
     color: var(--text-primary);
     line-height: 1.2;
}

.authority-subtitle {
     font-size: 1rem;
     color: var(--text-secondary);
     font-style: italic;
}

.authority-desc-text {
     font-size: 0.95rem;
     line-height: 1.7;
     color: var(--text-primary);
     margin-bottom: 2rem;
}

.no-authority-details {
     display: flex;
     flex-direction: column;
     align-items: center;
     justify-content: center;
     padding: 4rem 2rem;
     text-align: center;
     background: rgba(var(--primary-color-rgb), 0.03);
     border-radius: var(--radius-lg);
     border: 1px dashed var(--border-color);
     color: var(--text-muted);
}

.no-authority-details p {
     font-size: 1rem;
     font-weight: 600;
}

.authority-links-grid {
     display: grid;
     grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
     gap: 1rem;
}

.authority-link-item {
     display: flex;
     align-items: center;
     gap: 1rem;
     padding: 0.8rem 1rem;
     background: var(--surface-card);
     border: 1px solid var(--border-color);
     border-radius: var(--radius-md);
     text-decoration: none;
     transition: all 0.3s;
}

.authority-link-item:hover {
     border-color: var(--primary-color);
     transform: translateY(-2px);
     box-shadow: var(--shadow-sm);
}

.auth-link-icon {
     width: 36px;
     height: 36px;
     border-radius: var(--radius-sm);
     display: flex;
     align-items: center;
     justify-content: center;
     font-size: 10px;
     font-weight: 900;
     color: #fff;
     flex-shrink: 0;
}

.auth-link-details {
     display: flex;
     flex-direction: column;
     min-width: 0;
}

.auth-link-label {
     font-size: 10px;
     text-transform: uppercase;
     color: var(--text-muted);
     font-weight: 700;
}

.auth-link-val {
     font-size: 0.85rem;
     color: var(--text-primary);
     font-weight: 600;
     white-space: nowrap;
     overflow: hidden;
     text-overflow: ellipsis;
}

@media (max-width: 600px) {
     .authority-hero {
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 1.5rem;
     }

     .authority-portrait {
          width: 150px;
          height: 150px;
     }
}

.metadata-actions-group {
     display: flex;
     gap: 0.5rem;
}

@media (max-width: 600px) {
     .metadata-header {
          flex-direction: column;
          align-items: stretch !important;
          gap: 1.2rem;
     }

     .metadata-actions-group {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
     }

     .btn-info-detail {
          justify-content: center;
          padding: 0.8rem 0.5rem;
          font-size: 10px;
     }
}



/* PDF Export Template Styling */
.pdf-export-template {
     display: none;
     background: #ffffff !important;
     color: #1a1a1a !important;
     padding: 40px;
     font-family: 'Inter', sans-serif;
     width: 790px;
     max-width: 100%;
     box-sizing: border-box;
}

.pdf-header {
     text-align: center;
     border-bottom: 2px solid #d4af37 !important;
     padding-bottom: 20px;
     margin-bottom: 30px;
}

.pdf-header h1 {
     font-family: 'Playfair Display', serif;
     font-size: 24pt;
     letter-spacing: 0.2em;
     margin: 0;
     color: #1a1a1a !important;
}

.pdf-header h2 {
     font-weight: 300;
     font-size: 14pt;
     color: #d4af37 !important;
     margin: 10px 0 5px 0;
}

.pdf-date {
     font-size: 9pt;
     color: #888 !important;
}

.pdf-main-content {
     display: flex;
     gap: 20px;
     margin-bottom: 30px;
}

.pdf-image-container {
     width: 40%;
}

.pdf-main-image {
     width: 100%;
     max-height: 300px;
     object-fit: contain;
     border: 1px solid #eee;
}

.pdf-title-section {
     flex: 1;
}

.pdf-title-section h3 {
     font-family: 'Playfair Display', serif;
     font-size: 20pt;
     line-height: 1.2;
     margin: 0 0 10px 0;
     color: #1a1a1a !important;
}

.pdf-id-badge {
     display: inline-block;
     font-family: monospace;
     background: rgba(212, 175, 55, 0.1) !important;
     color: #d4af37 !important;
     padding: 4px 8px;
     border-radius: 4px;
     font-size: 9pt;
     font-weight: bold;
}

.pdf-description {
     font-size: 10pt;
     line-height: 1.6;
     color: #444 !important;
     margin-bottom: 30px;
     text-align: justify;
}

.pdf-metadata-section h3 {
     font-family: 'Playfair Display', serif;
     font-size: 16pt;
     border-bottom: 1px solid #eee !important;
     padding-bottom: 5px;
     margin-bottom: 15px;
     color: #1a1a1a !important;
}

.pdf-metadata-table {
     width: 100%;
     border-collapse: collapse;
}

.pdf-metadata-table td {
     padding: 8px 12px;
     border-bottom: 1px solid #eee;
     font-size: 9pt;
}

.pdf-meta-label {
     font-weight: bold;
     width: 30%;
     color: #666;
     vertical-align: top;
     text-transform: uppercase;
}

.pdf-meta-value {
     color: #111;
     vertical-align: top;
}

.pdf-footer {
     margin-top: 40px;
     text-align: center;
     font-size: 8pt;
     color: #888;
     border-top: 1px solid #eee;
     padding-top: 20px;
}

.pdf-link {
     color: #0056b3;
     text-decoration: underline;
}
</style>
