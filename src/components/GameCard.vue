<script setup>
const props = defineProps(["game"]);
</script>

<template>
  <div>
    {{ props.game }}
  </div>
</template>

<style scoped>
div {
  border: 2px solid rebeccapurple;
  margin-bottom: 1rem;
}
</style>
