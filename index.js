const { compile, filter } = require('json-mask');

module.exports = function (opt) {
  opt = opt || {};

  function partialResponse (obj, fields) {
    if (!fields || this.statusCode !== 200) return obj;
    return filter(obj, compile(fields));
  }

  function wrap (orig) {
    
    return function (obj) {
      let param = this.req.query[opt.query || 'fields'];
      if (1 === arguments.length) {
        orig(partialResponse.call(this, obj, param));
      } else if (2 === arguments.length) {
        if ('number' === typeof arguments[1]) {
          orig(arguments[1], partialResponse.call(this, obj, param));
        } else {
          orig(obj, partialResponse.call(this, arguments[1], param));
        }
      }
    };
  }

  return function (req, res, next) {
    if (!res.__isJSONMaskWrapped) {
      res.json = wrap(res.json.bind(res));
      if (req.jsonp) res.jsonp = wrap(res.jsonp.bind(res));
      res.__isJSONMaskWrapped = true;
    }
    next();
  };
};
