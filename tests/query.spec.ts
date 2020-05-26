import Query from '../Query';
import { expect } from 'chai';
import 'mocha';

describe('Query builder tests', () => {
    const r = new Query({});

    it('should build select all', () => {
      r.table('test');

      expect(r.toString()).equal('SELECT * FROM test');
    });

    it('should build select with conditions', () => {
      r.table('test').filter({'id': 1});

      expect(r.toString()).equal('SELECT * FROM test WHERE id = 1');
    });

    it('should build select with conditions and order desc', () => {
      r.table('test').filter({'id': 1}).orderBy(r.desc('id'));

      expect(r.toString()).equal('SELECT * FROM test WHERE id = 1 ORDER BY id DESC');
    });

    it('should build select by function', () => {
      r.table('test').filter(r.row('age').gt(18).run());

      expect(r.toString()).equal('SELECT * FROM test WHERE age > 18');
    });

    it('should build between', () => {
      r.table('test').between(200, 300, 'field');

      expect(r.toString()).equal('SELECT * FROM test WHERE field BETWEEN 200 AND 300');
    });

    it('should build insert', () => {
      r.table('test').insert({'id': 1});

      expect(r.toString()).equal('INSERT INTO test(id) VALUES(1)');
    });

    it('should build update', () => {
      r.table('test').update({'id': 1, 'name': 'test'});

      expect(r.toString()).equal('UPDATE test SET id = 1, name = test');
    });

    it('should build filter and update', () => {
      r.table('test').filter({'name': 'test'}).update({'name': 'test2', 'foo': 'bar'});

      expect(r.toString()).equal('UPDATE test SET name = test2, foo = bar WHERE name = test');
    });

    it('should build filter and delete', () => {
      r.table('test').filter({'name': 'test'}).delete();

      expect(r.toString()).equal('DELETE FROM test WHERE name = test');
    });

    it('should build hasFields', () => {
      r.table('test').hasFields('foo', 'bar');

      expect(r.toString()).equal('SELECT * FROM test WHERE foo IS NOT NULL AND bar IS NOT NULL');
    });

    it('should build custom query', () => {
      r.table('test').custom('SELECT 1');

      expect(r.toString()).equal('SELECT 1');
    });

    it('should build extreme query', () => {
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
      r.tableCreate('test', {desc: 'TEXT', id: 'INTEGER'});

      expect(r.toString()).equal('CREATE TABLE test (desc TEXT,id INTEGER)');
    });

    it('should create index', () => {
      r.indexCreate('test', 'test', ['id', 'desc']);

      expect(r.toString()).equal('CREATE INDEX test ON test (id,desc)');
    });

    it('should sum columns', () => {
      r.table('test').sum('id');

      expect(r.toString()).equal('SELECT SUM(id) AS idSum FROM test');
    });

    it('should count columns', () => {
      r.table('test').count('id');

      expect(r.toString()).equal('SELECT COUNT(id) AS idCount FROM test');
    });

    it('should avg columns', () => {
      r.table('test').avg('id');

      expect(r.toString()).equal('SELECT AVG(id) AS idAvg FROM test');
    });
});
