module.exports = function(id, name, loggedIn, sessionID) {
    this.id			=	id;
    this.name 		= 	name;
    this.loggedIn 	= 	loggedIn;
    this.sessionID 	= 	sessionID;
    this.session;
    this.numTabs 	= 	0;
    // Methods
    this.setId 		= 	function(id) {
        this.id = id
    };
    this.getId		=	function() {
    	return this.id;
    };
    this.setName 	= 	function(name) {
        this.nam = name;
    };
    this.getName	=	function() {
    	return this.name;
    };
    this.isLoggedIn = 	function() {
        return this.loggedIn;
    };
    this.logIn		=	function() {
    	this.loggedIn = true;
    };
    this.logOut		=	function() {
    	this.loggedIn = false;
    };
    this.setSession = 	function(session) {
        this.session = session
    };
    this.getSession	=	function() {
    	return this.session;
    };
};
