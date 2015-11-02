# Internal route structure
This document defines how do the internal routes work and how is their structure.


### Routes without parameters

```javascript
//route: /arg0/arg1

simpleRoutesDB = {
	"/arg0/arg1": {
		"_action": new Action(callback)
	}
}
```

### Routes with parameters
The path of a route will be split in arguments by "/". Each argument will become a new level on the routeDB.

```javascript
//route: /arg0/arg1/:param

complexRouteDB = {
	"arg0": {
		"arg1": {
			"_action": new Action(callback)
		}
	}
}
```