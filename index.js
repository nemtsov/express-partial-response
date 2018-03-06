const jsonMask = require('json-mask')

module.exports = function (opt) {
  opt = opt || {}

  function partialResponse(obj, fields) {
    if (!fields) return obj
    return jsonMask(obj, fields)
  }

  function wrap(orig) {
    return function (obj) {
      const param = this.req.query[opt.query || 'fields']
      if (1 === arguments.length) {
        orig(partialResponse(obj, param))
      } else if (2 === arguments.length) {
        if ('number' === typeof arguments[1]) {
          // res.json(body, status) backwards compat
          orig(arguments[1], partialResponse(obj, param))
        } else {
          // res.json(status, body) backwards compat
          orig(obj, partialResponse(arguments[1], param))
        }
      }
    }
  }

  return function (req, res, next) {
    if (!res.__isJSONMaskWrapped) {
      res.json = wrap(res.json.bind(res))
      if (req.jsonp) res.jsonp = wrap(res.jsonp.bind(res))
      res.__isJSONMaskWrapped = true
    }
    next()
  }
}
