const nock = require("nock");

jest.mock("../userIdentities");
const Zendesk = require("../zendesk");
const Users = require("../users");

describe("Unit test Zendesk APIs", () => {
	it("Tests *fetchUsersByTicketTags", async () => {

		const domain = "cfht.org";
		const token = "123";
		const tags = "cfht_bot";
    	const pageSize = 2;
    	const createdAt = "2022-01-01";
    	const host = `https://${domain}`;
    	const path1 = `/api/v2/search?per_page=${pageSize}&query=tags:${tags} create>${createdAt}&sort_by=created_at&sort_order=asc&include=tickets(users)`;
    	const path2 = `${path1}&page=2`;
	    const headers= {'Content-Type': 'application/json',
	    				'Authorization': 'Bearer ' + token
	    };
		const results1 = {
			users: [
				{
					id: 1
				}, {
					id: 2
				}
			],
			next_page: `${host}${path2}`
		}
		const results2 = {
			users: [
				{
					id: 3
				}, {
					id: 4
				}
			],
			next_page: null
		}
	    let fake_searchPage1 = nock(`${host}`, {
	    	reqHeader : headers
	    }).post(path1)
	    .reply(200, results1)
	    let fake_searchPage2 = nock(`${host}`, {
	    	reqHeader : headers
	    }).post(path2)
	    .reply(200, results2)


	    let users = Zendesk.fetchUsersByTicketTags (tags, domain, token, pageSize, createdAt);
	    let userCnt = 0;
	    for await (const user of users) {
	    	userCnt ++;
	    }

	    expect(userCnt).toBe(4);
	    fake_searchPage1.isDone();
	    fake_searchPage2.isDone();

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
	    				'Authorization': 'Bearer ' + token
	    };
	    let fake_fecthUserIdentities = nock(`${host}`, {
	    	reqHeader : headers
	    }).post(path)
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
    	const host = `https://${domain}`;
    	const path1 = `/api/v2/search?per_page=${pageSize}&query=user:"${name}"&sort_by=created_at&sort_order=asc`;
    	const path2 = `${path1}&page=2`;
	    const headers= {'Content-Type': 'application/json',
	    				'Authorization': 'Bearer ' + token
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
			ok: true,
			results: [
				{
					id: 3,
					name: "Alla-1"
				}, {
					id: 4,
					name: "Alla"
				}
			],
			next_page: null
		}
	    let fake_searchPage1 = nock(`${host}`, {
	    	reqHeader : headers
	    }).post(path1)
	    .reply(200, results1)
	    let fake_searchPage2 = nock(`${host}`, {
	    	reqHeader : headers
	    }).post(path2)
	    .reply(200, results2)


	    let users = Zendesk.fetchUsersByName (name, domain, token, pageSize, createdAt);
	    let userCnt = 0;
	    for await (const user of users) {
	    	userCnt ++;
	    }

	    expect(userCnt).toBe(2);
	    fake_searchPage1.isDone();
	    fake_searchPage2.isDone();

	});

})