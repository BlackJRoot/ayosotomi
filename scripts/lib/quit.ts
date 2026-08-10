// Shared by every CLI entry point (now-cli.ts, new-post-cli.ts,
// new-project-cli.ts, cli.ts) -- catches the error @inquirer/prompts
// throws on Ctrl+C (ExitPromptError) and prints a clean one-line message
// instead of letting the default stack trace through.
//
// None of these tools write anything to disk before their own final
// writeFile step (right at the end, after validation), so quitting at
// any point before that is already safe by construction -- this only
// changes how it LOOKS when you do, not what actually happens.
import { ExitPromptError } from '@inquirer/core';

export async function runCli(main: () => Promise<void>): Promise<void> {
  try {
    await main();
  } catch (error) {
    if (error instanceof ExitPromptError) {
      console.log('\nCancelled — nothing was written.');
      return;
    }
    throw error;
  }
}
