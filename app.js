const path = require("path");
createDebugLog();
const UserMerge = require("./userMerge");

(async () => {
	try {
		await UserMerge.interactiveMerge();	
		console.log("Completed!");
	} catch (e) {
		console.error(e);
	}
}) ();

function createDebugLog () {
    const util = require('util');
    const createDebugger = require('debug');
    const debugStream = createLogStream('debug');
    createDebugger.log = function(...args) {
        return debugStream.write(util.format(...args) + '\n');
    }    
}

function createLogStream (prefix) {
    let FileStreamRotator = require('file-stream-rotator');
    let fs = require('fs');
    let filename = `${prefix}-%DATE%.log`;

    let  logDirectory = path.join(__dirname, 'logs');
    // ensure log directory exists
    fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
    // create a rotating write stream
    let  accessLogStream = FileStreamRotator.getStream({
        date_format: 'YYYYMMDD',
        filename: path.join(logDirectory, filename),
        frequency: 'daily',
        verbose: false
    })
    return accessLogStream;
}

