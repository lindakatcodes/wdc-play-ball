<script setup>
const props = defineProps(["game"]);
</script>

<template>
  <div>
    <p>
      <span>{{ game.awayTeam }}</span> @ <span>{{ game.homeTeam }}</span>
    </p>
    <p>Starts at {{ game.time }}</p>
    <p v-if="game.gameStatus === 'Live'">LIVE NOW</p>
    <p v-if="game.gameStatus === 'Final'">Final</p>
     <div v-if="game.gameStatus === 'Final' || game.gameStatus === 'Live'">
      {{ game.awayScore }} - {{ game.homeScore }}
     </div>
  </div>
</template>

<style scoped>
div {
  border: 2px solid rebeccapurple;
  margin-bottom: 1rem;
}
</style>
