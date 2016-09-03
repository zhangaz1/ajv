'use strict';

var ruleModules = require('./_rules')
  , toHash = require('./util').toHash;

module.exports = function rules() {
  var RULES = [
    { type: 'number',
      rules: [ 'maximum', 'minimum', 'multipleOf'] },
    { type: 'string',
      rules: [ 'maxLength', 'minLength', 'pattern', 'format' ] },
    { type: 'array',
      rules: [ 'maxItems', 'minItems', 'uniqueItems', 'items' ] },
    { type: 'object',
      rules: [ 'maxProperties', 'minProperties', 'required', 'dependencies', 'properties' ] },
    { rules: [ '$ref', 'enum', 'not', 'anyOf', 'oneOf', 'allOf' ] }
  ];

  var ALL = [ 'type', 'additionalProperties', 'patternProperties' ];
  var KEYWORDS = [ 'additionalItems', '$schema', 'id', 'title', 'description', 'default' ];
  var TYPES = [ 'number', 'integer', 'string', 'array', 'object', 'boolean', 'null' ];
  RULES.all = toHash(ALL);
  RULES.all.additionalProperties = RULES.all.patternProperties = 'properties'

  RULES.count = 0;

  RULES.forEach(function (group) {
    group.rules = group.rules.map(function (keyword) {
      ALL.push(keyword);
      var rule = RULES.all[keyword] = {
        type: group.type,
        keyword: keyword,
        code: ruleModules[keyword],
        order: RULES.count++
      };
      return rule;
    });
  });

  RULES.keywords = toHash(ALL.concat(KEYWORDS));
  RULES.types = toHash(TYPES);
  RULES.custom = {};

  RULES.typeOrder = { '': 0 };
  TYPES.forEach(function (t, i) {
    RULES.typeOrder[t] = i + 1;
  });

  return RULES;
};
