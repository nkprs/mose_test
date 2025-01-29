import { FastifyRedis } from "@fastify/redis";
import envConfig from "../utils/env-config";

const { pixabayApiToken } = envConfig;
const PIXABAY_URL = 'https://pixabay.com/api/';
const UNIQ_KEY = 'uniq_feed_id';
const TYPES_PREFIX = {
    REGULAR: 'regular',
    GRAFFITI: 'graffiti'
};

const createKey = (prefix: string, id: string | number) => `${prefix}:${id}`;

interface IPixabayResponse {
    hits: Array<{
        webformatURL: string;
        tags: string[]
    }>
}

interface IFeedImage {
    image: string;
    tags: string[];
}

export async function createFeed(redisClient: FastifyRedis, search: string) {
    try {
        const nextId = await redisClient.incr(UNIQ_KEY);
        
        // считаем что это очень быстрые операции, точно быстрее searchImages
        // но почему-то серавно хочется сначала инициализировать default значение
        await Promise.all([
            redisClient.set(createKey(TYPES_PREFIX.REGULAR, nextId), JSON.stringify({ [TYPES_PREFIX.REGULAR]: { state: 'loading' }})),
            redisClient.set(createKey(TYPES_PREFIX.GRAFFITI, nextId), JSON.stringify({ [TYPES_PREFIX.GRAFFITI]: { state: 'loading' }}))
        ]);

        searchImages(search)
            .then(images => redisClient.set(createKey(TYPES_PREFIX.REGULAR, nextId), JSON.stringify(images)))
            .catch(() => redisClient.set(createKey(TYPES_PREFIX.REGULAR, nextId), JSON.stringify({ [TYPES_PREFIX.REGULAR]: { state: 'error' }})))
        searchImages(`${search} ${TYPES_PREFIX.GRAFFITI}`)
            .then(images => redisClient.set(createKey(TYPES_PREFIX.GRAFFITI, nextId), JSON.stringify(images)))
            .catch(() => redisClient.set(createKey(TYPES_PREFIX.GRAFFITI, nextId), JSON.stringify({ [TYPES_PREFIX.GRAFFITI]: { state: 'error' }})))

        return nextId;
    } catch(err) {
        return err;
    }
}

export async function getFeed(redisClient: FastifyRedis, feedId: number) {
    try {
        const [regularImages, graffitiImages] = await Promise.all([
            redisClient.get(createKey(TYPES_PREFIX.REGULAR, feedId)),
            redisClient.get(createKey(TYPES_PREFIX.GRAFFITI, feedId)),
        ]).then(([regular, graffiti]) => [JSON.parse(regular || ''), JSON.parse(graffiti || '')]);

        // формируем ленту по наибольшему из массивов (вдруг где-то будет меньше 10 элементов?)
        let result = new Array(regularImages.length > graffitiImages.length ? regularImages.length : graffitiImages.length).fill(0);

        result = result.map((_, index) => ({
            [TYPES_PREFIX.REGULAR]: regularImages[index] || regularImages[TYPES_PREFIX.REGULAR],
            [TYPES_PREFIX.GRAFFITI]: graffitiImages[index] || graffitiImages[TYPES_PREFIX.GRAFFITI]
        }))

        return result;
    } catch(err) {
        console.log(err);
        return err;
    }

}

async function searchImages(search: string, perPage = 10): Promise<IFeedImage[]> {
    const formatedSearch = encodeURIComponent(search);

    try {
        const response = await fetch(`${PIXABAY_URL}?key=${pixabayApiToken}&q=${formatedSearch}&per_page${perPage}`);
        const result: IPixabayResponse = await response.json()

        if (result.hits.length) {
            return result.hits.map(({ webformatURL, tags }) => ({
                image: webformatURL,
                tags
            }))
        } else {
            return [];
        }
    } catch(err) {
        throw new Error(JSON.stringify(err))
    }
}