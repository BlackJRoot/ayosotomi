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
import { main as runEditPost } from './edit-post-cli';
import { main as runEditProject } from './edit-project-cli';
import { runCli } from './lib/quit';

const TASKS = [
  { name: 'Update the Now page', value: runNow },
  { name: 'Scaffold a new blog post', value: runNewPost },
  { name: 'Scaffold a new project', value: runNewProject },
  { name: 'Edit an existing blog post', value: runEditPost },
  { name: 'Edit an existing project', value: runEditProject },
];

async function main() {
  // Loops back to this same menu after every task finishes (however it
  // finished -- saved, or quit out of internally) instead of ending the
  // whole `npm run content` session after one thing. "Quit" here is the
  // only way out now.
  while (true) {
    const task = await select({
      message: 'What do you want to do?',
      choices: [...TASKS.map(({ name, value }) => ({ name, value })), { name: 'Quit', value: null }],
    });
    if (task === null) return;
    console.log();
    await task();
    console.log();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runCli(main);
}
