import {FastifyInstance} from 'fastify';
import {createFeed, getFeed} from '../controller/feed';

export default function (server: FastifyInstance) {
    const redis = server.redis;

    server.post(
        '/',
        {
            attachValidation: true,
            schema: {
                body: {
                    type: 'object',
                    properties: {
                        search: {type: 'string', minLength: 1},
                    },
                    required: ['search'],
                },
            },
        },
        async (request, reply) => {
            const {search} = request.body as {search: string};

            try {
                const id = await createFeed(redis, search);

                reply.send({
                    success: true,
                    data: {
                        id,
                    },
                });
            } catch (err) {
                reply.send({
                    success: false,
                    error: {
                        message: 'Не удалось найти изображения',
                        details: err,
                    },
                });
            }
        }
    );

    server.get(
        '/:feedId',
        {
            attachValidation: true,
            schema: {
                params: {
                    type: 'object',
                    properties: {
                        feedId: {type: 'number', minimum: 1},
                    },
                    required: ['feedId'],
                },
            },
        },
        async (request, reply) => {
            const {feedId} = request.params as {feedId: number};

            try {
                const feed = await getFeed(redis, feedId);

                reply.send({
                    success: true,
                    data: feed,
                });
            } catch (err) {
                reply.send({
                    success: false,
                    error: {
                        message: 'Не удалось получить изображения',
                        details: err,
                    },
                });
            }
        }
    );
}
