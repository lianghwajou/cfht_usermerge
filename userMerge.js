const createDebug = require("debug");
const debug = createDebug("app:userMerge");
const Config = require("./config");
const Zendesk = require("./zendesk");

class UserMerge {

	static async *findPairs () {
		const users = Zendesk.fetchUsersByTicketTags(Config.tags, Config.domain, Config.token, Config.pageSize, Config.createdAt);
		for await (const user of users) {
			await Zendesk.fetchUserIdentities(user, Config.domain, Config.token);
			debug({user: user.info});
			debug({targetIdentities: user.userIdentities[0].info});
			if (user.isTarget(Config.targetPrefix)) {
				const srcUsers = Zendesk.fetchUsersByName(user.name, Config.domain, Config.token);
				for await (const srcUser of srcUsers) {
					await Zendesk.fetchUserIdentities(srcUser, Config.domain, Config.token);
					debug({srcUser: srcUser.info});
					debug({srcIdentities: srcUser.userIdentities[0].info});
					if (srcUser.isSrc(Config.srcPrefix) &&
						user.userIdentities[0].telegramId == srcUser.userIdentities[0].telegramId) {
						debug(`findPairs`, {target: user.info, src: srcUser.info});
						yield {target: user, src: srcUser};
						break;
					}
				}
			}
		}
	}

	static async interactiveMerge () {
		const readlineSync = require('readline-sync');
		for await (const pair of this.findPairs()) {
			debug(`interactiveMerge`, {target: pair.target.extinfo}, {src: pair.src.extinfo});
			console.log({target: pair.target.extinfo}, {src: pair.src.extinfo});
			let answer = readlineSync.question(`Merge these two users? `);
			if (answer == "y") {
				await Zendesk.mergeUsers (pair.target, pair.src, Config.domain, Config.token);
				console.log('Merged.');
			} else {
				console.log(`Skip merge!`);
			}
		}
	}
}

module.exports = UserMerge;