'use strict';

var Ajv = require('./ajv');

module.exports = getAjvInstances;

var isBrowser = typeof window == 'object';
var packTest = !isBrowser && process.env.AJV_PACK == 'true';


function getAjvInstances(options, extraOpts) {
  var instances = _getAjvInstances(options, extraOpts || {});
  if (!packTest) return instances;
  var ajvPack = require('' + 'ajv-pack');
  extraOpts = extraOpts || {};
  extraOpts.sourceCode = true;
  var packInstances = _getAjvInstances(options, extraOpts).map(function (ajv) {
    return ajvPack.instance(ajv);
  });
  return instances.concat(packInstances);
}

function _getAjvInstances(opts, useOpts) {
  var optNames = Object.keys(opts);
  if (optNames.length) {
    opts = copy(opts);
    var useOpts1 = copy(useOpts)
      , optName = optNames[0];
    useOpts1[optName] = opts[optName];
    delete opts[optName];
    var instances = _getAjvInstances(opts, useOpts)
      , instances1 = _getAjvInstances(opts, useOpts1);
    return instances.concat(instances1);
  }
  return [ new Ajv(useOpts) ];
}


function copy(o, to) {
  to = to || {};
  for (var key in o) to[key] = o[key];
  return to;
}
