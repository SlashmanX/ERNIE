module.exports = function(id, name, public, bidirectional, leader, currentPage, chatOnly, invitedUsers) {
    this.id					=	id;
    this.name 				= 	name;
    this.public 			= 	public;
    this.bidirectional 		= 	bidirectional;
	this.leader				=	leader;
	this.currentPage		=	currentPage;
	this.chatOnly			=	chatOnly;
	this.invitedUsers		=	invitedUsers;
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
	this.isChatOnly			=	function() {
    	return this.chatOnly;
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
	this.getInvitedUsers	=	function() {
		return this.invitedUsers;
	}
	this.setInvitedUsers	=	function(invitedUsers) {
		this.invitedUsers = invitedUsers;
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
    this.userCount			=	function() {
    	return this.numUsers;
    };
	this.userCanJoin		=	function(userID) {
		// User is invited if they are on the list or if it's public
		if((this.isPublic()) || (userID == this.leader) || (this.invitedUsers == null))
		{
			return true;
		}
		if((this.invitedUsers.indexOf(userID) != -1))
		{
			return true;
		}
		return false;
	}
};