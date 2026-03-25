<template>
     <!-- Layout base con arquitectura de diseño LICIUM -->
     <div class="app-layout">
          <header class="app-header">
               <div class="container header-inner">
                    <!-- Marca y logotipo con enlace a la página de inicio -->
                    <router-link to="/" class="brand">
                         <h1 class="brand-text">LICIUM</h1>
                         <span class="brand-sub">GADIR</span>
                    </router-link>

                    <!-- Navegación principal para escritorio y móvil -->
                    <nav class="app-nav" :class="{ 'nav-open': isMenuOpen }">
                         <!-- Branding exclusivo para el menú móvil -->
                         <div class="nav-brand-mobile">
                              <span class="brand-text">LICIUM</span>
                              <span class="brand-sub">GADIR</span>
                         </div>

                         <!-- Enlaces de navegación -->
                         <div class="nav-links-wrapper">
                              <router-link to="/" class="nav-link" active-class="active">Inicio</router-link>
                              <router-link to="/explore" class="nav-link" active-class="active">Registros</router-link>
                              <router-link to="/collections" class="nav-link"
                                   active-class="active">Colecciones</router-link>
                              <router-link to="/search" class="nav-link" active-class="active">Buscador</router-link>
                         </div>

                         <!-- Pie de página exclusivo para el menú móvil -->
                         <div class="nav-footer-mobile">
                              <p class="nav-motto">Patrimonio Histórico Digital</p>
                              <div class="nav-decoration"></div>
                         </div>
                    </nav>

                    <!-- Acciones del encabezado: Selector de tema y menú móvil -->
                    <div class="header-actions">
                         <!-- Control para alternar entre modo claro y modo oscuro -->
                         <button class="theme-toggle" @click="toggleTheme"
                              :title="isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'">
                              <!-- Icono de sol para modo claro -->
                              <svg v-if="isDark" width="20" height="20" viewBox="0 0 24 24" fill="none"
                                   stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                   stroke-linejoin="round">
                                   <circle cx="12" cy="12" r="5" />
                                   <line x1="12" y1="1" x2="12" y2="3" />
                                   <line x1="12" y1="21" x2="12" y2="23" />
                                   <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                                   <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                                   <line x1="1" y1="12" x2="3" y2="12" />
                                   <line x1="21" y1="12" x2="23" y2="12" />
                                   <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                                   <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                              </svg>
                              <!-- Icono de luna para modo oscuro -->
                              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                   stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                   <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                              </svg>
                         </button>

                         <!-- Interruptor visual para el menú hamburguesa en dispositivos móviles -->
                         <button class="mobile-toggle" @click="toggleMenu" :aria-expanded="isMenuOpen">
                              <div class="hamburger" :class="{ 'is-active': isMenuOpen }">
                                   <span></span><span></span><span></span>
                              </div>
                         </button>
                    </div>
               </div>
          </header>

          <!-- Área central de visualización de rutas dinámicas -->
          <main class="app-main">
               <router-view :key="$route.fullPath" />
          </main>

          <!-- Componente de pie de página global -->
          <TheFooter />
     </div>
</template>

<script setup>
/**
 * Lógica principal del layout de la aplicación.
 * 
 * Este componente gestiona funciones transversales como el cambio de tema,
 * la navegación móvil y la consistencia del scroll entre rutas.
 */

