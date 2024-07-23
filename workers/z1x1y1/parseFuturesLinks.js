const cherio = require("cheerio");
const env = require("../../utils/customJsEnv");
const { JSLogger } = require("../../utils/Logger");
const { uniqueLinks } = require("../../workers/z1x1y1/parseDataWorker");
const fs = require("fs");

function getFuturesScenarioLinks(htmlFile, day, logger) {
    const $ = cherio.load(htmlFile);
    const vkLink = "https://vk.com";

    $("tbody>tr").each(function(i) {
        // Первый элемент это заголовок, его скипаем
        if(i === 0) {
           return;
        }
        
        // Парсим нужные данные
        const entryName = $(this).children("td").first().text().trim();
        const link = vkLink + $(this).children("td").next().children(".title").children("a").attr("href");
        const price = $(this).children("td").next().next().children(".exchange_request_price").children(".extra_info").first().children("b").text().trim();
        const isNeededDay = $(this).children("td").next().next().children(".exchange_request_price").children(".extra_info").next().text().includes(day);
        // Если в нужный день, то добавляем данные
        if(isNeededDay) {
            // Сначала ссылки на нужные паблики
            fs.appendFileSync(env.GLOBAL.DIRNAME + env.VK.VK_FUTURES_LINKS_FILE_PATH, link + "\n");
            
            // Потом уже логгигуем остальные данный для возможной будущей обработки
            logger.add("adding link", {
                entryName,
                link,
                price
            });            
        }
    })

    
}

function getLinks(keyWord) {
    // Logger
    const logger = new JSLogger(env.GLOBAL.DIRNAME + env.VK.VK_FUTURES_LOG_FILE_PATH);
    logger.start("getVKFuturesLinks");

    // files cleaning
    fs.writeFileSync(env.GLOBAL.DIRNAME + env.VK.VK_FUTURES_LINKS_FILE_PATH, "");
    fs.writeFileSync(env.GLOBAL.DIRNAME + env.VK.VK_FUTURES_LOG_FILE_PATH, "[]");
    fs.writeFileSync(env.GLOBAL.DIRNAME + env.Z1.LOG_FILE_PATH, "[]");

    const vkFuturesFile = fs.readFileSync(env.GLOBAL.DIRNAME + env.VK.VK_FUTURES_HTML_FILE_PATH, "utf-8");

    // Pushing links in file
    getFuturesScenarioLinks(vkFuturesFile, keyWord, logger);

    // links list manipulations
    const linksSrting = fs.readFileSync(env.GLOBAL.DIRNAME + env.VK.VK_FUTURES_LINKS_FILE_PATH, {
        encoding: "utf-8",
        flag: "r",
    });

    logger.close();

    return linksSrting.trim().split("\n");
}

module.exports = {
    getLinks,
};