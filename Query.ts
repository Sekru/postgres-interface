import { Pool } from 'pg';

export default class Query {
    public query: any;
    private pool: Pool;
    private columns: Array<any> = [];
    private defaultValue = {};
    private tableName = '';
    private customQuery : string = '';
    private tableOperatiosQuery : string = '';

    private resetQuery() {
        this.columns = [];
        this.defaultValue = {};
        this.tableName = '';
        this.customQuery = '';
        this.tableOperatiosQuery = '';
        this.query = {
            insert: '',
            update: '',
            delete: '',
            select: '',
            where: [],
            and: [],
            or: [],
            order: '',
            offset: '',
            limit: ''
        };
    }

    constructor(pool: any) {
        this.resetQuery()
        this.pool = pool;
    }

    insert(obj: object) {
        this.query.insert = `INSERT INTO ${this.tableName}(${Object.keys(obj).join(',')}) VALUES(${Object.values(obj).join(',')})`;
        return this;
    }

    update(obj: object) {
        this.query.update = `UPDATE ${this.tableName} SET ${Object.entries(obj).map(e  => `${e[0]} = ${e[1]}`).join(', ')}`;
        return this;
    }

    delete() {
        this.query.delete = `DELETE FROM ${this.tableName}`;
        return this;
    }

    table(name: string) {
        this.tableName = name;
        this.query.select = `SELECT ${this.columns.length ? this.columns.join(',') : '*'} FROM ${this.tableName}`;
        return this;
    }

    sum(column: string) {
        this.query.select = `SELECT SUM(${column}) AS ${column}Sum FROM ${this.tableName}`;
        return this;
    }

    count(column: any) {
        this.query.select = `SELECT COUNT(${column ? column : '*'}) AS ${column}Count FROM ${this.tableName}`;
        return this;
    }

    avg(column: string) {
        this.query.select = `SELECT AVG(${column}) AS ${column}Avg FROM ${this.tableName}`;
        return this;
    }

    desc(param: string) {
        return `${param} DESC`;
    }

    orderBy(order: string) {
        this.query.order = `ORDER BY ${order}`;
        return this;
    }

    skip(n: number) {
        this.query.offset = `OFFSET ${n}`;
        return this;
    }

    nth(n: number) {
        this.query.limit = `LIMIT 1 OFFSET ${n}`;
        return this;
    }

    limit(n: number) {
        this.query.limit = `LIMIT ${n}`;
        return this;
    }

    default(d: any) {
        this.defaultValue = d;
        return this;
    }

    row(field: string) {
        const where: any = [];
        const or: any = [];
        const _this = this;
        return {
            gt(value: number) {
                where.push(`${field} > ${value}`);
                return this;
            },
            lt(value: number) {
                where.push(`${field} < ${value}`);
                return this;
            },

            during(x: any, y: any, obj: any) {
                if (typeof x === 'number') {
                    if (obj.rightBound === 'closed') {
                        where.push(`${field} <= ${x} AND ${field} >= ${y}`);
                    } else {
                        where.push(`${field} <= ${x} AND ${field} > ${y}`);
                    }
                } else {
                    where.push(`${field} BETWEEN ${x} AND ${y}`);
                }
                return this;
            },

            eq(value: any) {
                where.push(`${field} = ${value}`);
                return this;
            },

            or(str: any) {
                or.push(`(${str})`);
                return this;
            },

            and(str: any) {
                where.push(`(${str})`);
                return this;
            },

            toString() {
                return `${where.join(' AND ')} ${or.length ? 'OR ' + or.join(' OR '): ''}`;
            },

            run() {
                _this.query.where.push(...where);
            }
        }
    }

    between(x: any, y: any, field: string) {
        this.query.where.push(`${field} BETWEEN ${x} AND ${y}`);
    }

    filter(conditions: any) {
        if (typeof conditions === 'function') {
            this.query.where.push(conditions(this.row));
        } else if (typeof conditions === 'string') {
            this.query.where.push(`${conditions}`);
        }
        else {
            conditions ? this.query.where.push(`${Object.keys(conditions).map((e, i) => `${e} = ${conditions[e]}`).join(',')}`) : null;
        }
        return this;
    }

    get(id: any) {
        this.query.where.push(`id = ${id}`);
        return this;
    }

    hasFields(...args: any[]) {
        this.query.where.push(`${args.map(e => `${e} IS NOT NULL`).join(' AND ')}`);
        return this;
    }

    custom(str : string) {
        this.customQuery = str;
        return this;
    }

    tableCreate(tableName: string, schema: {} = {}) {
        this.tableOperatiosQuery = `CREATE TABLE ${tableName} (${Object.keys(schema)
            // @ts-ignore
            .map(k => `${k} ${schema[k]}`).join(',')})`
        return this;
    }

    indexCreate(indexName: string, tableName: string, columns: string[]) {
        this.tableOperatiosQuery = `CREATE INDEX ${indexName} ON ${tableName} (${columns.join(',')})`
        return this;
    }

    toString() {
        if (this.customQuery.length) {
            const q = this.customQuery;
            this.resetQuery();
            return q;
        }

        if (this.tableOperatiosQuery.length) {
            const q = this.tableOperatiosQuery;
            this.resetQuery();
            return q;
        }

        const q = `${this.query.insert.length ? this.query.insert :
            `${this.query.delete ||
            this.query.update ||
            this.query.select} ${this.query.where.length ? 'WHERE' : ''} ${this.query.where.join(' AND ')}`} ${this.query.order} ${this.query.offset} ${this.query.limit}`.trim();

        this.resetQuery();
        return q;
    }

    async run() {
        const response = await this.pool.query(this.toString());

        if (response.rows && response.rows.length) {
            return response.rows;
        }

        if (response.rows && !response.rows.length) {
            return this.defaultValue;
        }

        return [];
    }
}
