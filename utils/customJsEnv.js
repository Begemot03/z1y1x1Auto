module.exports = {
    GLOBAL: {
        DIRNAME: "", // index.js __dirname
        OPERATIONS_STATUS: {
            SUCCESS: "SUCCESS",
            ERROR: "ERROR"
        },
    },
    //z1 data files path
    Z1: {
        LOG_FILE_PATH: "/dataFiles/logs/z1Logs.json",
        RESULT_FILE_PATH: "/dataFiles/result/z1Result.json",
        HTML_FILE_PATH: "/dataFiles/pageBodies/z1ResultPage.txt",
    },
    //vk data files path
    VK: {
        VK_FUTURES_LINKS_FILE_PATH: "/dataFiles/result/vkFuturesLinks.txt",
        VK_FUTURES_LOG_FILE_PATH: "/dataFiles/logs/vkFuturesLogs.json",
        VK_FUTURES_HTML_FILE_PATH: "/dataFiles/pageBodies/vkFuturesPage.txt",
    }
}