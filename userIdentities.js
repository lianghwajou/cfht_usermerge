class UserIdentities {

	constructor (identity) {
		this._identity = identity;
		this.#splitId(this._identity.value);
	}

	#splitId (extId) { 
		let ids = extId.split(":");
		this._prefix = ids[0];
		if (this.subtype == "CFHTTelegram") {
			this._botId = ids[1];
			this._telegramId = ids[2];
		} 
		if (this.subtype == "Telegram Channel") {
			this._telegramId = ids[1];
			this._botId = "";
			this._username = ids[2];
		}
	}

	isAnyChannel () {
		return (this.type=="any_channel");
	}

	get info() {
		return {
			userId: this.userId,
			type: this.type,
			value: this.value,
			subtype: this.subtype,
			prefix: this.prefix,
			botId: this.botId,
			telegramId: this.telegramId
		}
	}

	get botId () {
		return this._botId;
	}
	
	get prefix () {
		return this._prefix;
	}

	get subtype () {
		return this._identity.subtype_name;
	}

	get telegramId () {
		return this._telegramId
	}

	get type () {
		return this._identity.type;
	}

	get userId () {
		return this._identity.user_id;

	}

	get value () {
		return this._identity.value;

	}


}

module.exports = UserIdentities;