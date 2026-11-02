// Runs the unmodified kit server on a free port with its own state file, so tests never touch
// a mock the reviewer started by hand.
import { createMockServer } from '../../../kit/mock-server.mjs';

const server = createMockServer({ statePath: process.argv[2] });
server.listen(0, '127.0.0.1', () => {
  process.stdout.write(`${server.address().port}\n`);
});
