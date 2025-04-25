<script setup>
import { useStore } from "@nanostores/vue";
import { $selectedTeams } from "../stores/teamStore";
import GameCard from "./GameCard.vue";
import { ref, computed, watch } from "vue";

const props = defineProps(["teamsList"]);
const selectedTeams = useStore($selectedTeams);
const gamesToday = ref({ games: [] });

const teamIds = computed(() => {
  return props.teamsList
    .filter((team) => selectedTeams.value.includes(team.abbreviation))
    .map((team) => team.id);
});

// Function to fetch schedule data
async function fetchSchedule() {
  if (teamIds.value.length === 0) {
    gamesToday.value = { games: [] };
    return;
  }
  
  try {
    const todaySchedule = await fetch(
      `/api/getSchedule?teamIds=${teamIds.value}&dateRange=today`
    );
    gamesToday.value = await todaySchedule.json();
  } catch (error) {
    console.error("Error fetching schedule:", error);
  }
}

// Initial fetch
await fetchSchedule();

// Watch for changes in teamIds and refetch data
watch(teamIds, () => {
  fetchSchedule();
}, { deep: true });

</script>

<template>
  <section>
  <p v-if="gamesToday.games && gamesToday.games.length > 0">{{ gamesToday.games[0].date }}</p>
  <p v-else>No games scheduled for today</p>
  <GameCard v-for="game in gamesToday.games" :key="game.id" :game="game" />
  </section>
</template>

<style scoped></style>
