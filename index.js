const jsonMask = require('json-mask');

function isBadCode(statusCode) {
  return statusCode < 200 || statusCode >= 300;
}

module.exports = function(options = {}) {
  options = { query: 'fields', ...options };

  function wrap(resJson) {
    return function(obj) {
      const fields = this.req.query[options.query];

      // deprecated API that are still supported in v4
      if (arguments.length > 1) {
        // res.json(obj, status)
        if ('number' === typeof arguments[1] && !isBadCode(arguments[1])) {
          return resJson(jsonMask(obj, fields), arguments[1]);
        }

        // res.json(status, obj)
        if ('number' === typeof obj && !isBadCode(obj)) {
          return resJson(obj, jsonMask(arguments[1], fields));
        }

        return resJson(...arguments);
      }

      return isBadCode(this.statusCode)
        ? resJson(...arguments)
        : resJson(jsonMask(obj, fields));
    };
  }

  return function(req, res, next) {
    if (!res.__isJSONMaskWrapped) {
      res.json = wrap(res.json.bind(res));
      if (req.jsonp) res.jsonp = wrap(res.jsonp.bind(res));
      res.__isJSONMaskWrapped = true;
    }
    next();
  };
};
