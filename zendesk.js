const createDebug = require("debug");
const debug = createDebug("app:zendesk");
const fetch = require("node-fetch");
const checkStatus = require("./fetch-error");
const Users = require("./users");
const UserIdentities = require("./userIdentities");
const config = require("./config");

class Zendesk {

    static async *fetchUsersByTicketTags (tags, domain, token, pageSize=50, createdAt="2022-01-01") {
    	let url = `https://${domain}/api/v2/search?per_page=${pageSize}&query=tags:${tags} created>${createdAt}&sort_by=created_at&sort_order=asc&include=tickets(users)`;
	    const headers= {'Content-Type': 'application/json',
	    				'Authorization': 'Basic ' + Buffer.from(token).toString('base64')
	    };
	    while (true) {
	    	debug(`fetchUsersByTicketTags url=${url} token=${token}`);
	    	const response = await fetch(url, {
	                method: 'get',
	                headers: headers
	        });
	    	debug(`fetchUsersByTicketTags response status=${response.status}`);
	        checkStatus(response);
	        const data = await response.json();
	    	debug(`fetchUsersByTicketTags `, {data});
	    	debug(`fetchUsersByTicketTags `, {users: data.users});
	        if (data.users) {
	        	for (let userData of data.users)
	        		yield new Users(userData);
	        }
	        if (data.next_page) {
	        	url = data.next_page;
	        } else {
	        	break
	        }

	    }
    }

    static async fetchUserIdentities (user, domain, token, pageSize) {
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
	    debug(`fetchUserIdentities data=${data}`);
        if (data.identities) {
        	for (let identity of data.identities) {
        		user.userIdentities.push(new UserIdentities(identity));
        	}
        }
        return data.identities;
    }

    static async *fetchUsersByName (name, domain, token, pageSize) {
    	let url = `https://${domain}/api/v2/search?per_page=${pageSize}&query=user:"${name}"&sort_by=created_at&sort_order=asc`;
	    const headers= {'Content-Type': 'application/json',
	    				'Authorization': 'Basic ' + Buffer.from(token).toString('base64')
	    };
	    while (true) {
	    	debug(`fetchUsersByName url=${url} token=${token}`);
	    	const response = await fetch(url, {
	                method: 'get',
	                headers: headers
	        });
	    	debug(`fetchUsersByName response status=${response.status}`);
	        checkStatus(response);
	        const data = await response.json();
	    	debug(`fetchUsersByName data=`, {data});
	        if (data.results) {
	        	for (let userData of data.results) {
	        		let user = new Users(userData);
			    	debug(`fetchUsersByName `, {username:user.name}, {name});
	        		if (user.name == name) {
	        			yield user;
	        		}
	        	}
	        }
	        if (data.next_page) {
	        	url = data.next_page;
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