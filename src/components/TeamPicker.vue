<script setup>
import { useStore } from "@nanostores/vue";
import { $selectedTeams } from "../stores/teamStore";

const props = defineProps(["teamsList"]);
const selectedTeams = useStore($selectedTeams);

function addTeam(event) {
  const teamValue = event.target.value;
  if (teamValue === "") return;

  // Check if the team is already in the array
  const teamIndex = selectedTeams.value.indexOf(teamValue);

  if (teamIndex !== -1) {
    // Team exists, so remove it
    const updatedTeams = [...selectedTeams.value];
    updatedTeams.splice(teamIndex, 1);
    $selectedTeams.set(updatedTeams);
  } else {
    // Team doesn't exist, so add it
    $selectedTeams.set([...selectedTeams.value, teamValue]);
  }
}
</script>

<template>
  <div>
    <label for="team-picker">Pick your teams:</label>
    <select @change="addTeam" id="team-picker" name="team-picker">
      <option value="">Select a team</option>
      <template v-for="team in props.teamsList">
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
    border-bottom: 4px solid black;
  }

  label {
    text-align: center;
    font-size: 1.125rem;
    font-weight: 500;
  }

  select {
    margin: 0 auto;
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
