
/**
 * Module exports.
 */
module.exports = exports = Session;

function Session(options)
{
    if(options && options.enabled)
    {

    }
}

var sessions={}, timeout;

function hasOwnProp(o,p)
{
    return Object.prototype.hasOwnProperty.call(o,p);
}

function lookupOrCreate(req,opts)
{
    var id, session;

    opts = opts || {};

    // find or generate a session ID
    id = idFromRequest(req,opts);

    // if the session exists, use it
    if(hasOwnProp(sessions,id))
        session=sessions[id];// otherwise create a new session object with that ID, and store it
    else
    {
        session=new Session(id,opts);
        sessions[id]=session;
    }

    // set the time at which the session can be reclaimed
    session.expiration= (+new Date())+session.lifetime*1000;
    // make sure a timeout is pending for the expired session reaper
    if(!timeout)
        timeout=setTimeout(cleanup,60000);

    return session;
}

function cleanup()
{
    var id,
        now,
        next;
    now = +new Date();
    next=Infinity;
    timeout=null;

    for(id in sessions) if(hasOwnProp(sessions,id)){
        if(sessions[id].expiration < now)
            delete sessions[id];
        else
            next = next<sessions[id].expiration ? next : sessions[id].expiration;
    }

    if(next<Infinity)
        timeout=setTimeout(cleanup,next - (+new Date()) + 1000);
}

function idFromRequest(req,opts)
{
    var m;

    // look for an existing SID in the Cookie header for which we have a session
    if(req.headers.cookie &&
      (m = /SID=([^ ,;]*)/.exec(req.headers.cookie)) &&
      hasOwnProp(sessions,m[1]))
        return m[1];

    // otherwise we need to create one
    // if an ID is provided by the caller in the options, we use that
    if(opts.sessionID)
        return opts.sessionID;
    // otherwise a 64 bit random string is used
    return randomString(64);
}

function Session(id,opts)
{
    this.id=id;
    this.data={};
    this.path=opts.path||'/';
    this.domain=opts.domain;

    // if the caller provides an explicit lifetime, then we use a persistent cookie
    // it will expire on both the client and the server lifetime seconds after the last use
    // otherwise, the cookie will exist on the browser until the user closes the window or tab,
    // and on the server for 24 hours after the last use
    if(opts.lifetime){
        this.persistent = 'persistent' in opts ? opts.persistent : true;
        this.lifetime=opts.lifetime;
    }
    else
    {
        this.persistent=false;
        this.lifetime=86400;
    }
}

// randomString returns a pseude-random ASCII string which contains at least the specified number of bits of entropy
// the return value is a string of length ⌈bits/6⌉ of characters from the base64 alphabet
function randomString(bits)
{
    var chars='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
        rand,
        i,
        ret = '';

    while(bits > 0)
    {
        rand=Math.floor(Math.random()*0x100000000); // 32-bit integer
        for(i=26; i>0 && bits>0; i-=6, bits-=6)
            ret += chars[0x3F & rand >>> i];
    }
    return ret;
}

Session.prototype.getSetCookieHeaderValue=function()
{
    var parts = ['SID='+this.id];

    if(this.path)
        parts.push('path='+this.path);
    if(this.domain)
        parts.push('domain='+this.domain);
    if(this.persistent)
        parts.push('expires='+dateUTCString(this.expiration));
    return parts.join('; ');
};

// from milliseconds since the epoch to Cookie 'expires' format which is Wdy, DD-Mon-YYYY HH:MM:SS GMT
function dateUTCString(ms){
    return (new Date(ms)).toUTCString();
}

Session.prototype.destroy=function()
{
    delete sessions[this.id];
};
