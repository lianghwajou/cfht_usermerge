jest.mock("fs");
const fs = require ("fs");

describe("Unit test Config class", () => {
	it("Test yaml parsing", () => {
		const configYaml = 
`
---
zendesk:
  domain: "cfht.org"
  tags: "cfht_bot"
  pageSize: 50
redis:
  url: "redis://127.0.0.1:6379"
`;
		const tokenYaml =
`
---
zendesk:
  apiToken: "123456"
`;
		fs.readFileSync.mockReturnValueOnce(configYaml).mockReturnValueOnce(tokenYaml);

		const Config = require("../config");

		expect(Config.domain).toBe("cfht.org");
		expect(Config.token).toBe("123456");

	})
})