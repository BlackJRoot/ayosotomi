// Shared by new-post-cli.ts, new-project-cli.ts, edit-post-cli.ts, and
// edit-project-cli.ts -- opens a saved file in the human's own editor
// (checks $VISUAL then $EDITOR, standard Unix convention). now-cli.ts
// doesn't use this: Now entries are pure frontmatter with no body to
// write, so there's nothing to open an editor for there.
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '..', '..');

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

// VS Code (and its same-CLI forks) specifically support `code <folder>
// <file>` -- opens/reuses a window for the whole project as a workspace
// and adds the file as a focused tab in it, rather than a bare
// disconnected window with no file tree. Only wiring this up for the
// VS Code family, not every GUI editor in the list above -- their
// folder+file argument conventions aren't verified here and guessing
// wrong could open two windows or just error out.
const VS_CODE_FAMILY = new Set(['code', 'code-insiders', 'cursor']);

export function isGuiEditor(editorCommand: string): boolean {
  const firstWord = editorCommand.trim().split(/\s+/)[0] ?? '';
  const baseName = firstWord.split(/[\\/]/).pop() ?? firstWord;
  return GUI_EDITORS.has(baseName.toLowerCase());
}

export interface EditorInvocation {
  command: string;
  args: string[];
}

// Pulled out as its own pure function (no spawning) so the argument
// logic -- the part actually worth getting right -- can be unit tested
// directly, without needing to launch a real editor process (not
// reliably possible in a headless/sandboxed environment).
export function buildEditorInvocation(editorCommand: string, filePath: string, projectRoot: string = PROJECT_ROOT): EditorInvocation {
  const [editor, ...flags] = editorCommand.trim().split(/\s+/);
  const baseName = (editor.split(/[\\/]/).pop() ?? editor).toLowerCase();

  if (VS_CODE_FAMILY.has(baseName)) {
    return { command: editor, args: [...flags, projectRoot, filePath] };
  }
  return { command: editor, args: [...flags, filePath] };
}

export async function openInEditor(filePath: string): Promise<void> {
  const editorCommand = process.env['VISUAL'] || process.env['EDITOR'];
  if (!editorCommand) {
    console.log('\n(No $EDITOR or $VISUAL set -- open the file manually to write the body.)');
    return;
  }

  const { command, args } = buildEditorInvocation(editorCommand, filePath);
  console.log(`\nOpening in ${editorCommand}...`);

  if (isGuiEditor(editorCommand)) {
    const child = spawn(command, args, { detached: true, stdio: 'ignore' });
    child.on('error', () => {
      console.log(`(Could not launch "${editorCommand}" -- open the file manually.)`);
    });
    child.unref();
    return;
  }

  await new Promise<void>((resolve) => {
    const child = spawn(command, args, { stdio: 'inherit' });
    child.on('exit', () => resolve());
    child.on('error', () => {
      console.log(`(Could not launch "${editorCommand}" -- open the file manually.)`);
      resolve();
    });
  });
}
