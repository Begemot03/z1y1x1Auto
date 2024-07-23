const fs = require("fs");
const env = require("../utils/customJsEnv");

function reviewDetails() {
    console.log("\n\n\n=====================================\n\n\tReview Details\n\n=====================================");

    const vkLog = JSON.parse(fs.readFileSync(env.GLOBAL.DIRNAME + env.VK.VK_FUTURES_LOG_FILE_PATH));
    const z1Log = JSON.parse(fs.readFileSync(env.GLOBAL.DIRNAME + env.Z1.LOG_FILE_PATH));

    //console.log(vkLog);
    //console.log(z1Log);

    // vk logs
    console.log("\n\n------\tPOSTS RESULT DETAILS------\n\n");

    // Output Unique entry names and posts
    const uniqEntryNames = [];
    const uniquePosts = [];
    let postCount = 0;

    vkLog.forEach(el => {
        if(uniqEntryNames.indexOf(el.entryName) === -1) {
            uniqEntryNames.push(el.entryName);
        }

        if(uniquePosts.indexOf(el.link) === -1) {
            uniquePosts.push(el.link);
        }

        postCount++;
    });

    console.log(`Unique entry names:\n\n( ${uniqEntryNames.join(" / ")} )\n`);
    console.log(`Unique posts:\t${uniquePosts.length}`);
    console.log(`Futures posts:\t${postCount}`);

    // z1 logs
    console.log("\n\n------\tWORK RESULT DETAILS------\n\n");

    // Get result
    let errors = 0;
    let newPublics = 0;
    let successesPublic = 0;
    let postsCount = -1;

    z1Log.forEach(el => {
        if(el.STATUS === env.GLOBAL.OPERATIONS_STATUS.ERROR) {
            errors++;
            postsCount++;
        }
        
        if(el.STATUS === env.GLOBAL.OPERATIONS_STATUS.SUCCESS) {
            successesPublic++;
            postsCount++;
        }

        if(el.DATA.includes("found")) {
            newPublics++;
        }
    });

    console.log(`ERRORS:\t\t${errors}`);
    console.log(`SUCCESS:\t${successesPublic}`);
    console.log(`New publics:\t${newPublics}`);
    console.log(`Posts count:\t${postsCount}`);

    console.log("\n\n\n=====================================\n\n\tEND\n\n=====================================");
}

module.exports = {
    reviewDetails,
}