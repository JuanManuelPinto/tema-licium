<template>
     <div class="record-card" v-if="record">
          <div class="image-container">
               <img :src="record.thumbnail || 'https://via.placeholder.com/300x200'"
                    :alt="record.title || 'Imagen de registro'">
          </div>
          <div class="info">
               <h3>{{ record.title || 'Sin título' }}</h3>
          </div>
     </div>
</template>

<script setup>
defineProps(['record']);
</script>

<style lang="scss" scoped>
@use "../assets/scss/variables" as *;

.record-card {
     background: white;
     border-radius: $border-radius;
     overflow: hidden;
     box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
     transition: $transition;
     cursor: pointer;

     &:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
     }

     .image-container {
          height: 200px;

          img {
               width: 100%;
               height: 100%;
               object-fit: cover;
          }
     }

     .info {
          padding: 1rem;

          h3 {
               font-size: 1.1rem;
               margin: 0.5rem 0;
               color: $primary-color;
               display: -webkit-box;
               -webkit-line-clamp: 2;
               -webkit-box-orient: vertical;
               overflow: hidden;
          }
     }
}
</style>