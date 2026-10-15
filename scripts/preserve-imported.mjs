import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function preserveImported({ cwd = process.cwd(), maxAttempts = 4, beforePush } = {}) {
  const git = (...args) => {
    const result = spawnSync('git', args, { cwd, encoding: 'utf8', windowsHide: true });
    if (result.error) throw result.error;
    return result;
  };
  const checked = (...args) => {
    const result = git(...args);
    if (result.status !== 0) throw new Error(`git ${args[0]} failed: ${result.stderr.trim()}`);
    return result.stdout;
  };
  checked('add', '--', 'content/articles', 'content/markdown', 'public/media');
  const diff = git('diff', '--cached', '--quiet');
  if (diff.status === 0) return { committed: false, attempts: 0 };
  if (diff.status !== 1) throw new Error(`Could not inspect staged content: ${diff.stderr}`);
  checked('commit', '-m', 'content: preserve approved articles and media [skip ci]');

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    checked('fetch', 'origin', 'main');
    checked('rebase', 'origin/main');
    beforePush?.(attempt);
    const push = git('push', 'origin', 'HEAD:main');
    if (push.status === 0) return { committed: true, attempts: attempt };
    const race = /cannot lock ref|fetch first|non-fast-forward|stale info/i.test(push.stderr);
    if (!race || attempt === maxAttempts) throw new Error(`Content push failed: ${push.stderr.trim()}`);
    console.warn(`main changed during publication; synchronizing again (${attempt}/${maxAttempts}).`);
  }
  throw new Error('Content push attempt limit reached');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify(preserveImported()));
}
