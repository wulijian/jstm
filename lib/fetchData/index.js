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

var utils = {};
['forEach', 'some', 'every', 'filter', 'map'].forEach(function (fnName) {
    utils[fnName] = function (arr, fn, context) {
        if (!arr || typeof arr == 'string') return arr;
        context = context || this;
        if (arr[fnName]) {
            return arr[fnName](fn, context);
        } else {
            var keys = Object.keys(arr);
            return keys[fnName](function (key) {
                return fn.call(context, arr[key], key, arr);
            }, context);
        }
    };
});
var mixin = function mixin(to, from) {
    utils.forEach(from, function (val, key) {
        var toString = {}.toString.call(val);
        if (toString == '[object Array]' || toString == '[object Object]') {
            to[key] = mixin(val, to[key] || {});
        } else {
            to[key] = val;
        }
    });
    return to;
};

module.exports = function (key) {
    var all = !!(typeof key === 'undefined');

    return {
        get val() {
            return all ? data : data[key];
        },
        set store(obj) {
            if (all) {
                data = obj;
            } else {
                data[key] = obj;
            }
            fs.writeFileSync(dataPath, JSON.stringify(data));
        },
        mixin: function (obj) {
            if (all) {
                data = mixin(data, obj);
            } else {
                data[key] = mixin(data[key], obj);
            }
            fs.writeFileSync(dataPath, JSON.stringify(data));
        }
    };
};

