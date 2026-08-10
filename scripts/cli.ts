// Single entry point for every content-management tool in scripts/ --
// run via `npm run content`. Presents a menu and delegates to whichever
// tool's own main() the human picks, rather than having to remember
// separate command names. Each tool still works standalone too
// (npm run now / new-post / new-project) -- this is purely additive.
//
// Adding a new tool later: write it the same way as the others (export
// an async main(), guard direct execution with the
// `process.argv[1] === fileURLToPath(import.meta.url)` check), then add
// one line to TASKS below.
import { fileURLToPath } from 'node:url';
import { select } from '@inquirer/prompts';
import { main as runNow } from './now-cli';
import { main as runNewPost } from './new-post-cli';
import { main as runNewProject } from './new-project-cli';

const TASKS = [
  { name: 'Update the Now page', value: runNow },
  { name: 'Scaffold a new blog post', value: runNewPost },
  { name: 'Scaffold a new project', value: runNewProject },
];

async function main() {
  const task = await select({
    message: 'What do you want to do?',
    choices: TASKS.map(({ name, value }) => ({ name, value })),
  });
  console.log();
  await task();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
