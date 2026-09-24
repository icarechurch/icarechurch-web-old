import serverless from "serverless-http";
import { createServer } from "../../server.js";

let app;

// Create the app instance in production mode
async function bootstrap() {
  if (!app) {
    const server = await createServer(undefined, true);
    app = server.app;
  }
  return app;
}

// Wrapper for the serverless function
const handler = async (event, context) => {
  const appInstance = await bootstrap();
  const serverlessHandler = serverless(appInstance);
  return serverlessHandler(event, context);
};

export { handler };
