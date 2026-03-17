<template>
     <header class="main-header">
          <div class="header-container">
               <div class="logo" @click="$emit('go-home')">
                    <img src="https://via.placeholder.com/150x50?text=MI+LOGO" alt="Logo Licium" class="logo-img">
               </div>

               <nav class="main-nav">
                    <ul>
                         <li>
                              <a href="#" class="nav-link active">Registros</a>
                         </li>
                    </ul>
               </nav>
          </div>
     </header>
</template>

<script setup>
defineEmits(['go-home']);
</script>

<style lang="scss" scoped>
@use "../assets/scss/variables" as *;

.main-header {
     background: #ffffff;
     border-bottom: 1px solid #e2e8f0;
     padding: 1rem 0;
     position: sticky;
     top: 0;
     z-index: 1000;
     width: 100%;

     .header-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.5rem;
     }
}

.logo {
     cursor: pointer;
     display: flex;
     align-items: center;

     .logo-img {
          height: 40px;
          width: auto;
          display: block;
     }
}

.main-nav {
     ul {
          list-style: none;
          display: flex;
          margin: 0;
          padding: 0;

          .nav-link {
               text-decoration: none;
               color: #4a5568;
               font-weight: 600;
               font-size: 1rem;
               padding: 0.5rem 1rem;
               transition: color 0.2s ease;
               position: relative;

               &:hover {
                    color: #e67e22;
               }

               &.active {
                    color: #e67e22;

                    &::after {
                         content: '';
                         position: absolute;
                         bottom: -5px;
                         left: 1rem;
                         right: 1rem;
                         height: 2px;
                         background-color: #e67e22;
                    }
               }
          }
     }
}
</style>