import type { APIContext } from "astro";

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
  awayTeam: number;
  homeTeam: number;
  gameStatus: string;
  awayScore: number | null;
  homeScore: number | null;
}

type DateRange = "today" | "next7" | "previous7" | "upcoming" | "previous";

export const GET = async (context: APIContext): Promise<Response> => {
  // Get query parameters
  const url = context.url;
  const teamIds = url.searchParams.get("teamIds")?.split(",") || [];
  const dateRange = (url.searchParams.get("dateRange") || "today") as DateRange;
  // Get timezone offset in minutes for conversion
  const timezoneOffset = parseInt(
    url.searchParams.get("timezoneOffset") || "0"
  );

  // Base URL for the mock API
  const baseUrl =
    "https://fe1912ee-303a-4632-afe4-92071451c471.mock.pstmn.io/api/v1/schedule";

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
        const { localDate, localTime } = convertToLocalDateTime(
          game.gameDate,
          timezoneOffset
        );

        const currentGame = {
          date: localDate,
          time: localTime,
          awayTeam: game.teams.away.team.id,
          homeTeam: game.teams.home.team.id,
          gameStatus: game.status.abstractGameState,
          awayScore: game.teams.away.score || null,
          homeScore: game.teams.home.score || null,
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
function convertToLocalDateTime(
  dateTimeStr: string,
  timezoneOffset: number = 0
): { localDate: string; localTime: string } {
  // Parse the date and time strings from utc time to local time
  const utcDate = new Date(dateTimeStr);
  // For negative offsets we need to add minutes, for positive we subtract
  const localDate = new Date(utcDate.getTime() + timezoneOffset * -1 * 60000);

  const localDateStr = localDate.toISOString().split("T")[0];
  const hours = localDate.getHours();
  const minutes = localDate.getMinutes();
  const timeOfDay = hours >= 12 ? "PM" : "AM";
  const twelveHour = hours % 12 || 12;
  const localTimeStr = `${twelveHour}:${minutes
    .toString()
    .padStart(2, "0")} ${timeOfDay}`;

  return {
    localDate: localDateStr,
    localTime: localTimeStr,
  };
}
