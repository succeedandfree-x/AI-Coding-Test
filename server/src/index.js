import { initSchema, seedIfEmpty } from './db.js';
import { app } from './app.js';

initSchema();
seedIfEmpty();

const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`FLYVIO listening on http://${HOST}:${PORT}`);
});
