const { Builder, By, Key, until, promise} = require("selenium-webdriver");
const { JSLogger } = require("../../utils/Logger");
const { scenario } = require("../../utils/scenarioData");
const { Z1 } = require("../../utils/authData");
const env = require("../../utils/customJsEnv");

async function auth(driver) {
    try {
        // Переходим на z1
        await driver.get('https://z1y1x1.ru/panel/autolikes?login=true');

        // Проходим этап индетификации
        await driver.findElement(By.xpath("/html/body/div/form/div/div/div[2]/div[1]/div[1]/input")).sendKeys(Z1.LOGIN);
        await driver.findElement(By.xpath("/html/body/div/form/div/div/div[2]/div[1]/div[2]/div/input[1]")).sendKeys(Z1.PASSWORD, Key.RETURN);
    } catch (e) {
        return {
            STATUS: env.GLOBAL.OPERATIONS_STATUS.ERROR,
            DATA: "!!! SOME ERROR IN TIME FOR AUTH",
        }
    }

    return {
        STATUS: env.GLOBAL.OPERATIONS_STATUS.SUCCESS,
        DATA: "Auth is success",
    }
}

async function setScenario(driver, publicName, paramText) {
    const workData = {
        LIKES: "",
        REPOSTS: "",
        SCENARIO_NAME: "",
    };

    try {
        // Выполняем поиск сценария
        await driver.wait(until.elementLocated(By.xpath("/html/body/div[1]/div[2]/div[2]/div[3]/div[3]/div[1]/div[2]/div/label/input")));

        const scenarioSearch = await driver.findElement(By.xpath("/html/body/div[1]/div[2]/div[2]/div[3]/div[3]/div[1]/div[2]/div/label/input"));
        await scenarioSearch.clear();
        await scenarioSearch.sendKeys(publicName);
        
        for (let id = 1; id <= 100; id++) {
            const ScenarioName = await driver.findElement(By.xpath(`/html/body/div[1]/div[2]/div[2]/div[3]/div[3]/div[2]/div/table/tbody/tr[${id}]/td[3]/b`)).getText();

            if(ScenarioName === publicName) {
                await driver.findElement(By.xpath(`/html/body/div[1]/div[2]/div[2]/div[3]/div[3]/div[2]/div/table/tbody/tr[${id}]/td[6]/a[2]`)).click();
                break;
            }
        }

        
        // Ждем пока загрузится страница
        const i = await driver.wait(until.elementLocated(By.name("likes")), 10 * 1000);
        
        // На всякий еще пауза на 1000мс
        await driver.sleep(1000);

        // Меняем лайки
        const likeInput = await driver.findElement(By.name("likes"));
        const likes = await likeInput.getAttribute("value");

        workData.LIKES = `${likes}`; // Логгируем количество лайков до

        await likeInput.clear();
        await likeInput.sendKeys(Number(likes) + 2);

        workData.LIKES =  workData.LIKES + ` => ${Number(likes) + 2}`; // Логгируем количество лайков после
        

        // Меняем комменты на 0
        const commentInput = await driver.findElement(By.name("comments"));
        await commentInput.clear();

        // Меняем репосты
        const repostInput = await driver.findElement(By.name("reposts"));
        const reposts = await repostInput.getAttribute("value");

        workData.REPOSTS = `${reposts !== "" ? reposts : "УМНАЯ"}`;// Логгируем количество репостов до


        // Если репостов 0 значит умная накрутка репосты не трогаем
        if(Number(reposts) !== 0) {
            await repostInput.clear();
            
            // Ограничиваем репосты интервалом [50, 90]
            if(Number(reposts) > 90) {
                await repostInput.sendKeys(50);
                workData.REPOSTS =  workData.REPOSTS + ` => 50`; // Логгируем количество репостов после
            } else {
                await repostInput.sendKeys(Number(reposts) + 2);
                workData.REPOSTS =  workData.REPOSTS + ` => ${Number(reposts) + 2}`; // Логгируем количество репостов после
            }   
        }

        // Включаем сценарий
        const selectState = await driver.findElement(By.name("status"));
        await selectState.click();
        const optionsState = await selectState.findElements(By.css("option"));

        for(let v of optionsState) {
            const text = await v.getText();
            
            if(text.includes("Вкл")) {
                await v.click();
                break;
            }
        }

        // Меняем сценарий
        const selectScanario = await driver.findElement(By.name("scena_type")); // Находим лист с сценариями
        const prevScenario = await selectScanario.getAttribute("value"); // Смотрим id текуцего сценария

        workData.SCENARIO_NAME = scenario[prevScenario] ? scenario[prevScenario] : "Старый паблик"; // Логгируем название сценария до

        const curScenario = Number(
            scenario[prevScenario] ? //Может быть так что сценарий имееть какое-то старое имя тип апрель 42-50 для таких сценариев ставим 20 по дефолту
                scenario[prevScenario].split(" ")[1]
                : 21
            ) - 1; // Вычисляем номер следующего сценария (не id)
        await selectScanario.click(); // Нажимаем на лист с сценариями
        const optionsScenario = await selectScanario.findElements(By.css("option")); // Находим все выборы

        // Находим нужный сценарий из списка
        for(let v of optionsScenario) {
            const text = await v.getText(); 
            
            if(text.includes(`Новое ${curScenario === 0 ? 20 : curScenario} -`)) {
                await v.click();
                workData.SCENARIO_NAME =  workData.SCENARIO_NAME + ` => ${text}`; // Логгируем название сценария после
                break;
            }
        }

        // Меняем текст, который фильтрует посты для накрутки
        const filterText = await driver.findElement(By.name("filter"));
        await filterText.clear();
        await filterText.sendKeys(paramText);

        // Сохраняем)
        await driver.findElement(By.xpath("/html/body/div[1]/div[2]/div[2]/div[2]/form/div[5]/div[1]/button")).click();
    } catch (e) {

        // Если паблик не найден
        if(e.message === "Unable to locate element: /html/body/div[1]/div[2]/div[2]/div[3]/div[3]/div[2]/div/table/tbody/tr[1]/td[3]/b") {
            return {
                STATUS: env.GLOBAL.OPERATIONS_STATUS.ERROR,
                DATA: `!!! ${publicName} is not found`,
            }
        }

        // Другие ошибки
        return {
            STATUS: env.GLOBAL.OPERATIONS_STATUS.ERROR,
            DATA: `!!! ${publicName} is ERROR`,
            WORK: workData,
        }
    }

    return {
            STATUS: env.GLOBAL.OPERATIONS_STATUS.SUCCESS,
            DATA: `${publicName} is DONE`,
            WORK: workData,
    }
}

async function setScenarios(scenarioList) {
    const logger = new JSLogger(env.GLOBAL.DIRNAME + env.Z1.LOG_FILE_PATH);
    logger.start("z1SetScenarios");

    try {
        // Подключаем драйвер firefox
        const driver = await new Builder().forBrowser('firefox').build();

        logger.add("START", {
            STATUS: "NETRALL",
            DATA: `TIME: ${Date.now().toString()}`,
        });

        // Выполняем вход в аккаунт
        const authStatus = await auth(driver);
        logger.add("AUTH", authStatus);

        for (const v of scenarioList) {
            ScenatioEditionStatus = await setScenario(driver, v, "Пo вceм вonpocaм (omзывы нa cmeнe)");
            logger.add("SET_SCENARIO", ScenatioEditionStatus);
        }
    } catch (e) {
        logger.add("END", {
            DATA: `TIME: ${Date.now().toString()}`,
            STATUS: "NETRALL",
        });
        logger.close();

        return -1;
    }
    
    logger.add("END", {
        DATA: `TIME: ${Date.now().toString()}`,
        STATUS: "NETRALL",
    })
    logger.close();

    return 0;
}

module.exports = {
    setScenarios
};