import { Pool } from 'pg';
export default class Query {
    public query: Array<any> = [];
    private pool: Pool;
    public params: Array<any> = [];
    private columns: Array<any> = [];
    private defaultValue = {};
    private tableName = '';
    constructor(pool: any) {
        this.pool = pool;
    }

    insert(obj: object) {
        this.query = [];
        this.query.push(`INSERT INTO ${this.tableName}(${Object.keys(obj).join(',')}) VALUES(${Object.keys(obj).map((e, i) => `$${i+1}`).join(',')})`);
        this.params.push(...Object.values(obj));
        return this;
    }

    table(name: string) {
        this.tableName = name;
        this.query.push(`SELECT ${this.columns.length ? this.columns.join(',') : '*'} FROM ${this.tableName}`);
        return this;
    }

    desc(param: string) {
        return `${param} DESC`;
    }

    orderBy(order: string) {
        this.query.push(`ORDER BY ${order}`);
        return this;
    }

    limit(n: number) {
        this.query.push(`LIMIT ${n}`);
        return this;
    }

    default(d: any) {
        this.defaultValue = d;
        return this;
    }

    filter(conditions: object) {
        this.query.push(`WHERE ${Object.keys(conditions).map((e, i) => `${e} = $${i+1}`).join(',')}`);
        this.params.push(...Object.values(conditions));
        return this;
    }

    async run() {
        const response = await this.pool.query(this.query.join(' '), this.params);

        if (response.rows && response.rows.length) {
            return response.rows;
        }

        if (response.rows && !response.rows.length) {
            return this.defaultValue;
        }

        return [];
    }
}