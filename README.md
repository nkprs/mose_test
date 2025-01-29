### Тестовое задание на позицию NodeJS-разработчика

перед началом запуска, убедитесь, что в файле `src/utils/env-config.ts` прописан `api_key_token`

## Технологии

* Node.js
* Fastify.js
* Redis
* Docker

## Get started

```bash
docker-compose up -d --build
```

## API

**POST** `http://127.0.0.1:3030/api/feed/` - в body передается json со строкой поиска `search` (возвращает id ленты)

**GET** `http://127.0.0.1:3030/api/feed/:id` - в params передается id ленты (возвращает ленту)

для всех успешных ответов используется json-объект вида:

```js
{
    success: true,
    data: {}
}
```

для не успешных:

```js
{
    success: false,
    error: {
        message: string,
        details: {}
    }
}
```

### Чтобы хотелось добавить еще:

* прокидывание переменных окружения в docker-compose через среду запуска (Github Actions, Gitlab CI и т.д.)
* добить alias для путей в tsconfig (100 раз настраивал и вот опять какая-то хрень с ними, пришлось вернуться на относительные пути)