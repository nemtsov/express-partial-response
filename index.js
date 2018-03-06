const jsonMask = require('json-mask')

const badCode = code => code >= 300 || code < 200

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
        return orig(partialResponse(obj, param))
      }

      if ('number' === typeof arguments[1] && !badCode(arguments[1])) {
        // res.json(body, status) backwards compat
        return orig(partialResponse(obj, param), arguments[1])
      }

      if ('number' === typeof obj && !badCode(obj)) {
        // res.json(status, body) backwards compat
        return orig(obj, partialResponse(arguments[1], param))
      }

      // The original actually returns this.send(body)
      return orig(obj, arguments[1])
    }
  }

  return function (req, res, next) {
    if (badCode(res.statusCode)) return next()
    if (!res.__isJSONMaskWrapped) {
      res.json = wrap(res.json.bind(res))
      if (req.jsonp) res.jsonp = wrap(res.jsonp.bind(res))
      res.__isJSONMaskWrapped = true
    }
    next()
  }
}
