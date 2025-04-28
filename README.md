# Play Ball!

An easy way to select your favorite MLB teams and see when their next game is!

Built for the Web Dev Challenge hackathon, season 2 episode 1.

This site is built with Astro, Vue, and nanostores, and gets its data from the MLB stats API. It has an option to use Postman mock servers to test your routes before  using the real thing.

## 🚀 Project Structure

This project follows a fairly typical Astro setup. Components and pages are easy to find in their related folder, and the file endings indicate which framework is building the UI for that piece.

API endpoints are within the `pages/api` folder, allowing them to act as direct endpoints you can reach from the server or client side.

The `styles/index.css` file is a base reset borrowed directly from Josh Comeau.

The nanostore logic lives in `stores/teamStore.ts`.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
