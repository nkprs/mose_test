import { FastifyInstance } from "fastify";
import feed from "./feed";

export default async function(server: FastifyInstance) {
    server.register(feed, { prefix: "/feed" });
    server.addHook('preValidation', (req, reply, done) => {
        const origin = req.headers.origin;

        if (!origin) {
            done()
        } else {
            return reply.send({
                success: false,
                error: {
                    message: 'Неизвестный Origin в запросе'
                }
            })
        }
    })
}