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

    it('should build insert', () => {
      const r = new Query({});
      r.table('test').insert({'id': 1});

      expect(r.query.join(' ')).equal('INSERT INTO test VALUES($1)');
      expect(r.params[0]).equal(1);
    });
});