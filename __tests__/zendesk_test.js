const createDebug = require("debug");
const debug = createDebug("test:zendesk_test");
const nock = require("nock");

jest.mock("../userIdentities");
const Zendesk = require("../zendesk");
const Users = require("../users");
const Config = require("../config");

describe("Unit test Zendesk APIs", () => {
	it("Tests *fetchUsersByTicketTags", async () => {

		const domain = "cfht.org";
		const token = "123";
		const tags = "cfht_bot";
    	const pageSize = 2;
    	const createdAt = "2022-01-01";
    	const nextCreatedAt = "2022-02-01";
    	const host = `https://${domain}`;
    	const path1 = `/api/v2/search?per_page=${pageSize}&query=tags:${tags} created>=${createdAt}&sort_by=created_at&sort_order=asc&include=tickets(users)`;
    	const path2 = `${path1}&page=2`;
    	const path3 = `/api/v2/search?per_page=${pageSize}&query=tags:${tags} created>=${nextCreatedAt}&sort_by=created_at&sort_order=asc&include=tickets(users)`;
	    const headers= {'Content-Type': 'application/json',
	    				'Authorization': 'Bearer ' + Buffer.from(token).toString('base64')
	    };
	    // page 1
		const results1 = {
			users: [
				{
					id: 1
				}, {
					id: 2
				}
			],
			count: 4,
			next_page: `${host}${path2}`
		}
		// page 2
		const results2 = {
			results: [
				{},
				{created_at: nextCreatedAt}
			],
			users: [
				{
					id: 3
				}, {
					id: 4
				}
			],
			count: 4,
			next_page: null
		}
		// start new search
		const results3 = {
			users: [
				{
					id: 5
				}, {
					id: 6
				}
			],
			count: 2,
			next_page: null
		}

		// page 1
	    let fake_searchPage1 = nock(`${host}`, {
	    	reqHeader : headers
	    }).get(path1)
	    .reply(200, results1)
	    // page 2
	    let fake_searchPage2 = nock(`${host}`, {
	    	reqHeader : headers
	    }).get(path2)
	    .reply(200, results2)
	    // new search page 1
	    let fake_newSearchPage1 = nock(`${host}`, {
	    	reqHeader : headers
	    }).get(path3)
	    .reply(200, results3)
		jest.spyOn(Config, 'maxResults', 'get').mockReturnValue(4)


	    let users = Zendesk.fetchUsersByTicketTags (tags, domain, token, pageSize, createdAt);
	    let userCnt = 0;
	    for await (const user of users) {
	    	userCnt ++;
	    }

	    expect(userCnt).toBe(6);
	    fake_searchPage1.isDone();
	    fake_searchPage2.isDone();
	    fake_newSearchPage1.isDone();

	});

	it("Tests fetchUserIdentities", async () => {

		const userId = 1;
		const prefix1="1001";
		const prefix2="1002";
		const telegramId="9001";
		const mockUser = new Users({
			id: userId,
			name: "Alla",
			userIdentities: []
		});
		const mockUserIdentities = [{
			id: 1,
			user_id: userId,
			type: "any_channel",
			value: `${prefix1}:${telegramId}`
			}, {
			id: 2,
			user_id: userId,
			type: "any_channel",
			value: `${prefix2}:${telegramId}`
			}
		];
		const results= {
			identities: mockUserIdentities
		};
		const domain = "cfht.org";
		const token = "123";
    	const host = `https://${domain}`;
    	const path = `/api/v2/users/${mockUser.id}/identities`;
	    const headers= {'Content-Type': 'application/json',
	    				'Authorization': 'Bearer ' + Buffer.from(token).toString('base64')
	    };
	    let fake_fecthUserIdentities = nock(`${host}`, {
	    	reqHeader : headers
	    }).get(path)
	    .reply(200, results);

	    let userIdentities = await Zendesk.fetchUserIdentities(mockUser, domain, token);

	    expect(userIdentities).toMatchObject(mockUserIdentities);
	    expect(mockUser.userIdentities.length).toBe(mockUserIdentities.length);
	    fake_fecthUserIdentities.isDone();

	})
	it("Tests fetchUsersByName", async () => {

		const name = "Alla";
		const domain = "cfht.org";
		const token = "123";
    	const pageSize = 2;
    	const createdAt = "2022-01-01";
    	const nextCreatedAt = "2022-02-01";
    	const host = `https://${domain}`;
    	const path1 = `/api/v2/search?per_page=${pageSize}&query=user:"${name}" created>=${createdAt}&sort_by=created_at&sort_order=asc`;
    	const path2 = `${path1}&page=2`;
    	const path3 = `/api/v2/search?per_page=${pageSize}&query=user:"${name}" created>=${nextCreatedAt}&sort_by=created_at&sort_order=asc`;
	    const headers= {'Content-Type': 'application/json',
	    				'Authorization': 'Bearer ' + Buffer.from(token).toString('base64')
	    };
		const results1 = {
			results: [
				{
					id: 1,
					name: "Alla"
				}, {
					id: 2,
					name: "alla"
				}
			],
			next_page: `${host}${path2}`
		}
		const results2 = {
			results: [
				{
					id: 3,
					name: "Alla-1"
				}, {
					id: 4,
					name: "Alla",
					created_at: nextCreatedAt
				}
			],
			next_page: null
		}
		const results3 = {
			results: [
				{
					id: 5,
					name: "Alla-2"
				}, {
					id: 6,
					name: "Alla"
				}
			],
			next_page: null
		}
	    let fake_searchPage1 = nock(`${host}`, {
	    	reqHeader : headers
	    }).get(path1)
	    .reply(200, results1)
	    let fake_searchPage2 = nock(`${host}`, {
	    	reqHeader : headers
	    }).get(path2)
	    .reply(200, results2)
	    let fake_nextSearchPage1 = nock(`${host}`, {
	    	reqHeader : headers
	    }).get(path3)
	    .reply(200, results3)


	    let users = Zendesk.fetchUsersByName (name, domain, token, pageSize, createdAt);
	    let userCnt = 0;
	    for await (const user of users) {
	    	userCnt ++;
	    }

	    expect(userCnt).toBe(3);
	    fake_searchPage1.isDone();
	    fake_searchPage2.isDone();
	    fake_nextSearchPage1.isDone();

	});

})