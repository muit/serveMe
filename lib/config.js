module.exports = exports = Config;

function Config(options)
{
    if (!(this instanceof Config))
        return Config.instance = new Config(options);

    options = options || {};
    for(p in options)
        this[p] = options[p];

    //Default Values:
    this.error = options.error || {
        404: "404.html",
        500: "500.html",
    };
    this.cluster     = options.cluster || {
        enabled: false,
        cpus: 1
    };
    this.log            = options.log || true;
    this.debug     = options.debug || false;
    this.home       = options.home || "index.html";
    this.directory = generate_public_path(options.directory || "./public");
    //Https defaults
    this.secure    = options.secure || false;
    this.key          = options.key || "./keys/key.pem";
    this.cert          = options.cert || "./keys/cert.pem";
    //Session defaults
    this.session  = options.session || {
        enabled: false,
        persistence: false,
        lifetime: 86400,
        new_session_url: "/session",
    };
    this.session.enabled                 = this.session.enabled || false;
    this.session.new_session_url = this.session.new_session_url || "/session";
}

/**
 * @api private
 */
function generate_public_path(relative_path)
{
    if(typeof relative_path === "string")
        if(relative_path[0] === ".")
            return [process.cwd().replace("\\", "/"), relative_path.slice(1)].join('');
    return relative_path;
}