import { ref, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import TheFooter from './components/TheFooter.vue';

// Estado reactivo para el control del menú móvil
const isMenuOpen = ref(false);
// Estado reactivo para la gestión visual del tema
const isDark = ref(false);
const route = useRoute();

/**
 * Alterna la visibilidad del menú de navegación móvil.
 * Bloquea el scroll del cuerpo para mejorar la experiencia UX cuando el menú está abierto.
 */
const toggleMenu = () => {
     isMenuOpen.value = !isMenuOpen.value;
     document.body.style.overflow = isMenuOpen.value ? 'hidden' : '';
};

/**
 * Gestiona el cambio de tema visual y persiste la elección en el almacenamiento local.
 */
const toggleTheme = () => {
     isDark.value = !isDark.value;
     const theme = isDark.value ? 'dark' : 'light';
     document.documentElement.setAttribute('data-theme', theme);
     localStorage.setItem('licium-theme', theme);
};

onMounted(() => {
     // Inicialización de la configuración del tema visual
     const savedTheme = localStorage.getItem('licium-theme');
     if (savedTheme) {
          isDark.value = savedTheme === 'dark';
     } else {
          // Utiliza la preferencia del sistema operativo si no hay una elección previa guardada
          isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
     }
     document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light');
});

// Resetea el estado del menú y el scroll al navegar entre diferentes rutas de la aplicación
watch(() => route.path, () => {
     isMenuOpen.value = false;
     document.body.style.overflow = '';
});
</script>


<style scoped>
.app-layout {
     display: flex;
     flex-direction: column;
     min-height: 100vh;
}

.app-header {
     height: var(--header-height);
     background-color: var(--surface-color);
     border-bottom: 1px solid var(--border-color);
     position: sticky;
     top: 0;
     z-index: 1000;
     display: flex;
     align-items: center;
}

.header-inner {
     display: flex;
     justify-content: space-between;
     align-items: center;
     width: 100%;
}

.brand-text {
     font-size: 1.5rem;
     letter-spacing: 0.15em;
     margin: 0;
     color: var(--text-primary);
}

.brand-sub {
     font-size: 0.65rem;
     letter-spacing: 0.4em;
     color: var(--primary-color);
     display: block;
     margin-top: -2px;
}

.app-nav {
     display: flex;
     align-items: center;
}

.nav-links-wrapper {
     display: flex;
     gap: 2.5rem;
}

.nav-brand-mobile,
.nav-footer-mobile {
     display: none;
}

.header-actions {
     display: flex;
     align-items: center;
     gap: 1.5rem;
}

.theme-toggle {
     display: flex;
     align-items: center;
     justify-content: center;
     width: 40px;
     height: 40px;
     border-radius: var(--radius-full);
     color: var(--text-primary);
     background: var(--bg-color);
     border: 1px solid var(--border-color);
     transition: all var(--transition-normal);
}

.theme-toggle:hover {
     border-color: var(--primary-color);
     color: var(--primary-color);
     background: var(--surface-color);
}

.nav-link {
     font-size: var(--fs-sm);
     font-weight: 600;
     text-transform: uppercase;
     letter-spacing: 0.1em;
     color: var(--text-secondary);
     position: relative;
     padding: 0.5rem 0;
}

.nav-link:hover,
.nav-link.active {
     color: var(--text-primary);
}

.nav-link::after {
     content: '';
     position: absolute;
     bottom: 0;
     left: 0;
     width: 0;
     height: 2px;
     background-color: var(--primary-color);
     transition: width var(--transition-normal);
}

.nav-link.active::after {
     width: 100%;
}

.app-header,
.app-main {
     /* Asegura una separación mínima con los bordes de la pantalla en todo momento */
     padding-left: clamp(0.75rem, 5vw, 3rem);
     padding-right: clamp(0.75rem, 5vw, 3rem);
}

.app-main {
     flex: 1;
     padding-top: var(--spacing-3xl);
     padding-bottom: var(--spacing-3xl);
}

/* En móvil añadimos un pequeño gutter vertical extra */
@media (max-width: 768px) {
     .app-main {
          padding-top: var(--spacing-xl);
          padding-bottom: var(--spacing-xl);
     }
}

/* MENÚ MÓVIL */
.mobile-toggle {
     display: none;
     background: none;
     border: none;
     cursor: pointer;
     padding: 0.5rem;
     z-index: 2000;
}

.hamburger {
     width: 30px;
     height: 20px;
     position: relative;
     display: flex;
     flex-direction: column;
     justify-content: space-between;
}

.hamburger span {
     display: block;
     width: 100%;
     height: 2px;
     background: var(--text-primary);
     transition: var(--transition-normal);
     border-radius: 2px;
}

@media (max-width: 900px) {
     .mobile-toggle {
          display: block;
     }

     .app-nav {
          position: fixed;
          top: 0;
          right: -100%;
          width: 100%;
          height: 100vh;
          background: var(--surface-color);
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          padding: 8rem 2rem 4rem 2rem;
          transition: right 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 1500;
          overflow: hidden;
     }

     .app-nav::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg,
                    var(--surface-color) 0%,
                    rgba(var(--primary-color-rgb), 0.03) 100%);
          z-index: -1;
     }

     .app-nav.nav-open {
          right: 0;
     }

     .nav-brand-mobile {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          border-bottom: 1px solid var(--border-color);
          width: 100%;
          max-width: 200px;
          padding-bottom: 2rem;
          opacity: 0;
          transform: translateY(-20px);
          transition: all 0.6s ease 0.2s;
     }

     .nav-open .nav-brand-mobile {
          opacity: 1;
          transform: translateY(0);
     }

     .nav-brand-mobile .brand-text {
          font-family: var(--font-heading);
          font-size: 2.5rem;
          letter-spacing: 0.25em;
          color: var(--primary-color);
          margin-bottom: 0.5rem;
          line-height: 1;
     }

     .nav-brand-mobile .brand-sub {
          display: block;
          font-size: 0.85rem;
          letter-spacing: 0.6em;
          color: var(--text-secondary);
          text-transform: uppercase;
     }

     .nav-links-wrapper {
          flex-direction: column;
          align-items: center;
          gap: 2.5rem;
          flex: 1;
          justify-content: center;
          width: 100%;
     }

     .nav-footer-mobile {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.6s ease 0.4s;
     }

     .nav-open .nav-footer-mobile {
          opacity: 1;
          transform: translateY(0);
     }

     .nav-motto {
          font-family: var(--font-heading);
          font-size: 1.125rem;
          font-style: italic;
          color: var(--text-muted);
          margin-bottom: 1.5rem;
     }

     .nav-decoration {
          width: 40px;
          height: 1px;
          background: var(--primary-color);
          opacity: 0.5;
     }

     .nav-link {
          font-size: 1.5rem;
          font-family: var(--font-heading);
          font-weight: 500;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          padding: 0.5rem 0;
          color: var(--text-secondary);
     }

     .app-nav.nav-open .nav-link {
          opacity: 1;
          transform: translateY(0);
     }

     .nav-link.active {
          color: var(--primary-color);
     }

     .nav-link:hover {
          color: var(--primary-color);
          transform: scale(1.1);
     }

     /* Animación escalonada para los enlaces */
     .app-nav.nav-open .nav-link:nth-child(1) {
          transition-delay: 0.3s;
     }

     .app-nav.nav-open .nav-link:nth-child(2) {
          transition-delay: 0.4s;
     }

     .app-nav.nav-open .nav-link:nth-child(3) {
          transition-delay: 0.5s;
     }

     .app-nav.nav-open .nav-link:nth-child(4) {
          transition-delay: 0.6s;
     }

     .hamburger.is-active span:nth-child(1) {
          transform: translateY(9px) rotate(45deg);
     }

     .hamburger.is-active span:nth-child(2) {
          opacity: 0;
          transform: translateX(-20px);
     }

     .hamburger.is-active span:nth-child(3) {
          transform: translateY(-9px) rotate(-45deg);
     }
}
</style>