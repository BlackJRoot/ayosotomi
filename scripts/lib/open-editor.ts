// Shared by new-post-cli.ts and new-project-cli.ts -- opens a
// just-created file in the human's own editor (checks $VISUAL then
// $EDITOR, standard Unix convention) so they land straight in writing
// the body instead of having to find the file themselves. now-cli.ts
// doesn't use this: Now entries are pure frontmatter with no body to
// write, so there's nothing to open an editor for there.
import { spawn } from 'node:child_process';

export async function openInEditor(filePath: string): Promise<void> {
  const editor = process.env['VISUAL'] || process.env['EDITOR'];
  if (!editor) {
    console.log('\n(No $EDITOR or $VISUAL set -- open the file manually to write the body.)');
    return;
  }

  console.log(`\nOpening in ${editor}...`);
  await new Promise<void>((resolve) => {
    const child = spawn(editor, [filePath], { stdio: 'inherit' });
    child.on('exit', () => resolve());
    child.on('error', () => {
      console.log(`(Could not launch "${editor}" -- open the file manually.)`);
      resolve();
    });
  });
}
