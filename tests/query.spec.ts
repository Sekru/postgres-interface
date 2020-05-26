import Query from '../Query';
import { expect } from 'chai';
import 'mocha';

describe('Query builder tests', () => {
    it('should build select all', () => {
      const r = new Query({});
      r.table('test');

      expect(r.toString()).equal('SELECT * FROM test');
    });

    it('should build select with conditions', () => {
      const r = new Query({})
      r.table('test').filter({'id': 1});

      expect(r.toString()).equal('SELECT * FROM test WHERE id = 1');
    });

    it('should build select with conditions and order desc', () => {
      const r = new Query({});
      r.table('test').filter({'id': 1}).orderBy(r.desc('id'));

      expect(r.toString()).equal('SELECT * FROM test WHERE id = 1 ORDER BY id DESC');
    });

    it('should build select by function', () => {
      const r = new Query({});
      r.table('test').filter(r.row('age').gt(18).run());

      expect(r.toString()).equal('SELECT * FROM test WHERE age > 18');
    });

    it('should build between', () => {
      const r = new Query({});
      r.table('test').between(200, 300, 'field');

      expect(r.toString()).equal('SELECT * FROM test WHERE field BETWEEN 200 AND 300');
    });

    it('should build insert', () => {
      const r = new Query({});
      r.table('test').insert({'id': 1});

      expect(r.toString()).equal('INSERT INTO test(id) VALUES(1)');
    });

    it('should build update', () => {
      const r = new Query({});
      r.table('test').update({'id': 1, 'name': 'test'});

      expect(r.toString()).equal('UPDATE test SET id = 1, name = test');
    });

    it('should build filter and update', () => {
      const r = new Query({});
      r.table('test').filter({'name': 'test'}).update({'name': 'test2', 'foo': 'bar'});

      expect(r.toString()).equal('UPDATE test SET name = test2, foo = bar WHERE name = test');
    });

    it('should build filter and delete', () => {
      const r = new Query({});
      r.table('test').filter({'name': 'test'}).delete();

      expect(r.toString()).equal('DELETE FROM test WHERE name = test');
    });

    it('should build hasFields', () => {
      const r = new Query({});
      r.table('test').hasFields('foo', 'bar');

      expect(r.toString()).equal('SELECT * FROM test WHERE foo IS NOT NULL AND bar IS NOT NULL');
    });

    it('should build custom query', () => {
      const r = new Query({});
      r.table('test').custom('SELECT 1');

      expect(r.toString()).equal('SELECT 1');
    });

    it('should build extreme query', () => {
      const r = new Query({});
        r.table('test')
          .hasFields('id')
          .filter({'foo': 'bar'})
          .filter((row: any) => {
              return row('valueStart')
                  .during(10, 20, { rightBound: 'closed' })
                  .or(row('valueEnd').during(10, 20, { rightBound: 'closed' }))
                  .or(row('valueStart').lt(10).and(row('valueEnd').gt(20)));
          });

        expect(r.toString()).equal(`SELECT * FROM test WHERE id IS NOT NULL AND foo = bar AND valueStart <= 10 AND valueStart >= 20 OR (valueEnd <= 10 AND valueEnd >= 20 ) OR (valueStart < 10 AND (valueEnd > 20 ) )`);
    });

    it('should create table', () => {
      const r = new Query({});
      r.tableCreate('test', {desc: 'TEXT', id: 'INTEGER'});

      expect(r.toString()).equal('CREATE TABLE test (desc TEXT,id INTEGER)');
    });

    it('should create index', () => {
      const r = new Query({});
      r.indexCreate('test', 'test', ['id', 'desc']);

      expect(r.toString()).equal('CREATE INDEX test ON test (id,desc)');
    });
});