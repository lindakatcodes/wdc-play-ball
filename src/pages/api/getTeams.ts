import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  const teamsResponse = await fetch(
    "https://fe1912ee-303a-4632-afe4-92071451c471.mock.pstmn.io/api/v1/teams?sportIds=1"
  ).then((res) => res.json());

  const teamsList = teamsResponse.teams.map((team) => {
    return {
      name: team.name,
      abbreviation: team.abbreviation,
    };
  });

  return new Response(
    JSON.stringify({
      teamsList,
    })
  );
};
