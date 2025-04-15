export const dbConfig = {
  mongodb: {
    url: process.env.MONGODB_URL || 'mongodb://localhost:27030/voting_system',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6380'),
    password: process.env.REDIS_PASSWORD || '',
    db: parseInt(process.env.REDIS_DB || '0'),
  }
};
