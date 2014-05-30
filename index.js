'use strict';


var jsonMask = require('json-mask'),
  compile = jsonMask.compile,
  filter = jsonMask.filter;


module.exports = function (opt) {
  opt = opt || {};

  function partialResponse(obj, fields) {
    return !fields ? obj : filter(obj, compile(fields));
  }

  function wrap(req, res, fn) {
    return function (obj) {
      var param = this.req.query[opt.query || 'fields'];
      if (2 === arguments.length) {
        res.statusCode = obj;
        obj = arguments[1];
      }
      if (typeof obj === 'object') {
        obj = partialResponse(obj, param);
      }
      fn.call(res, obj);
    };
  }

  return function (req, res, next) {
    res.json = wrap(req, res, res.json);
    res.jsonp = wrap(req, res, res.jsonp);
    next();
  };

};