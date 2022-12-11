const createDebug = require("debug");
const debug = createDebug("app:userMerge");
const Config = require("./config");
const Zendesk = require("./zendesk");

class UserMerge {

	static async *findPairs (createdAt) {
		let counter = 0;
		const users = Zendesk.fetchUsersByTicketTags(Config.tags, Config.domain, Config.token, Config.pageSize, createdAt || Config.createdAt);
		for await (const user of users) {
			counter++;
			debug(`Processing target user ${counter} `, {user: user.info});
			console.log(`Processing target user ${counter} `, {user: user.info});
			try {
				await Zendesk.fetchUserIdentities(user, Config.domain, Config.token);
				if (!user.userIdentities.length) continue; 
				debug({targetIdentities: user.userIdentities[0].info});
				if (user.isTarget(Config.targetPrefix)) {
					const srcUsers = Zendesk.fetchUsersByName(user.name, Config.domain, Config.token, Config.pageSize);
					for await (const srcUser of srcUsers) {
						if (user.id == srcUser.id) continue
						await Zendesk.fetchUserIdentities(srcUser, Config.domain, Config.token);
						debug({srcUser: srcUser.info});
						if (!srcUser.userIdentities.length) continue; 
						debug({srcIdentities: srcUser.userIdentities[0].info});
						if (srcUser.isSrc(Config.srcPrefix) &&
							user.userIdentities[0].telegramId == srcUser.userIdentities[0].telegramId) {
							debug(`findPairs`, {target: user.info, src: srcUser.info});
							yield {target: user, src: srcUser};
							break;
						}
					}
				}
			} catch (e) {
				debug("Failed to process the user.");
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

	static async batchMerge (createdAt) {
		let counter = 0;
		for await (const pair of this.findPairs(createdAt)) {
			counter++;
			debug(`batchMerge pair ${counter}`, {target: pair.target.extinfo}, {src: pair.src.extinfo});
			console.log({target: pair.target.extinfo}, {src: pair.src.extinfo});
			await Zendesk.mergeUsers (pair.target, pair.src, Config.domain, Config.token);
			console.log(`Merged pair ${counter}`);
		}
		debug(`batchMerge merged ${counter} users.`);
	}

}

module.exports = UserMerge;