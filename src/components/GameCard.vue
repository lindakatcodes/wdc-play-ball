<script setup>
const props = defineProps(["game"]);
</script>

<template>
  <article>
    <p class="teams">
      <span>{{ game.awayTeam }}</span> @ <span>{{ game.homeTeam }}</span>
    </p>
    <div class="status">
      <p
        class="time"
        v-if="game.gameStatus === 'Preview' || game.gameStatus === 'Scheduled'"
      >
        Start time {{ game.time }}
      </p>
      <p class="live" v-if="game.gameStatus === 'Live'">LIVE NOW</p>
      <p class="final" v-if="game.gameStatus === 'Final'">Final</p>
    </div>
    <div
      class="score"
      v-if="game.gameStatus === 'Final' || game.gameStatus === 'Live'"
    >
      {{ game.awayScore }} - {{ game.homeScore }}
    </div>
  </article>
</template>

<style scoped>
article {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  align-items: center;
  gap: 0.75rem;
  padding: 0 0.5rem;
  border-bottom: 2px solid black;
}

.teams {
  justify-self: start;
}

.teams span {
  font-weight: 500;
}

.status {
  justify-self: center;
}

.live {
  font-weight: 600;
}

.score {
  justify-self: end;
}
</style>
