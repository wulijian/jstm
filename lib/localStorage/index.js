/**
 * @describe: 简单的存储类，用来存储关于 jstm 模板插件的输出路径等问题
 * @time: 下午9:06
 * @author: Knight
 * @version: 0.0.1
 */
var path = require('path');
var fs = require('fs');
var util = require('util');
var dataPath = path.resolve(__dirname, './data.json');
var data = require(dataPath);

var store = function (key, value) {
    data[key] = value;
    fs.writeFileSync(dataPath, JSON.stringify(data));
};

var fetch = function (key) {
    return data[key];
};

module.exports = {
    db: function (key, value) {
        var returnData = data;
        if (typeof key !== 'undefined' && typeof value === 'undefined') {
            returnData = fetch(key);
        } else {
            store(key, value);
        }
        return returnData;
    },
    clear: function () {
        fs.writeFileSync(dataPath, '{}');
    }
};

