'use strict';

var util = require('./util');


module.exports = function error(rule, it) {
  /* istanbul ignore if */
  if (it.createErrors === false) return '{}';
  var out = '{ keyword: "' + (it.$errorKeyword || rule) + '"'
            + ", dataPath: (dataPath || '') + " + it.errorPath
            + ', schemaPath: "' + it.$errSchemaPath + '"'
            + ', params: ' + errorParams(rule, it);
  if (it.opts.messages !== false)
    out += ', message: ' + errorMessage(rule, it);
  if (it.opts.verbose) {
    out += ', schema: ' + errorSchema(rule, it)
         + ', parentSchema: validate.schema' + it.schemaPath
         + ', data: ' + it.$data;
  }
  return out + '}';
};


function errorParams(rule, it) {
  switch (rule) {
    case 'anyOf':
    case 'enum':
    case '_exclusiveLimit':
    case 'not':
    case 'oneOf':
    case 'constant':
      return '{}';

    case '_limitItems':
    case '_limitLength':
    case '_limitProperties':
      return '{ limit: ' + it.$schemaValue + ' }';

    case '_limit':          return '{ comparison: ' + it.$opExpr
                                   + ', limit: ' + it.$schemaValue
                                   + ', exclusive: ' + it.$exclusive
                                   + ' }';
    case '$ref':            return '{ ref: ' + util.toQuotedString(it.$schema) + ' }';
    case 'additionalItems': return '{ limit: ' + it.$schema.length + ' }';
    case 'additionalProperties': return "{ additionalProperty: '" + it.$additionalProperty + "' }";
    case 'dependencies':    return '{ property: ' + util.toQuotedString(it.$property)
                                   + ', missingProperty: \'' + it.$missingProperty + '\''
                                   + ', depsCount: ' + it.$deps.length
                                   + ', deps: ' + util.toQuotedString(it.$deps.length==1 ? it.$deps[0] : it.$deps.join(', '))
                                   + ' }';

    case 'format':
    case 'pattern':
      return '{ ' + rule + ': ' + (it.$isData ? it.$schemaValue : util.toQuotedString(it.$schema)) + ' }';

    case 'multipleOf':      return '{ multipleOf: ' + it.$schemaValue + ' }';
    case 'required':        return '{ missingProperty: \'' + it.$missingProperty + '\' }';
    case 'type':            return '{ type: \'' + (it.$isArray ? it.$typeSchema.join(',') : it.$typeSchema) + '\' }';
    case 'uniqueItems':     return '{ i: i, j: j }';
    case 'custom':          return '{ keyword: \'' + it.$rule.keyword + '\' }';
    case 'patternGroups':   return '{ reason: \'' + it.$reason + '\''
                                   + ', limit: ' + it.$limit
                                   + ', pattern: ' + util.toQuotedString(it.$pgProperty)
                                   + ' }';
    case 'switch':          return '{ caseIndex: ' + it.$caseIndex + ' }';
  }
}


function errorMessage(rule, it) {
  switch (rule) {
    case '$ref':            return "'can\\\'t resolve reference " + util.escapeQuotes(it.$schema) + "'";
    case 'additionalItems': return "'should NOT have more than " + it.$schema.length + " items'";
    case 'additionalProperties': return "'should NOT have additional properties'";
    case 'anyOf':           return "'should match some schema in anyOf'";
    case 'dependencies':    return "'should have "
                                   + (it.$deps.length == 1
                                       ? "property " + util.escapeQuotes(it.$deps[0])
                                       : "properties " + util.escapeQuotes(it.$deps.join(", ")))
                                   + " when property {{= it.util.escapeQuotes($property) }} is present'";
    case 'enum':            return "'should be equal to one of values'";

    case 'format':          
    case 'pattern':
      return "'should match " + rule + " \""
             + (it.$isData
                 ? "' + " + it.$schemaValue + " + '"
                 : util.escapeQuotes(it.$schema))
             + "\"'";

    case '_limit':          return "'should be " + it.$opStr + " " + appendSchema(it);
    case '_exclusiveLimit': return "'" + it.$exclusiveKeyword + " should be boolean'";
    case '_limitItems':     return "'should NOT have "
                                   + (it.$keyword=='maxItems' ? "more" : "less")
                                   + " than " + concatSchema(it) + " items'";
    case '_limitLength':    return "'should NOT be "
                                   + (it.$keyword=='maxLength' ? "longer" : "shorter")
                                   + " than " + concatSchema(it) + " characters'";
    case '_limitProperties':return "'should NOT have "
                                   + (it.$keyword=='maxProperties' ? "more" : "less")
                                   + " than " + concatSchema(it) + " properties'";
    case 'multipleOf':      return "'should be multiple of " + appendSchema(it);
    case 'not':             return "'should NOT be valid'";
    case 'oneOf':           return "'should match exactly one schema in oneOf'";
    case 'required':        return it.opts._errorDataPathProperty
                                    ? "'is a required property'"
                                    : "'should have required property \\'" + it.$missingProperty + "\\''";
    case 'type':            return "'should be " + (it.$isArray ? it.$typeSchema.join(",") : it.$typeSchema) + "'";
    case 'uniqueItems':     return "'should NOT have duplicate items (items ## ' + j + ' and ' + i + ' are identical)'";
    case 'custom':          return "'should pass \"" + it.$rule.keyword + "\" keyword validation'";
    case 'patternGroups':   return "'should NOT have " + it.$moreOrLess + " than "
                                   + it.$limit + " properties matching pattern \""
                                   + util.escapeQuotes(it.$pgProperty) + "\"'";
    case 'switch':          return "'should pass \"switch\" keyword validation'";
    case 'constant':        return "'should be equal to constant'";
  }
}


function concatSchema(it) {
  return it.$isData ? "' + " + it.$schemaValue + " + '" : it.$schema;
}

function appendSchema(it) {
  return it.$isData ? "' + " + it.$schemaValue : it.$schema + "'";
}


function errorSchema(rule, it) {
  switch (rule) {
    case 'type':
    case 'anyOf':
    case 'dependencies':
    case 'enum':
    case 'not':
    case 'oneOf':
    case 'required':
    case 'custom':
    case 'patternGroups':
    case 'switch':
    case 'constant':
    case '_exclusiveLimit':
      return 'validate.schema' + it.$schemaPath;

    case '_limit':
    case '_limitItems':
    case '_limitLength':
    case '_limitProperties':
    case 'multipleOf':
      return it.$isData
              ? 'validate.schema' + it.$schemaPath
              : it.$schema;

    case 'format':
    case 'pattern':
      return it.$isData
              ? 'validate.schema' + it.$schemaPath
              : util.toQuotedString(it.$schema);

    case 'additionalItems':
    case 'additionalProperties':
      return 'false';

    case 'uniqueItems': return 'true';
    case '$ref':        return util.toQuotedString(it.$schema);
  }
}

/*
$isData
$schemaPath
$schema

$schemaValue
 */
