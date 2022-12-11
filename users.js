const createDebug = require("debug");
const debug = createDebug("app:users");

class Users {
	constructor (user) {
		this._user = user;
		if (!user.userIdentities) {
			this._user.userIdentities = [];
		}
	}

	get id () {
		return this._user.id;
	}

	get name () {
		return this._user.name;
	}

	get info () {
		return {
			id: this.id,
			name: this.name,
			identities: this.userIdentities
		}
	}

	get extinfo () {
		return {
			id: this.id,
			name: this.name,
			identities: this.userIdentities[0].info
		}
	}

	set userIdentities (userIdentities) {
		this._user.userIdentities = userIdentities;
	}

	get userIdentities () {
		return this._user.userIdentities;
	}

	isTarget (prefix) {
		return (this.userIdentities.length == 1 &&
			this.userIdentities[0].isAnyChannel() && 
			this.userIdentities[0].subtype.includes("CFHTTelegram") &&
			this.userIdentities[0].prefix == prefix &&
			this.userIdentities[0].botId);
	}

	isSrc (prefix) {
		return (this.userIdentities.length == 1 &&
			this.userIdentities[0].isAnyChannel() && 
			this.userIdentities[0].subtype == "Telegram Channel" &&
			this.userIdentities[0].prefix == prefix &&
			!this.userIdentities[0].botId);
	}
}

module.exports = Users;