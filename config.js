const createDebug = require("debug");
const debug = createDebug("app:config");
const yaml = require ("js-yaml");
const fs = require ("fs");

let config, tokens;

class Config {
	static _config;
	static _tokens;

	static {
		try {
			const configFile = fs.readFileSync("./config.yml", "utf8");
			this._config = yaml.load(configFile);
			debug({config: this._config});
			const tokensFile = fs.readFileSync("./tokens.yml", "utf8");
			this._tokens = yaml.load(tokensFile);
			debug({tokens: this._tokens});
		} catch (e) {
			console.error(`Faled to read configuration file(s) ${e}`);
			throw e;
		}		
	}

	static get domain () {
		return this._config.zendesk.domain;
	}

	static get pageSize () {
		return this._config.zendesk.pageSize;
	}

	static get createdAt () {
		return this._config.zendesk.createdAt;
	}

	static get token () {
		return this._tokens.zendesk.apiToken;
	}

	static get tags () {
		return this._config.zendesk.tags;
	}

	static get targetPrefix () {
		return this._config.zendesk.targetPrefix;
	}

	static get srcPrefix () {
		return this._config.zendesk.srcPrefix;
	}
}

module.exports = Config;