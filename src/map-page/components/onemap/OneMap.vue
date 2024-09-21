<template>
  <div>
    <mapboxgl/>
  </div>
</template>
<script>
import Mapboxgl from '@/map-page/components/common/Mapboxgl/Mapboxgl.vue'

export default {
  name: 'OneMap',
  props: ['isShow'],
  components: {
    Mapboxgl
  }
}
</script>
<style scoped>
</style>
