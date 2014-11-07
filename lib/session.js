
/**
 * Module exports.
 */
module.exports = exports = Session;

function Session(arg, opts)
{
    if (!(this instanceof Session))
    {
        Session.options = arg || {
            enabled: false,
            persistence: false,
            lifetime: 86400
        };

        if(Session.options.enabled)
        {
            if(Session.options.lifetime){
                var persistence = Session.options.persistence;
                Session.options.persistence = persistence ? persistence : true;
            }
            else
            {
                Session.options.persistent = false;
                Session.options.lifetime = 86400;
            }
        }
    }
    else
    {
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
    if(!this.options.enabled)
        return undefined;

    var id = this.getIdFromRequest(request), session;

    if(hasOwnProp(this.sessions,id))
        session = this.sessions[id];
    else
    {
        this.sessions[id] = session = new this(id, {
            path:   urlParser.parse(request.url, true).pathname,
            domain: request.domain
        });
    }

    session.expiration = (+new Date())+this.options.lifetime*1000;
    if(!timeout)
        timeout = setTimeout(cleanup,60000);

    return session;
};

Session.cleanup = function()
{
    var now = +new Date(),
        next = Infinity;
    timeout = null;

    for(var id in this.sessions)
    {
        if(hasOwnProp(this.sessions,id))
        {
            if(this.sessions[id].expiration < now)
                delete this.sessions[id];
            else
                next = (next<sessions[id].expiration) ? next : this.sessions[id].expiration;
        }
    }

    if(next<Infinity)
        timeout = setTimeout(cleanup,next - (+new Date()) + 1000);
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

    if(this.constructor.options.persistence ? this.constructor.options.persistence : true)
        parts.push('expires='+msUTCString(this.expiration));

    return parts.join('; ');
};

Session.prototype.destroy=function()
{
    delete this.sessions[this.id];
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
