module.exports = function(id, name, public, bidirectional, leader, currentPage) {
    this.id					=	id;
    this.name 				= 	name;
    this.public 			= 	public;
    this.bidirectional 		= 	bidirectional;
	this.leader				=	leader;
	this.currentPage		=	currentPage;
    this.numUsers			=	0;
    this.users			 	= 	[];
    // Methods
    this.setId 				= 	function(id) {
        this.id = id
    };
    this.getId				=	function() {
    	return this.id;
    };
    this.setName 			= 	function(name) {
        this.name = name;
    };
    this.getName			=	function() {
    	return this.name;
    };
    this.isPublic			= 	function() {
        return this.public;
    };
    this.isBidirectional	=	function() {
    	return this.bidirectional;
    };
    this.addUser			=	function(newUserID) {
    	if(this.users.indexOf(newUserID) == -1)
		{
			this.users.push(newUserID);
	    	this.numUsers++;
		}
    };
	this.setLeader			=	function(newLeader) {
		this.leader = newLeader;
	}
	this.getLeader			=	function() {
		return this.leader;
	}
	this.setCurrentPage		=	function(newPage) {
		this.currentPage = newPage;
	}
	this.getCurrentPage		=	function() {
		return this.currentPage;
	}
    this.removeUser			= 	function(userIDToRemove) {
        this.users.splice(this.users.indexOf(userIDToRemove), 1);
        this.numUsers--;
    };
    this.userCount	=	function() {
    	return this.numUsers;
    };
};