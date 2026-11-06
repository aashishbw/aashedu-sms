import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
const db = new PGlite();
const server = new PGLiteSocketServer({db,port:Number(process.env.TEST_DB_PORT ?? 55432),host:"127.0.0.1",maxConnections:30});
await server.start();
console.log("Temporary PostgreSQL test database is listening on the configured port");


