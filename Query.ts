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
        if (this.query[0].startsWith('SELECT')) {
            this.query.shift();
        }
        this.query.unshift(`INSERT INTO ${this.tableName}(${Object.keys(obj).join(',')}) VALUES(${Object.keys(obj).map((e, i) => `$${i+1}`).join(',')})`);
        this.params.push(...Object.values(obj));
        return this;
    }

    update(obj: object) {
        if (this.query[0].startsWith('SELECT')) {
            this.query.shift();
        }
        this.query.unshift(`UPDATE ${this.tableName} SET ${Object.entries(obj).map(e  => `${e[0]} = ${e[1]}`).join(', ')}`);
        return this;
    }

    delete() {
        if (this.query[0].startsWith('SELECT')) {
            this.query.shift();
        }
        this.query.unshift(`DELETE FROM ${this.tableName}`);
        return this;
    }

    table(name: string) {
        this.tableName = name;
        this.query.unshift(`SELECT ${this.columns.length ? this.columns.join(',') : '*'} FROM ${this.tableName}`);
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

    row(field: string) {
        return {
            gt(value: number) {
                return `${field} > ${value}`
            },
            lt(value: number) {
                return `${field} < ${value}`
            }
        }
    }

    between(x: any, y: any, field: string) {
        this.query.push(`WHERE ${field} BETWEEN ${x} AND ${y}`);
    }

    filter(conditions: object | Function | string) {
        if (typeof conditions === 'function') {

        } else if (typeof conditions === 'string') {
            this.query.push(`WHERE ${conditions}`);
        }
        else {
            this.query.push(`WHERE ${Object.keys(conditions).map((e, i) => `${e} = $${i+1}`).join(',')}`);
            this.params.push(...Object.values(conditions));
        }
        return this;
    }

    get(id: any) {
        this.query.push(`WHERE id = ${id}`);
    }

    custom(query: string) {
        this.query.push(query);
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