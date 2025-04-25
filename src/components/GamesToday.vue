<script setup>
import { useStore } from "@nanostores/vue";
import { $selectedTeams } from "../stores/teamStore";
import GameCard from "./GameCard.vue";

const props = defineProps(["teamsList"]);
const selectedTeams = useStore($selectedTeams);

const teamIds = props.teamsList
  .filter((team) => selectedTeams.value.includes(team.abbreviation))
  .map((team) => team.id);
const timezoneOffset = new Date().getTimezoneOffset() * -1;

let todaySchedule = await fetch(
  `/api/getSchedule?teamIds=${teamIds}&dateRange=today&timezoneOffset=${timezoneOffset}`
);
const gamesToday = await todaySchedule.json();
</script>

<template>
  <GameCard v-for="game in gamesToday.games" :game="game" />
</template>

<style scoped></style>
