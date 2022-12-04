const createDebug = require("debug");
const debug = createDebug("app:userMerge_test");

const Config = require("../config");
const Zendesk = require("../zendesk");
const Users = require("../users");
const UserIdentities = require("../userIdentities");
const UserMerge = require("../userMerge");
jest.mock("../zendesk");

describe("Unit test UerMerge class", () => {
	it("test *findPair", async () => {
		const targetPrefix = "1111";
		const targetSubtype = "CFHTTelegram";
		const botId = "5555";
		const srcPrefix = "9999";
		const srcSubtype = "Telegram Channel";
		jest.spyOn(Config, 'targetPrefix', 'get').mockReturnValue(targetPrefix)
		jest.spyOn(Config, 'srcPrefix', 'get').mockReturnValue(srcPrefix)
		const userData = [{
			id: 1,			// merge with 4
			name: "aaa",
		}, {
			id: 2,			// merge with 5
			name: "bbb",
		}, {
			id: 3,			// nothing to merge
			name: "ccc"
		}, {
			id: 4,
			name: "aaa"
		}, {
			id: 5,
			name: "bbb"
		}, {
			id: 6,
			name: "aaa1"
		}, {
			id: 7,
			name: "ddd"		// already merged
		}];
		const users = userData.map(user => {
			return new Users(user);
		});
		const telegramId = ["9001","9002","9003", "9004"];
		const identitiesData = [{
			user_id: 1,
			type: "any_channel",
			value: `${targetPrefix}:${botId}:${telegramId[0]}`,
			subtype_name: `${targetSubtype}`
		}, {
			user_id: 2,
			type: "any_channel",
			value: `${targetPrefix}:${botId}:${telegramId[1]}`,
			subtype_name: `${targetSubtype}`

		}, {
			user_id: 3,
			type: "any_channel",
			value: `${targetPrefix}:${botId}:${telegramId[2]}`,
			subtype_name: `${targetSubtype}`
		}, {
			user_id: 4,
			type: "any_channel",
			value: `${srcPrefix}:${telegramId[0]}:`,
			subtype_name: `${srcSubtype}`
		}, {
			user_id: 5,
			type: "any_channel",
			value: `${srcPrefix}:${telegramId[1]}:`,
			subtype_name: `${srcSubtype}`
		}, {
			user_id: 6,
			type: "any_channel",
			value: `${targetPrefix}:${botId}:${telegramId[3]}`,
			subtype_name: `${srcSubtype}`
		}, {
			user_id: 7,
			type: "any_channel",
			value: `${targetPrefix}:${botId}:${telegramId[4]}`,
			subtype_name: `${targetSubtype}`
		}, {
			user_id: 7,
			type: "any_channel",
			value: `${targetPrefix}:${telegramId[4]}`,
			subtype_name: `${srcSubtype}`
			
		}
		];
		const identities = identitiesData.map(identity => {
			return new UserIdentities(identity);
		});
		Zendesk.fetchUsersByTicketTags.mockReturnValueOnce(users.slice(0,3));
		Zendesk.fetchUserIdentities.mockImplementation((user, domain,token) => {
			const ids = identities.filter(identity => {
				return (user.id == identity.userId);
			})
			user.userIdentities = ids;
			return ids;
		});
		Zendesk.fetchUsersByName.mockImplementation((name, domain, token) => {
			return users.filter(user => {
				return user.name.includes(name);
			})
		});

		const pairs = UserMerge.findPairs();
		const userPair1 = await pairs.next();
		debug({userPair1});
		const userPair2 = await pairs.next();
		const userPair3 = await pairs.next();

		expect(userPair1.value.target.id).toBe(1);
		expect(userPair1.value.src.id).toBe(4);
		expect(userPair2.value.target.id).toBe(2);
		expect(userPair2.value.src.id).toBe(5);
		expect(userPair3.done).toBe(true);
	})
})