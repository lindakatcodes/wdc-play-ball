<script setup>
import { ref, computed, watch } from "vue";
import { useStore } from "@nanostores/vue";
import { $selectedTeams, $teamsList, $teamIds } from "../stores/teamStore";
import GameCard from "./GameCard.vue";

const props = defineProps(["range"]);
const selectedTeams = useStore($selectedTeams);
const teamsList = useStore($teamsList);
const teamIds = useStore($teamIds);
const gamesList = ref({ games: [] });

const gamesByDate = computed(() => {
  if (!gamesList.value.games || gamesList.value.games.length === 0) {
    return {};
  }

  const groupedGames = {};

  gamesList.value.games.forEach((game) => {
    const dateKey = game.date;
    if (!groupedGames[dateKey]) {
      groupedGames[dateKey] = [];
    }
    groupedGames[dateKey].push(game);
  });

  return groupedGames;
});

// Function to fetch schedule data
async function fetchSchedule() {
  if (teamIds.length === 0) {
    gamesList.value = { games: [] };
    return;
  }

  try {
    const schedule = await fetch(
      `/api/getSchedule?dateRange=${props.range}`
    );
    gamesList.value = await schedule.json();
  } catch (error) {
    console.error("Error fetching schedule:", error);
  }
}

// Initial fetch
await fetchSchedule();

// Watch for changes in teamIds and refetch data
watch(
  teamIds,
  () => {
    fetchSchedule();
  },
  { deep: true }
);
</script>

<template>
  <section>
    <div v-if="Object.keys(gamesByDate).length > 0">
      <div v-for="(games, date) in gamesByDate" :key="date" class="date-group">
        <p class="date">{{ date }}</p>
        <GameCard v-for="game in games" :key="game.id" :game="game" />
      </div>
    </div>
    <p class="empty" v-else>No games in the next 7 days</p>
  </section>
</template>

<style scoped>
.date-group {
  margin-bottom: 1rem;
}

.date {
  font-weight: 600;
  font-size: 1.25rem;
  padding-left: 0.25rem;
}

.empty {
  text-align: center;
  font-weight: 600;
  font-size: 1.1rem;
}
</style>
