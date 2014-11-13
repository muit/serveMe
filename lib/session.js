var urlParser = require('url');

/**
 * Module exports.
 */
module.exports = exports = Session;

var ServeMe;

function Session(arg, opts)
{
    if (!(this instanceof Session))
    {
        ServeMe = arg;

        opts = opts || {
            enabled: false,
            persistence: false,
            lifetime: 86400,
            new_sessions_on_url: "/session",
            redirect_to: "/",
        };

        if(opts.enabled)
        {
            if(opts.lifetime)
                opts.persistence = opts.persistence ? opts.persistence : true;
            else
            {
                opts.persistent = false;
                opts.lifetime = 86400;
            }
            opts.new_sessions_on_url = opts.new_sessions_on_url || "/session";
        }
        Session.options = opts;
    }
    else
    {
        if(!ServeMe)
            throw new SessionNotLoaded("Session must be loaded.");
        if(typeof opts != "object")
            throw new IncorrectArgument("Session options cant be a "+typeof opts+".");
        if(typeof arg != "string")
            throw new IncorrectArgument("Session id cant be a "+typeof arg+".");

        this.id     = arg;
        this.data   = opts.data || {};
        this.path   = opts.path || '/session';
        this.domain = opts.domain;
    }
}

Session._sessions = {};
Session.timeout = undefined;

Session.lookupOrCreate = function(request)
{
    if(!Session.options.enabled)
        return undefined;

    var id = Session.getIdFromRequest(request, {}), session;

    if(hasOwnProp(Session._sessions,id))
    {
        session = Session._sessions[id];
        ServeMe.call("session", session);
    }
    else
    {
        var url = urlParser.parse(request.url, true);
        session = new Session(id, {
            path:   url.pathname,
            data:   url.query,
            domain: request.domain
        });

        if(ServeMe.call("new_session", session) === true)
            Session._sessions[id] = session;
        else
            session = undefined;
    }

    if(!this.timeout)
        this.timeout = setTimeout(Session.cleanUp,60000);

    if(session)
        session.expiration = (+new Date())+Session.options.lifetime*1000;
    return session;
};

Session.cleanUp = function()
{
    var now = +new Date(),
        next = Infinity;
    timeout = null;

    for(var id in Session._sessions)
    {
        if(hasOwnProp(Session._sessions,id))
        {
            if(Session._sessions[id].expiration < now){
                ServeMe.call("end_session", Session._sessions[id]);
                delete Session._sessions[id];
            }
            else
                next = (next<Session._sessions[id].expiration) ? next : Session._sessions[id].expiration;
        }
    }

    if(next<Infinity)
        timeout = setTimeout(Session.cleanUp,next - (+new Date()) + 1000);
};

Session.reset = function(){
    Session._sessions = {};
    ServeMe = undefined;
};

Session.getIdFromRequest = function(req,opts)
{
    if(req.headers.cookie)
    {
        var m = /SID=([^ ,;]*)/.exec(req.headers.cookie);
        if(m && hasOwnProp(this._sessions, m[1]))
        {
            return m[1];
        }
    }
    if(opts.sessionID) return opts.sessionID;
    return randomString(64);
};

Session.prototype.getSetCookieHeaderValue=function()
{
    var parts = ['SID='+this.id];
    if(this.path)
        parts.push('path='+this.path);

    if(this.domain)
        parts.push('domain='+this.domain);

    if(Session.options.persistence ? Session.options.persistence : true)
        parts.push('expires='+msUTCString(this.expiration));

    return parts.join('; ');
};

Session.prototype.destroy=function()
{
    delete Session._sessions[this.id];
};



function msUTCString(ms){
    return (new Date(ms)).toUTCString();
}

function hasOwnProp(o,p)
{
    return Object.prototype.hasOwnProperty.call(o,p);
}

function randomString(bits)
{
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
        rand,
        i,
        ret = '';

    while(bits > 0)
    {
        rand = Math.floor(Math.random()*0x100000000);
        for(i=26; i>0 && bits>0; i-=6, bits-=6)
            ret += chars[0x3F & rand >>> i];
    }
    return ret;
}

function IncorrectArgument(message) {
    this.name = "IncorrectArgument";
    this.message = (message || "");
}
IncorrectArgument.prototype = Error.prototype;

function SessionNotLoaded(message) {
    this.name = "SessionNotLoaded";
    this.message = (message || "");
}
SessionNotLoaded.prototype = Error.prototype;
