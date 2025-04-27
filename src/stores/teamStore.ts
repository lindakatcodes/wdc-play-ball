import { atom, computed, task } from "nanostores";

// Check if localStorage is available (to avoid SSR issues)
const isLocalStorageAvailable =
  typeof window !== "undefined" && window.localStorage;

// Get stored teams from localStorage or default to empty array
const getStoredTeams = () => {
  if (isLocalStorageAvailable) {
    const storedTeams = localStorage.getItem("selectedTeams");
    return storedTeams ? JSON.parse(storedTeams) : [];
  }
  return [];
};

// Create the atom with initial value from localStorage
export const $selectedTeams = atom(getStoredTeams());

// Subscribe to changes and update localStorage
if (isLocalStorageAvailable) {
  $selectedTeams.listen((teams) => {
    localStorage.setItem("selectedTeams", JSON.stringify(teams));
  });
}
