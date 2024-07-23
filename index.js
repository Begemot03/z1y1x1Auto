const z1ParseWorker = require("./workers/z1x1y1/parseDataWorker");
const { setScenarios } = require("./workers/z1x1y1/setScenarioWorker");
const { getLinks } = require("./workers/z1x1y1/parseFuturesLinks");
const env = require("./utils/customJsEnv");
const { reviewDetails } = require("./utils/reviewDetails");

//z1 file html text
//const z1HtmlFile = fs.readFileSync(__dirname + env.Z1.HTML_FILE_PATH, "utf-8");


/*  main function */
async function main() {
    const time = {
        t: "сегодня",
        y: "вчера",
    };

    env.GLOBAL.DIRNAME = __dirname;
    
    
    // Set futures scenario code
    const scenarioList = getLinks(time.t);
    console.log(`Publics: ${scenarioList.length}`);
    
    //await setScenarios(scenarioList);

    console.log("\n\n\n=====================================\n\n\tWORK IS DONE\n\n=====================================");
    reviewDetails();
}

main();
