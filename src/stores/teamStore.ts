import { atom, computed, onMount, task } from "nanostores";

interface Team {
  id: number;
  abbreviation: string;
  name?: string;
}

export const $isLoading = atom(false);
export const $error = atom<string | null>(null);

// Check if localStorage is available (to avoid SSR issues)
const isLocalStorageAvailable =
  typeof window !== "undefined" && window.localStorage;

// Get stored teams from localStorage or default to empty array
const getStoredTeams = () => {
  if (isLocalStorageAvailable) {
    try {
      const storedTeams = localStorage.getItem("selectedTeams");
      return storedTeams ? JSON.parse(storedTeams) : [];
    } catch (error) {
      console.error("Error parsing stored teams:", error);
      return [];
    }
  }
  return [];
};

export const $selectedTeams = atom<string[]>(getStoredTeams());

if (isLocalStorageAvailable) {
  $selectedTeams.listen((teams) => {
    try {
      localStorage.setItem("selectedTeams", JSON.stringify(teams));
    } catch (error) {
      console.error("Error storing teams:", error);
    }
  });
}

export const $teamsList = atom<Team[]>([]);

if (typeof window !== "undefined") {
  onMount($teamsList, () => {
    task(async () => {
      try {
        $isLoading.set(true);
        $error.set(null);

        const response = await fetch("/api/getTeams");

        if (!response.ok) {
          throw new Error(`Failed to fetch teams: ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data.teamsList)) {
          throw new Error("Invalid teams data format");
        }

        const sortedTeams: Team[] = data.teamsList.sort((a: Team, b: Team) =>
          (a.name ?? "").localeCompare(b.name ?? "")
        );

        $teamsList.set(sortedTeams || []);
      } catch (error) {
        console.error("Error fetching teams:", error);
        $error.set(error instanceof Error ? error.message : "Unknown error");
      } finally {
        $isLoading.set(false);
      }
    });
  });
}

// Add a computed value for checking if teams are available
export const $hasTeams = computed($teamsList, (teams) => teams.length > 0);

export const $teamIds = computed(
  [$teamsList, $selectedTeams],
  (teamsList, selectedTeams) => {
    return teamsList
      .filter((team) => selectedTeams.includes(team.abbreviation))
      .map((team) => team.id);
  }
);

export const addTeam = (teamAbbr: string) => {
  if (!teamAbbr) return;

  const currentTeams = $selectedTeams.get();
  const teamIndex = currentTeams.indexOf(teamAbbr);

  if (teamIndex !== -1) {
    // Team exists, so remove it
    const updatedTeams = [...currentTeams];
    updatedTeams.splice(teamIndex, 1);
    $selectedTeams.set(updatedTeams);
  } else {
    // Team doesn't exist, so add it
    $selectedTeams.set([...currentTeams, teamAbbr]);
  }
};
