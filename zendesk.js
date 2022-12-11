const createDebug = require("debug");
const debug = createDebug("app:zendesk");
const fetch = require("node-fetch");
const checkStatus = require("./fetch-error");
const Users = require("./users");
const UserIdentities = require("./userIdentities");
const Config = require("./config");

class Zendesk {

	static fetchUsersByTicketTagsUrl (tags, domain, pageSize, createdAt) {
    	return `https://${domain}/api/v2/search?per_page=${pageSize}&query=tags:${tags} created>=${createdAt}&sort_by=created_at&sort_order=asc&include=tickets(users)`;
	}

    static async *fetchUsersByTicketTags (tags, domain, token, pageSize=50, createdAt="2022-01-01") {
    	let lastCreatedAt = createdAt;
	    const headers= {'Content-Type': 'application/json',
	    				'Authorization': 'Basic ' + Buffer.from(token).toString('base64')
	    };
	    Config.lastCreatedAt = createdAt;
	    let page=1;
		let nextUrl = this.fetchUsersByTicketTagsUrl(tags, domain, pageSize, lastCreatedAt);
	    while (true) {
	    	debug(`fetchUsersByTicketTags url=${nextUrl} token=${token}`);
	    	const response = await fetch(nextUrl, {
	                method: 'get',
	                headers: headers
	        });
	    	debug(`fetchUsersByTicketTags response status=${response.status}`);
	        checkStatus(response);
	        const data = await response.json();
	    	debug(`fetchUsersByTicketTags `, {user_count: data.count}, {users: data.users});
	    	console.log(`fetchUsersByTicketTags `, {ticket_count: data.count});
	        if (data.users) {
	        	for (let userData of data.users)
	        		yield new Users(userData);
	        }
	        if (page++*pageSize >= Config.maxResults) {
	        	// Zendesk maximum number results
	        	page = 1;
	        	lastCreatedAt = data.results[data.results.length -1].created_at;
	    		debug(`fetchUsersByTicketTags new lastCreatedAt=${lastCreatedAt}`);
				nextUrl = this.fetchUsersByTicketTagsUrl(tags, domain, pageSize, lastCreatedAt);
	        	continue;
	        }
	        if (data.next_page) {
	        	nextUrl = data.next_page;
	        } else {
	        	Config.lastCreatedAt = data.results[data.results.length -1].created_at;
	        	break
	        }

	    }
    }

    static async fetchUserIdentities (user, domain, token, pageSize) {
    	try {
	    	let url = `https://${domain}/api/v2/users/${user.id}/identities`;
		    const headers= {'Content-Type': 'application/json',
		    				'Authorization': 'Basic ' + Buffer.from(token).toString('base64')
		    };
		   	debug(`fetchUserIdentities url=${url} token=${token}`);
	    	const response = await fetch(url, {
	                method: 'get',
	                headers: headers
	        });
		    debug(`fetchUserIdentities response status=${response.status}`);
	        checkStatus(response);
	        const data = await response.json();
		    debug(`fetchUserIdentities `, {identityCount: data.count}, {data});
	        if (data.identities) {
	        	for (let identity of data.identities) {
	        		user.userIdentities.push(new UserIdentities(identity));
	        	}
	        }
	        return data.identities;
    	} catch (e) {
		    debug(`fetchUserIdentities `, {e});
		    return null;
    	}
    }

    static fetchUsersByNameUrl (name, domain, pageSize, createdAt) {
    	return `https://${domain}/api/v2/search?per_page=${pageSize}&query=user:"${name}" created>=${createdAt}&sort_by=created_at&sort_order=asc`;
    }

    static async *fetchUsersByName (name, domain, token, pageSize, createdAt="2022-01-01") {
    	let lastCreatedAt = createdAt;
	    const headers= {'Content-Type': 'application/json',
	    				'Authorization': 'Basic ' + Buffer.from(token).toString('base64')
	    };
	    let page=1;
		let nextUrl = this. fetchUsersByNameUrl(name, domain, pageSize, lastCreatedAt);
	    while (true) {
	    	debug(`fetchUsersByName url=${nextUrl} token=${token}`);
	    	const response = await fetch(nextUrl, {
	                method: 'get',
	                headers: headers
	        });
	    	debug(`fetchUsersByName response status=${response.status}`);
	        checkStatus(response);
	        const data = await response.json();
	    	debug(`fetchUsersByName `, {userCount: data.count}, {data});
	    	console.log(`fetchUsersByName `, {userCount: data.count});
	        if (data.results) {
	        	for (let userData of data.results) {
	        		let user = new Users(userData);
			    	debug(`fetchUsersByName `, {username:user.name}, {name});
	        		if (user.name == name) {
	        			yield user;
	        		}
	        	}
	        }
	        if (page++*pageSize >= Config.maxResults) {
	        	// Zendesk maximum number results
	        	page = 1;
	        	lastCreatedAt = data.results[data.results.length -1].created_at;
	    		debug(`fetchUsersByName new lastCreatedAt=${lastCreatedAt}`);
				nextUrl = this.fetchUsersByNameUrl(name, domain, pageSize, lastCreatedAt);;
	        	continue;
	        }
	        if (data.next_page) {
	        	nextUrl = data.next_page;
	        } else {
	        	break
	        }

	    }

    }

    static async mergeUsers (targetUser, srcUser, domain, token) {

    	const url = `https://${domain}/api/v2/users/${srcUser.id}/merge`;
    	const body = {
    		user: {
    			id: targetUser.id
    		}
        }

	    const headers= {'Content-Type': 'application/json',
	    				'Authorization': 'Basic ' + Buffer.from(token).toString('base64')
	    };
	    debug(`mergeUsers url=${url} token=${token}  body=${body}`);
	    const response = await fetch(url, {
            method: 'put',
        	body: JSON.stringify(body),
            headers: headers
        });
	    debug(`mergeUsers response status=${response.status}`);
	    checkStatus(response);
        const data = await response.json();
	    debug(`mergeUsers data=`, {data});

        if (data.user) {
        	debug(`mergeUsers from ${srcUser} into ${targetUser} successfully`);
        }
    }
}

module.exports = Zendesk;