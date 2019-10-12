import Query from '../Query';
import { expect } from 'chai';
import 'mocha';

describe('Query builder tests', () => {
    it('should build select all', () => {
      const r = new Query({});
      r.table('test');

      expect(r.query.join(' ')).equal('SELECT * FROM test');
    });

    it('should build select with conditions', () => {
      const r = new Query({})
      r.table('test').filter({'id': 1});

      expect(r.query.join(' ')).equal('SELECT * FROM test WHERE id = $1');
      expect(r.params[0]).equal(1);
    });

    it('should build select with conditions and order desc', () => {
      const r = new Query({});
      r.table('test').filter({'id': 1}).orderBy(r.desc('id'));

      expect(r.query.join(' ')).equal('SELECT * FROM test WHERE id = $1 ORDER BY id DESC');
      expect(r.params[0]).equal(1);
    });

    it('should build select by function', () => {
      const r = new Query({});
      r.table('test').filter(r.row('age').gt(18));

      expect(r.query.join(' ')).equal('SELECT * FROM test WHERE age > 18');
    });

    it('should build between', () => {
      const r = new Query({});
      r.table('test').between(200, 300, 'field');

      expect(r.query.join(' ')).equal('SELECT * FROM test WHERE field BETWEEN 200 AND 300');
    });

    it('should build custom', () => {
      const r = new Query({});
      r.custom('SELECT 1');

      expect(r.query.join(' ')).equal('SELECT 1');
    });

    it('should build insert', () => {
      const r = new Query({});
      r.table('test').insert({'id': 1});

      expect(r.query.join(' ')).equal('INSERT INTO test(id) VALUES($1)');
      expect(r.params[0]).equal(1);
    });
});