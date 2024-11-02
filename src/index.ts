import Fastify from "fastify";
import multipart from "@fastify/multipart";

import routes from "routes/index.js";
import { errorHandler } from "middlewares/errorHandler.js";

const fastify = Fastify({
  logger: {
    transport: {
      level: "error",
      target: "pino-pretty",
      options: {
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
        colorize: true,
      },
    },
  },
});

fastify.register(multipart);

fastify.register(routes);
fastify.setErrorHandler(errorHandler);

fastify
  .listen({ port: 3000 })
  .then(() => {
    console.log("Server running!!");
  })
  .catch((err) => {
    fastify.log.error(err);
  });
