const path = require("path");
createDebugLog();
const createDebug = require("debug");
const debug = createDebug("app");
const {execSync} = require('child_process');
const UserMerge = require("./userMerge");
const Config = require("./config");

const sleepTime = 2 * 60 * 60; // 2 hours

(async () => {
    let createdAt = Config.createdAt;
    let counter = 0;
    while (true) {
        debug(`User Merge Run ${counter} with createdAt set to ${createdAt} starts at ${new Date(Date.now()).toISOString()} `);
        console.log(`User Merge Run ${counter} with createdAt set to ${createdAt} starts at ${new Date(Date.now()).toISOString()} `);
        try {
            debug(`query users createdAt ${createdAt}`);
            await UserMerge.batchMerge(createdAt);   
        } catch (e) {
            console.error(e);
        }
        debug(`User Merge Run ${counter} completed at ${new Date(Date.now()).toISOString()}`);
        console.log(`User Merge Run ${counter} completed at ${ new Date(Date.now()).toISOString()}`);
        execSync(`sleep ${sleepTime}`);
        createdAt = Config.lastCreatedAt;
        counter ++;
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

