import Fastify from "fastify";
import fastifyRedis from "@fastify/redis";
import envConfig from "./utils/env-config";
import Route from './route'

(async function() {
    const { isDev, serverHost: host, serverPort: port } = envConfig;
    const fastify = Fastify({
        logger: true,
    });

    try {
      // await fastify.register(fastifyRedis, { host: '127.0.0.1' });
      await fastify.register(fastifyRedis, { url: 'redis://redis:6379' });
    } catch(err) {
      fastify.log.error('Could not connect to Redis')
    }
    
    try {
        await fastify.register(Route, { prefix: '/api' });
        await fastify.listen({ host, port })
        if (!isDev) {
          fastify.log.info(`Server is running on http://localhost:3000`);
        }
      } catch (err) {
        fastify.log.error(err)
        process.exit(1)
      }
})();
