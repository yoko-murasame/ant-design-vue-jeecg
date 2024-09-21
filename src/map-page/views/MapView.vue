<template>
  <div class="home">
    <one-map />
  </div>
</template>

<script>
import OneMap from '@/map-page/components/onemap/OneMap.vue'
import Vue from 'vue'

export default {
  name: 'MapView',
  components: { OneMap },
  data() {
    return {
      DataArray: {
        MapShow: false
      }
    }
  },
  mounted() {
    window.indexVue = Vue;
    this.eventRegsiter();
  },
  methods: {
    eventRegsiter() {
      const that = this;
      this.$bus.$on('SwitchMap',(isShow)=>{
        that.DataArray.MapShow = isShow
      })
    }
  }
}
</script>
<style scoped>
.home {
  height: 100%;
  width: 100%;
}
</style>
