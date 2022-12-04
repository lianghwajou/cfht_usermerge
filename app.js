const UserMerge = require("./userMerge");

(async () => {
	try {
		await UserMerge.interactiveMerge();	
		console.log("Completed!");
	} catch (e) {
		console.error(e);
	}
}) ();

