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
      if (1 === arguments.length) {
        // Call res.json(body)
        fn.call(res, partialResponse(obj, param));
      } else if (2 === arguments.length) {
        var statusCode;
        if ('number' === typeof arguments[1]) {
          statusCode = arguments[1];
          obj = partialResponse(obj, param);
        } else {
          // Allow res.json(body, status) a deprecated function
          statusCode = obj;
          obj = partialResponse(arguments[1], param);
        }
        // Call res.json(status, body)
        fn.call(res, statusCode, obj);
      }
    };
  }

  return function (req, res, next) {
    // self-awareness middleware
    if (!res.__isJSONMaskWrapped) {
      res.json = wrap(req, res, res.json);
      res.jsonp = wrap(req, res, res.jsonp);
      res.__isJSONMaskWrapped = true;
    }
    next();
  };

};