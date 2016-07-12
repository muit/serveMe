module.exports = exports = Config;

function Config(options) {
    if (!(this instanceof Config)) {
        return Config.instance = new Config(options);
    }

    options = options || {};
    for (p in options) {
        this[p] = options[p];
    }

    this.hostname  = process.env[this.hostname_env_var]

    //Default Values:
    this.log       = (options.log === undefined) ? true : options.log;
    this.debug     = options.debug || false;
    this.home      = options.home || "index.html";
    this.directory = generate_public_path(options.directory || "./public");
    this.favicon   = options.favicon || "/favicon.ico";


    //Https defaults
    this.secure = options.secure || false;
    this.key    = options.key || "./keys/key.pem";
    this.cert   = options.cert || "./keys/cert.pem";
    this.error  = options.error || {
        404: "404.html",
        500: "500.html",
    };
    this.cluster = options.cluster || {
        enabled: false,
        cpus: 1
    };


    //Session defaults
    this.session = options.session || {
        enabled: false,
        persistence: false,
        lifetime: 7200,
        new_session_url: "/session",
        global_path: false
    };
    this.session.enabled         = this.session.enabled || false;
    this.session.persistence     = this.session.persistence || false;
    this.session.lifetime        = this.session.lifetime || 7200;
    this.session.new_session_url = this.session.new_session_url || "/session";
    this.session.global_path     = this.session.global_path || false;


    //Cluster defaults
    this.cluster = options.cluster || {
        enabled: false,
        cpus: "max",
        auto_restart: true
    };
    this.cluster.enabled      = this.cluster.enabled || false;
    this.cluster.cpus         = this.cluster.cpus || "max";
    this.cluster.auto_restart = this.cluster.auto_restart || true;
}

/**
 * @api private
 */
function generate_public_path(relative_path) {
    if (typeof relative_path === "string") {
        if (relative_path[0] === ".") {
            return [process.cwd().replace("\\", "/"), relative_path.slice(1)].join('');
        }
    }
    return relative_path;
}