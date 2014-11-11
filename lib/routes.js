
/**
 * Module exports.
 */
module.exports = exports = Routes;

function Routes()
{
  Routes._hashIds = {};
}

Routes._hashIds = {};

Routes.add = function(url, callback)
{
  if(typeof url != "string")
    throw new IncorrectArgumentType("Routes.reset: Url must be a string, not a "+typeof url+".");

  Routes._hashIds[url] = callback;
};

Routes.get = function(url)
{
  if(typeof url != "string")
    throw new IncorrectArgumentType("Routes.reset: Url must be a string, not a "+typeof url+".");

  return Routes._hashIds[url];
};

Routes.reset = function(url)
{
  if(typeof url != "string")
    throw new IncorrectArgumentType("Routes.reset: Url must be a string, not a "+typeof url+".");

  if(url == "all")
  {
    delete this._hashIds;
    this._hashIds = {};
  }
  return delete Routes._hashIds[url];
};

function IncorrectArgumentType(message) {
    this.name = "IncorrectArgumentType";
    this.message = message || "";
}
IncorrectArgumentType.prototype = Error.prototype;
