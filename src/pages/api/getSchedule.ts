import type { APIContext } from "astro";
import { parseJSON } from "date-fns";
import { BASE_URL } from "astro:env/server";

type DateRange = "today" | "next7" | "previous7" | "upcoming" | "previous";

interface Game {
  gameDate: string;
  status: {
    abstractGameState: string;
  };
  teams: {
    away: {
      team: {
        id: number;
      };
      score?: number;
    };
    home: {
      team: {
        id: number;
      };
      score?: number;
    };
  };
}

interface GameDate {
  games: Game[];
}

interface ScheduleData {
  dates: GameDate[];
}

interface TransformedGame {
  date: string;
  time: string;
  awayTeam: string;
  homeTeam: string;
  gameStatus: string;
  awayScore: number | null;
  homeScore: number | null;
}

export const GET = async (context: APIContext): Promise<Response> => {
  // Get query parameters
  const url = context.url;
  const teamIds = url.searchParams.get("teamIds")?.split(",") || [];
  const dateRange = (url.searchParams.get("dateRange") || "today") as DateRange;

  const teamsResponse = await fetch(new URL("/api/getTeams", url.origin)).then(
    (res) => {
      if (!res.ok) {
        throw new Error(`Failed to fetch teams: ${res.status}`);
      }
      return res.json();
    }
  );

  // Create a mapping of team IDs to abbreviations
  const teamMap = new Map<number, string>();
  teamsResponse.teamsList.forEach(
    (team: { id: number; abbreviation: string }) => {
      teamMap.set(team.id, team.abbreviation);
    }
  );

  const baseUrl = `${BASE_URL}/api/v1/schedule`;

  // Calculate date parameters based on the requested range
  const today = new Date();
  let startDate: Date | null = null;
  let endDate: Date | null = null;

  switch (dateRange) {
    case "today":
      startDate = today;
      endDate = today;
      break;
    case "next7":
      startDate = new Date(today);
      startDate.setDate(today.getDate() + 1);
      endDate = new Date(today);
      endDate.setDate(today.getDate() + 7);
      break;
    case "previous7":
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 7);
      endDate = new Date(today);
      endDate.setDate(today.getDate() - 1);
      break;
    case "upcoming":
      startDate = today;
      endDate = new Date("2025-09-28");
      break;
    case "previous":
      startDate = new Date("2025-03-27");
      endDate = today;
      break;
  }

  // Construct the API URL with the appropriate query parameters
  let apiUrl = baseUrl;

  // Add query parameters
  const queryParams = new URLSearchParams();

  // Add team IDs if provided
  if (teamIds.length > 0) {
    queryParams.append("teamIds", teamIds.join(","));
  }

  // Add date parameters if set
  if (startDate) {
    queryParams.append("startDate", formatDate(startDate));
  }
  if (endDate) {
    queryParams.append("endDate", formatDate(endDate));
  }

  // Add sport ID (assuming it's required like in the getTeams endpoint)
  queryParams.append("sportIds", "1");

  // Append query parameters to the URL
  if (queryParams.toString()) {
    apiUrl += `?${queryParams.toString()}`;
  }

  try {
    const scheduleData: ScheduleData = await fetch(apiUrl, {
      headers: { "X-Schedule-Type": dateRange },
    }).then((res) => {
      if (!res.ok) {
        throw new Error(`API responded with status: ${res.status}`);
      }
      return res.json();
    });

    const games = scheduleData.dates.flatMap((gameDate) => {
      // we're mapping over each gameDate, which is an array of objects
      // each date will have an array of games objects
      // we want to return a flat list of each game from all the dates with relevant info
      // info: date, time, home team, away team, score, current status
      // status can be Final, Preview, Scheduled, Live
      const totalGames: TransformedGame[] = [];

      gameDate.games.forEach((game: Game) => {
        // Convert date and time from UTC to local time
        const { localDate, localTime } = convertToLocalDateTime(game.gameDate);

        const currentGame = {
          date: localDate,
          time: localTime,
          awayTeam: teamMap.get(game.teams.away.team.id) || "",
          homeTeam: teamMap.get(game.teams.home.team.id) || "",
          gameStatus: game.status.abstractGameState,
          awayScore:
            game.teams.away.score != null && game.teams.away.score >= 0
              ? game.teams.away.score
              : null,
          homeScore:
            game.teams.home.score != null && game.teams.home.score >= 0
              ? game.teams.home.score
              : null,
        };

        totalGames.push(currentGame);
      });

      return totalGames;
    });

    return new Response(
      JSON.stringify({
        games,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching schedule:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to fetch schedule data",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};

// Helper function to format date as YYYY-MM-DD
function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

// Helper function to convert UTC date and time to local date and time
function convertToLocalDateTime(dateTimeStr: string): {
  localDate: string;
  localTime: string;
} {
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
