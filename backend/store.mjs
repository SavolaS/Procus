import { mkdir, open, readFile, rename, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

// Single-process store: serialize transactions and atomically replace a synced file.
// A directory lock refuses concurrent servers sharing the same data directory.
export async function createStore(directory) {
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const lock = join(directory, 'server.lock');
  try { await mkdir(lock); }
  catch { throw new Error('Data directory is locked. Stop the other server; after a crash remove server.lock.'); }
  const file = join(directory, 'workspace.json');
  let state;
  try {
    try { state = JSON.parse(await readFile(file, 'utf8')); }
    catch (error) { if (error.code !== 'ENOENT') throw error; state = { version: 1, runs: [], outbox: [], indexRefresh: null }; }
    if (state.version !== 1 || !Array.isArray(state.runs) || !Array.isArray(state.outbox)) throw new Error('Unsupported workspace store');
  } catch (error) { await rm(lock, { recursive: true }); throw error; }
  let queue = Promise.resolve();
  let closed = false;
  let closing = null;
  const store = {
    read: () => structuredClone(state),
    update(mutator) {
      if (closed) return Promise.reject(new Error('Workspace store is closed'));
      const result = queue.then(async () => {
        const next = structuredClone(state);
        const value = mutator(next);
        const temporary = `${file}.${randomUUID()}.tmp`;
        try {
          const handle = await open(temporary, 'wx', 0o600);
          try { await handle.writeFile(JSON.stringify(next, null, 2)); await handle.sync(); }
          finally { await handle.close(); }
          await rename(temporary, file);
        } finally { await rm(temporary, { force: true }); }
        state = next;
        return structuredClone(value);
      });
      queue = result.catch(() => {});
      return result;
    },
    close() {
      if (closing) return closing;
      closed = true;
      closing = queue.then(() => rm(lock, { recursive: true, force: true }));
      return closing;
    },
  };
  try { await store.update(next => {
    for (const run of next.runs) if (['queued', 'running'].includes(run.status)) {
      run.status = 'interrupted'; run.error = 'Server stopped during discovery. Start a new search.';
    }
    for (const email of next.outbox) if (email.status === 'sending') {
      email.status = 'unknown'; email.error = 'Server stopped during delivery. Check the provider before sending again.';
    }
  }); } catch (error) { await rm(lock, { recursive: true, force: true }); throw error; }
  return store;
}
