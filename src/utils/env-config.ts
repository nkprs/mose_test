export default {
    isDev: process.env.NODE_ENV === 'development',
    serverPort: Number.parseInt(process.env.SERVER_PORT || '3030'),
    serverHost: process.env.SERVER_HOST || '0.0.0.0',
    pixabayApiToken: process.env.PIXABAY_API_TOKEN || '<api_key_token>'
}