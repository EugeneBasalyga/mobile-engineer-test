import { createMockServer } from '../../../kit/mock-server.mjs';

const server = createMockServer({ statePath: process.argv[2] });
server.listen(0, '127.0.0.1', () => {
  process.stdout.write(`${server.address().port}\n`);
});
