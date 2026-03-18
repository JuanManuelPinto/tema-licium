<template>
     <!-- Pie de página con información de contacto y enlaces -->
     <footer class="app-footer">
          <div class="container footer-inner">
               <!-- Sección de la marca -->
               <div class="footer-brand-section">
                    <div class="brand">
                         <h2 class="brand-text">LICIUM</h2>
                         <span class="brand-sub">THEME</span>
                    </div>
                    <p class="footer-tagline">
                         Licium Theme.
                    </p>
               </div>

               <!-- Grid de enlaces rápidos -->
               <div class="footer-links-grid">
                    <div class="footer-group">
                         <h3 class="footer-heading">Explorar</h3>
                         <ul class="footer-list">
                              <li><router-link to="/">Inicio</router-link></li>
                              <li><router-link to="/collections">Colecciones</router-link></li>
                              <li><router-link to="/search">Buscador Avanzado</router-link></li>
                              <li><router-link to="/explore">Registros</router-link></li>
                         </ul>
                    </div>
                    <div class="footer-group">
                         <h3 class="footer-heading">Información</h3>
                         <ul class="footer-list">
                              <li><a href="#">Licium Theme</a></li>
                              <li><a href="#">Licium Theme</a></li>
                              <li><a href="#">Licium Theme</a></li>
                         </ul>
                    </div>
                    <div class="footer-group">
                         <h3 class="footer-heading">Contacto</h3>
                         <ul class="footer-list">
                              <li><a href="#">Licium Theme</a></li>
                              <li><span>Licium Theme</span></li>
                         </ul>
                    </div>
               </div>
          </div>
          <!-- Copyright -->
          <div class="footer-bottom">
               <div class="container">
                    <p>&copy; 2026 Licium Theme.</p>
               </div>
          </div>
     </footer>
</template>

<style scoped>
.app-footer {
     background-color: var(--surface-color);
     border-top: 1px solid var(--border-color);
     padding-top: 5rem;
     margin-top: 5rem;
}

.footer-inner {
     display: grid;
     grid-template-columns: 1fr;
     gap: 4rem;
     padding-bottom: 4rem;
}

@media (min-width: 900px) {
     .footer-inner {
          grid-template-columns: 1.5fr 2fr;
     }
}

.brand-text {
     font-size: 1.8rem;
     letter-spacing: 0.15em;
     font-weight: 700;
     margin: 0;
     line-height: 1;
     color: var(--text-primary);
     text-transform: uppercase;
}

.brand-sub {
     font-size: 0.8rem;
     letter-spacing: 0.3em;
     color: var(--accent-color);
     text-transform: uppercase;
}

.footer-tagline {
     color: var(--text-secondary);
     font-size: 1rem;
     margin-top: 1.5rem;
     max-width: 400px;
}

.footer-links-grid {
     display: grid;
     grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
     gap: 2.5rem;
}

.footer-heading {
     font-family: var(--font-heading);
     font-size: 1.1rem;
     text-transform: uppercase;
     color: var(--text-primary);
     margin-bottom: 1.5rem;
}

.footer-list {
     list-style: none;
     display: flex;
     flex-direction: column;
     gap: 0.8rem;
}

.footer-list a,
.footer-list span {
     color: var(--text-secondary);
     font-size: 0.95rem;
}

.footer-list a:hover {
     color: var(--accent-color);
}

.footer-bottom {
     border-top: 1px solid var(--border-color);
     padding: 2rem 0;
     text-align: center;
     font-size: 0.85rem;
     color: var(--text-muted);
}
</style>
