
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
            throw new IncorrectArgument("Session options cant be "+typeof opts+".");
        if(typeof arg != "number")
            throw new IncorrectArgument("Session id cant be "+typeof arg+".");

        this.id     = arg;
        this.data   = {};
        this.path   = opts.path || '/';
        this.domain = opts.domain;
    }
}

Session.sessions = {};
Session.timeout = undefined;

Session.lookupOrCreate = function(request)
{
    if(!Session.options.enabled)
        return undefined;

    var id = Session.getIdFromRequest(request), session;

    if(hasOwnProp(Session.sessions,id))
    {
        session = Session.sessions[id];
        ServeMe.call("session", session);
    }
    else
    {
        session = new Session(id, {
            path:   urlParser.parse(request.url, true).pathname,
            domain: request.domain
        });

        if(ServeMe.call("new_session", session) === true)
            Session.sessions[id] = session;
        else
            session = undefined;
    }

    session.expiration = (+new Date())+Session.options.lifetime*1000;
    if(!timeout)
        timeout = setTimeout(cleanup,60000);

    return session;
};

Session.cleanup = function()
{
    var now = +new Date(),
        next = Infinity;
    timeout = null;

    for(var id in Session.sessions)
    {
        if(hasOwnProp(Session.sessions,id))
        {
            if(Session.sessions[id].expiration < now){
                ServeMe.call("end_session", Session.sessions[id]);
                delete Session.sessions[id];
            }
            else
                next = (next<sessions[id].expiration) ? next : Session.sessions[id].expiration;
        }
    }

    if(next<Infinity)
        timeout = setTimeout(cleanup,next - (+new Date()) + 1000);
};

Session.reset = function(){
    Session.sessions = {};
    ServeMe = undefined;
};

Session.prototype.getIdFromRequest = function(request)
{
    var m;
    if(request.headers.cookie &&
      (m = /SID=([^ ,;]*)/.exec(request.headers.cookie)[1]) &&
      hasOwnProp(this.sessions,m))
        return m;

    if(this.sessionID)
        return this.sessionID;
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
    delete Session.sessions[this.id];
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
