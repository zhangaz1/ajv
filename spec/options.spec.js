'use strict';


var Ajv = require(typeof window == 'object' ? 'ajv' : '../lib/ajv')
  , should = require('chai').should();


describe('Ajv Options', function () {
  describe('removeAdditional', function() {
    it('should remove all additional properties', function() {
      var ajv = Ajv();

      var schema = {
        properties: { foo: { type: 'string' }, bar: { type: 'string' } }
      };

      var object = {
        foo: 'foo', bar: 'bar', baz: 'baz-to-be-removed'
      };

      var valid = ajv.validate(schema, object, { removeAdditional: 'all' });

      valid .should.equal(true);
      object.should.have.property('foo');
      object.should.have.property('bar');
      object.should.not.have.property('baz');
    });


    it('should remove properties that would error when `additionalProperties = false`', function() {
      var ajv = Ajv();

      var schema = {
        id: '//test/fooBar',
        properties: { foo: { type: 'string' }, bar: { type: 'string' } },
        additionalProperties: false
      };

      var object = {
        foo: 'foo', bar: 'bar', baz: 'baz-to-be-removed'
      };

      var valid = ajv.validate(schema, object, { removeAdditional: true });

      valid .should.equal(true);
      object.should.have.property('foo');
      object.should.have.property('bar');
      object.should.not.have.property('baz');
    });


    it('should remove properties that would error when `additionalProperties` is a schema', function() {
      var ajv = Ajv();

      var schema = {
        id: '//test/fooBar',
        properties: { foo: { type: 'string' }, bar: { type: 'string' } },
        additionalProperties: { type: 'string' }
      };

      var object = {
        foo: 'foo', bar: 'bar', baz: 'baz-to-be-kept', fizz: 1000
      };

      var valid = ajv.validate(schema, object, { removeAdditional: 'failing' });

      valid .should.equal(true);
      object.should.have.property('foo');
      object.should.have.property('bar');
      object.should.have.property('baz');
      object.should.not.have.property('fizz');
    });
  });
});
