import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { preserveImported } from '../scripts/preserve-imported.mjs';

test('publication preserves article assets when main changes between rebase and push', () => {
  const root = mkdtempSync(join(tmpdir(), 'lightstandards-sync-'));
  const remote = join(root, 'remote.git'), publisher = join(root, 'publisher'), writer = join(root, 'writer');
  const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true }).trim();
  git(root, 'init', '--bare', '--initial-branch=main', remote);
  git(root, 'clone', remote, publisher);
  git(publisher, 'config', 'core.autocrlf', 'false');
  for (const path of ['content/articles', 'content/markdown', 'public/media']) {
    mkdirSync(join(publisher, path), { recursive: true });
    writeFileSync(join(publisher, path, '.gitkeep'), '');
  }
  git(publisher, 'config', 'user.name', 'Publication test');
  git(publisher, 'config', 'user.email', 'publication@example.com');
  git(publisher, 'add', '.');
  git(publisher, 'commit', '-m', 'Initial fixture');
  git(publisher, 'push', 'origin', 'main');
  git(root, 'clone', remote, writer);
  git(writer, 'config', 'core.autocrlf', 'false');
  git(writer, 'config', 'user.name', 'Concurrent writer');
  git(writer, 'config', 'user.email', 'writer@example.com');
  writeFileSync(join(publisher, 'content/articles/approved.json'), '{"revision":1}\n');
  writeFileSync(join(publisher, 'content/markdown/approved.md'), 'Approved fixture\n');
  writeFileSync(join(publisher, 'public/media/approved.webp'), 'Media fixture\n');

  const result = preserveImported({ cwd: publisher, beforePush(attempt) {
    if (attempt !== 1) return;
    writeFileSync(join(writer, 'site-change.txt'), 'Concurrent site update\n');
    git(writer, 'add', '.');
    git(writer, 'commit', '-m', 'Concurrent site update');
    git(writer, 'push', 'origin', 'main');
  } });
  assert.equal(result.attempts, 2);
  git(writer, 'pull', '--ff-only', 'origin', 'main');
  assert.equal(readFileSync(join(writer, 'site-change.txt'), 'utf8'), 'Concurrent site update\n');
  assert.equal(readFileSync(join(writer, 'content/articles/approved.json'), 'utf8'), '{"revision":1}\n');
  assert.equal(readFileSync(join(writer, 'public/media/approved.webp'), 'utf8'), 'Media fixture\n');
  assert.equal(preserveImported({ cwd: publisher }).committed, false);
});
