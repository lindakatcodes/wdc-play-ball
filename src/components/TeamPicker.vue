<script setup>
import { useStore } from "@nanostores/vue";
import { $selectedTeams, $teamsList, addTeam } from "../stores/teamStore";

const teamsList = useStore($teamsList);
const selectedTeams = useStore($selectedTeams);
</script>

<template>
  <div>
    <label for="team-picker">Pick your teams:</label>
    <select
      @change="addTeam($event.target.value)"
      id="team-picker"
      name="team-picker"
    >
      <option value="">Select a team</option>
      <template v-for="team in teamsList">
        <option :value="team.abbreviation">
          {{ team.name }}
        </option>
      </template>
    </select>
    <ul>
      <li v-for="team in selectedTeams">
        {{ team }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
div {
  display: flex;
  flex-direction: column;
  padding: 0.5rem 2rem;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

label {
  text-align: center;
  font-size: 1.125rem;
  font-weight: 500;
}

select {
  margin: 0 auto;
  padding: 0.25rem;
  border: 2px solid var(--blue);
}

ul {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  list-style-type: none;
  padding-inline-start: 0;
}

li {
  font-weight: 600;
  padding: 0.125rem 0.375rem;
  border: 2px solid;
  border-radius: 3px;
  border-color: var(--red);
}

li:nth-child(even) {
  border-color: var(--blue);
}
</style>
