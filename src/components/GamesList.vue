<script setup>
import { useStore } from "@nanostores/vue";
import { parseJSON } from "date-fns";
import { computed, ref, watch } from "vue";
import { $hasTeams, $teamIds } from "../stores/teamStore";
import GameCard from "./GameCard.vue";

const props = defineProps({
  range: String,
  reverseOrder: Boolean
});
const teamIds = useStore($teamIds);
const hasTeams = useStore($hasTeams);
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

  // If reverseOrder is true, sort dates in reverse chronological order
  if (props.reverseOrder) {
    const sortedGroupedGames = {};
    Object.keys(groupedGames)
      .sort((a, b) => new Date(b) - new Date(a))
      .forEach(date => {
        sortedGroupedGames[date] = groupedGames[date];
      });
    return sortedGroupedGames;
  }

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
      `/api/getSchedule?dateRange=${props.range}&teamIds=${teamIds.value.join(',')}`
    );
    // times have to be converted here on the client, so it uses the client's local time
    const scheduleData = await schedule.json();
    const gamesWithConvertedTimes = scheduleData.games.map(game => {
      const { localDate, localTime } = convertToLocalDateTime(game.dateTime);
      return {
      ...game,
      date: localDate,
      time: localTime
      };
    });
    gamesList.value = { games: gamesWithConvertedTimes };
  } catch (error) {
    console.error("Error fetching schedule:", error);
  }
}

function convertToLocalDateTime(dateTimeStr) {
  const dateObject = parseJSON(dateTimeStr);
  const localDateStr = dateObject.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const localTimeStr = dateObject.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return {
    localDate: localDateStr,
    localTime: localTimeStr,
  };
}

// Initial fetch needs to be in a watch to only be called once the hasTeams value is true, so we only make the call when we actually have the teams data which is used to compute our teamIds required by fetchSchedule
watch(hasTeams, (hasTeams) => {
  if (hasTeams) {
    fetchSchedule();
  }
}, { immediate: true });

// Watch for changes in teamIds and refetch data
watch(
  teamIds,
  () => {
    fetchSchedule();
  }
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
