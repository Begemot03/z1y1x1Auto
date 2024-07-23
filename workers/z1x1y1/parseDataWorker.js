const env = require("../../utils/customJsEnv");
const cheerio = require("cheerio");
const fs = require("fs");


function dataFusion(uniq, allData) {
    /**
        * объединяем события от одной группы в один объект
        * ? Возращает массив готовых объектов 
        * [{
        *     link: groupLink,
        *     likes: [res, needed],
        *     reposts: [res, needed],
        * }, ...]
    **/
    const result = [];

    uniq.forEach(u => {
        n = {};
        n.link = u;
        
        allData.forEach(el => {
            if(u === el.link) {
                if(~el.event.search("лайк")) { 
                    n.likes = [el.res, el.needed];
                }
                if(~el.event.match(/репосты*/g)) {
                    n.reposts = [el.res, el.needed];
                }
            }
        });
        
        result.push(n);
    });

    return result;
}

function deleteWastedData(data) {
    /* 
        Удаляет из объекта data объекты события сценарий
        ? Возращает массив объектов [{}, ...]
    */
    return data.filter((el) => el.event !== "сценарий");
}

function uniqueLinks(data) {
    /* 
        Из массива объектов data уникальные ссылки
        ? массив ссылок [...]
    */
    const result = [];

    data.forEach(el => {
        if(result.indexOf(el.link) === -1) {
            result.push(el.link);
        }
    });

    return result;
}

function z1Parse(file) {
    /*
        Парсит данный из z1 
        ? возвращает массив объектов событий
        [{
            link: groupLink,
            event: eventName,
            res: result,
            needed: task,
        }, ...]
    */
    const $ = cheerio.load(file);
    const result = [];

    $("tbody>tr").each(function() {
        const link = $(this).children("td").children("a").attr("href");
        const event = $(this).children().next().children("small").text();
        const work = $(this).children().next().next().children(".pr").text().replace(/\s/g, '').split("из", 2);

        result.push({
            link,
            event,
            res: work[0],
            needed: work[1],
        });
    });

    return result;
}

function z1ParseWorker(htmlFile) {
    const data = z1Parse(htmlFile);
    const uniqLinks = uniqueLinks(deleteWastedData(data));
    const result = dataFusion(uniqLinks, data);

    fs.writeFileSync(
        env.GLOBAL.DIRNAME + env.Z1.RESULT_FILE_PATH, 
        JSON.stringify(result, null, 4)
    );
}

module.exports = z1ParseWorker;