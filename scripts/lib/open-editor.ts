// Shared by new-post-cli.ts, new-project-cli.ts, edit-post-cli.ts, and
// edit-project-cli.ts -- opens a saved file in the human's own editor
// (checks $VISUAL then $EDITOR, standard Unix convention). now-cli.ts
// doesn't use this: Now entries are pure frontmatter with no body to
// write, so there's nothing to open an editor for there.
import { spawn } from 'node:child_process';

// GUI editors (launch their own window, the CLI process returns almost
// immediately either way) can be spawned fully detached -- the CLI
// doesn't need to wait for them to close, so `npm run content`'s menu
// can loop straight back without the file staying open blocking it.
// Terminal editors (vim, nano, ...) are fundamentally different: they
// need the actual controlling terminal to render anything at all, and
// there's no safe way to run one "in the background" of the same
// terminal session the CLI's own prompts are using -- they'd fight over
// it. Those still block until closed; that's not a compromise, it's the
// only way a terminal editor can work here.
const GUI_EDITORS = new Set([
  'code',
  'code-insiders',
  'cursor',
  'subl',
  'sublime_text',
  'atom',
  'idea',
  'webstorm',
  'phpstorm',
  'pycharm',
  'gedit',
  'kate',
  'zed',
  'notepad++',
]);

export function isGuiEditor(editorCommand: string): boolean {
  const firstWord = editorCommand.trim().split(/\s+/)[0] ?? '';
  const baseName = firstWord.split(/[\\/]/).pop() ?? firstWord;
  return GUI_EDITORS.has(baseName.toLowerCase());
}

export async function openInEditor(filePath: string): Promise<void> {
  const editorCommand = process.env['VISUAL'] || process.env['EDITOR'];
  if (!editorCommand) {
    console.log('\n(No $EDITOR or $VISUAL set -- open the file manually to write the body.)');
    return;
  }

  const [editor, ...args] = editorCommand.trim().split(/\s+/);
  console.log(`\nOpening in ${editorCommand}...`);

  if (isGuiEditor(editorCommand)) {
    const child = spawn(editor, [...args, filePath], { detached: true, stdio: 'ignore' });
    child.on('error', () => {
      console.log(`(Could not launch "${editorCommand}" -- open the file manually.)`);
    });
    child.unref();
    return;
  }

  await new Promise<void>((resolve) => {
    const child = spawn(editor, [...args, filePath], { stdio: 'inherit' });
    child.on('exit', () => resolve());
    child.on('error', () => {
      console.log(`(Could not launch "${editorCommand}" -- open the file manually.)`);
      resolve();
    });
  });
}
