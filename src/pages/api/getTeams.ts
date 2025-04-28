import type { APIRoute } from "astro";
import { BASE_URL, MOCK_URL } from "astro:env/server";

interface TeamResponse {
  name: string;
  abbreviation: string;
  id: string;
}

interface ApiTeamResponse {
  teams: TeamResponse[];
}

export const GET: APIRoute = async () => {
  const teamsResponse = await fetch(`${BASE_URL}/api/v1/teams?sportIds=1`).then(
    (res) => res.json()
  );

  const teamsList: TeamResponse[] = (
    teamsResponse as ApiTeamResponse
  ).teams.map((team) => {
    return {
      name: team.name,
      abbreviation: team.abbreviation,
      id: team.id,
    };
  });

  return new Response(
    JSON.stringify({
      teamsList,
    })
  );
};
