<template>
     <!-- Layout Principal con Diseño de Sistema -->
     <div class="app-layout">
          <header class="app-header">
               <div class="container header-inner">
                    <!-- Logo Principal -->
                    <router-link to="/" class="brand">
                         <h1 class="brand-text">LICIUM</h1>
                         <span class="brand-sub">THEME</span>
                    </router-link>

                    <!-- Navegación Escritorio -->
                    <nav class="app-nav" :class="{ 'nav-open': isMenuOpen }">
                         <router-link to="/" class="nav-link" active-class="active">Inicio</router-link>
                         <router-link to="/explore" class="nav-link" active-class="active">Registros</router-link>
                         <router-link to="/collections" class="nav-link" active-class="active">Colecciones</router-link>
                         <router-link to="/search" class="nav-link" active-class="active">Buscador</router-link>
                    </nav>

                    <!-- Botón Hamburguesa móvil -->
                    <button class="mobile-toggle" @click="toggleMenu" :aria-expanded="isMenuOpen">
                         <div class="hamburger" :class="{ 'is-active': isMenuOpen }">
                              <span></span><span></span><span></span>
                         </div>
                    </button>
               </div>
          </header>

          <!-- Contenido Principal -->
          <main class="app-main">
               <router-view :key="$route.fullPath" />
          </main>

          <TheFooter />
     </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import TheFooter from './components/TheFooter.vue';

const isMenuOpen = ref(false);
const route = useRoute();

const toggleMenu = () => {
     isMenuOpen.value = !isMenuOpen.value;
     // Prevenir scroll en el body cuando el menú está abierto
     document.body.style.overflow = isMenuOpen.value ? 'hidden' : '';
};

// Cerrar menú al cambiar de ruta
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
     gap: 2.5rem;
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

.app-main {
     flex: 1;
     padding: var(--spacing-xl) 0;
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
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 2rem;
          transition: right 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 1500;
          padding: 2rem;
     }

     /* Background color fallback for transparent header overlap */
     .app-nav::before {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--surface-color);
          opacity: 0.8;
          z-index: -1;
     }

     .app-nav.nav-open {
          right: 0;
     }

     .nav-link {
          font-size: 1.5rem;
          letter-spacing: 0.2em;
          opacity: 0;
          transform: translateX(30px);
          transition: all 0.4s ease;
          transition-delay: 0.1s;
     }

     .app-nav.nav-open .nav-link {
          opacity: 1;
          transform: translateX(0);
     }

     /* Staggered animation for links */
     .app-nav.nav-open .nav-link:nth-child(2) { transition-delay: 0.2s; }
     .app-nav.nav-open .nav-link:nth-child(3) { transition-delay: 0.3s; }
     .app-nav.nav-open .nav-link:nth-child(4) { transition-delay: 0.4s; }

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