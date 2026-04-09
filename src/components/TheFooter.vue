<template>
     <!-- Pie de página global que proporciona navegación secundaria e información institucional -->
     <footer class="app-footer">
          <div class="container footer-inner">
               <!-- Sección de identidad: Logotipo y eslogan de la marca -->
               <div class="footer-brand-section">
                    <div class="brand">
                         <h2 class="brand-text">LICIUM</h2>
                         <span class="brand-sub">GADIR</span>
                    </div>
                    <p class="footer-tagline">
                         Tu portal digital para la gestión y exploración de colecciones y registros.
                    </p>
               </div>

               <!-- Malla de navegación: Agrupación de enlaces por categorías -->
               <div class="footer-links-grid">
                    <!-- Grupo de Navegación Principal -->
                    <div class="footer-group">
                         <h3 class="footer-heading">Navegación</h3>
                         <ul class="footer-list">
                              <li><router-link to="/">Inicio</router-link></li>
                              <li><router-link to="/records">Registros</router-link></li>
                              <li><router-link to="/collections">Colecciones</router-link></li>
                              <li><router-link to="/search">Buscador</router-link></li>
                         </ul>
                    </div>
                    <!-- Grupo de Información Legal/Corporativa -->
                    <div class="footer-group">
                         <h3 class="footer-heading">Legal</h3>
                         <ul class="footer-list">
                              <li><a href="#">Aviso Legal</a></li>
                              <li><a href="#">Política de Privacidad</a></li>
                              <li><a href="#">Cookies</a></li>
                         </ul>
                    </div>
                    <!-- Grupo de Soporte y Contacto -->
                    <div class="footer-group">
                         <h3 class="footer-heading">Contacto</h3>
                         <ul class="footer-list">
                              <li><a href="#">Licium Gadir</a></li>
                              <li><span>Cádiz, España</span></li>
                              <li><a href="#">Licium Gadir</a></li>
                         </ul>
                    </div>
               </div>
          </div>
          <!-- Barra inferior para avisos de derechos de autor y créditos -->
          <div class="footer-bottom">
               <div class="container">
                    <p>&copy; 2026 LICIUM GADIR.</p>
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
