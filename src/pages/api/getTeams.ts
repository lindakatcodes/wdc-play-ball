import type { APIRoute } from "astro";

interface TeamResponse {
  name: string;
  abbreviation: string;
  id: string;
}

interface ApiTeamResponse {
  teams: TeamResponse[];
}

export const GET: APIRoute = async () => {
  const teamsResponse = await fetch(
    "https://fe1912ee-303a-4632-afe4-92071451c471.mock.pstmn.io/api/v1/teams?sportIds=1"
  ).then((res) => res.json());

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
