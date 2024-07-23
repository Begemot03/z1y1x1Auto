const fs = require("fs");

function JSLogger(path) {
    this.path = path;
    this.data;
    this.name;

    // Открываем файл для логгов
    this.start = function(name) {
        this.name = name;
        this.data = JSON.parse(fs.readFileSync(this.path));
        console.log(`Logging start [ ${this.name} ]`)
    }

    // Добавляем событие
    this.add = function(eventName, data) {
        this.data.push({
            EVENT: eventName.toUpperCase(), 
            ...data,
        });
    }

    this.close = function() {
        console.log(`Logging end [ ${this.name} ]`)
        fs.writeFileSync(this.path, JSON.stringify(this.data, null, 4));
    }
}

module.exports = {
    JSLogger,
};