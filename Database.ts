import { Pool, PoolConfig } from 'pg';
import Query from './Query';

export class Database {
    private pool: Pool;

    constructor(config: PoolConfig) {
        if (config.connectionString) {
            this.pool = new Pool({connectionString: config.connectionString})
        } else {
            this.pool = new Pool({
                host: config.host || 'localhost' ,
                database: config.database || process.env.USER,
                user: config.user || process.env.USER,
                password: config.password || undefined,
                port: config.port || 5432,
            });
        }
    }

    query() {
        return new Query(this.pool);
    }
}