/**
 * @date 13-1-16
 * @describe: 管理所有模版的模块
 * todo:解决模版本身的配置问题
 * 可通过add方法添加模版支持，其中compile部分为预编译阶段，update为更新模版的渲染模块到项目的lib中
 * @author: KnightWu
 */
var fs = require('fs');
var path = require('path');
var uglify = require('uglify-js');
var fetchData = require('./lib/fetchData');
var templatePlugin = require('./lib/templatePlugin');
var currentTemplatePlugin = null;

/**
 * 加载所有插件
 * @param pluginsPath
 */
var loadPlugins = function (pluginsPath) {
    var plugins = fs.readdirSync(pluginsPath);
    plugins.forEach(function (pluginName) {
        loadPlugin(path.resolve(pluginsPath, './' + pluginName));
    });
};
/**
 * 加载单个插件
 * @param pluginPath 插件路径
 */
var loadPlugin = function (pluginPath) {
    var pluginName = path.basename(pluginPath, '.js');
    var pluginDir = path.dirname(pluginPath);
    var plugin = require(path.resolve(pluginDir, './' + pluginName));
    plugin.suffix = pluginName;
    templatePlugin.add(plugin);
};

loadPlugins(path.resolve(__dirname, './lib/plugins')); //默认加载 todo:以后移动到项目统一加载的位置

/**
 * 获取uglify函数对象中的所有语句  todo:应该采用更加简单的正则处理字符串的方式，使用uglify函数越大，效率越低
 * @param func
 * @return {string}
 */
var getCodeInFunction = function (func) {
    var funcObj = func;
    if (!(func instanceof uglify.AST_Node)) {
        funcObj = uglify.parse(func);
    }
    var codeArr = funcObj.body[0].body;
    var code = '';
    for (var idx = 0; idx < codeArr.length; idx++) {
        code += codeArr[idx].print_to_string() + ';';
    }
    return code;
};

/**
 * 获取数据处理对象的字符串
 * @param realPath
 * @return {*}
 */
var extendDataProgressToData = function (realPath) {
    var templateDir = path.dirname(realPath);
    var dataProgress = null;
    try {
        dataProgress = fs.readFileSync(templateDir + '/data.js', 'utf-8');
    } catch (e) {
    }
    var fragment = '{}';
    try {
        fragment = uglify.parse(dataProgress).body[0].body.right.print_to_string();
    } catch (err) {
    }
    fragment = (fragment === '{}') ? '' : '_data = ' + (fetchData('helperName').val || 'tpHelper') + '.mixin(_data,' + fragment + ');';
    return fragment;
};

/**
 * 读出文件，根据后缀调用不同方法生成模版
 * @param filePath 模板文件路径
 * @param tp  后缀
 * @return {null}
 */
var compile = function (filePath, tp) {
    var sourceCode = fs.readFileSync(filePath, 'utf-8');
    if (sourceCode.trim() === '') {
        throw new Error('The template [' + filePath + '] is empty');
    }
    var dataProgress = extendDataProgressToData(filePath);
    currentTemplatePlugin = tp;
    return tp.compile(filePath, dataProgress, fetchData('helperName').val);
};

/**
 * 根据 './lib/helper/tpHelper.html' 模版，更新模版辅助模块的枢纽模块代码
 * @param tps 所有使用到的模版模块
 * @param to 写到这个目录
 */
var updateTpHelper = function (tps, to) {
    var tpHelperCode = compile(path.resolve(__dirname, './lib/helper/tpHelperTpl.js'), require('ktemplate'));
    var helperPath = path.resolve(__dirname, path.dirname(to) || './lib/helper/', './tpHelper.js');
    fs.writeFileSync(
        helperPath,
        tpHelperCode(tps)
    );
};

module.exports = {
    loadPlugins: loadPlugins,
    /**
     * 增加一种解析模板插件支持
     * @param pluginConfig
     */
    loadPlugin: loadPlugin,
    /**
     * update all plugins that will be used in the project lib for template render.
     * @param to  the file update to {to} dir
     */
    updateHelper: function (to) {
        console.log('Update plugins begin...');
        var allTemplateHelper = [];
        var tpPath = function (type, modules) {
            var modulePath = '';
            modules.forEach(function (mobj) {
                if (mobj.id.indexOf(type) !== -1) {
                    modulePath = path.dirname(mobj.id);
                }
            });
            return modulePath;
        };
        var allPlugins = templatePlugin.all();
        var relPath = path.resolve(__dirname, to || './lib/helper/tpHelper/');
        var helperName = path.basename(relPath);
        if (!fs.existsSync(relPath)) {
            fs.mkdirSync(relPath);
        }
        for (var type in allPlugins) {
            if (allPlugins.hasOwnProperty(type) && allPlugins[type].update !== null) {
                var plugin = allPlugins[type];
                if (typeof plugin === 'undefined' || typeof plugin.update === 'undefined') {
                    continue;
                }
                var code = plugin.update(tpPath.bind(undefined, plugin.tpName));
                fs.writeFileSync(path.resolve(relPath, './' + type + '.js'), code);
                console.log('        Update ' + type + '.js success.');
                allTemplateHelper.push({id: type, relPath: './' + helperName });
            }
        }
        fetchData('allTemplate').store = allTemplateHelper;
        fetchData('helperName').store = helperName;
        updateTpHelper(allTemplateHelper, to);
    },
    /**
     * 当前模版生成 sourceMap
     * todo:异步执行时可能会有问题
     */
    generateSourceMap: function () {
        if (currentTemplatePlugin.sourceMap !== null) {
            currentTemplatePlugin.sourceMap.apply(currentTemplatePlugin, arguments);
        }
    },
    /**
     * 解析模版语句
     * todo:支持str的compile
     * @param templatePath 模版路径
     * @param plugin 指定插件名称
     * @return {Function} 返回解析后的函数
     */
    compile: function (templatePath, plugin) {
        var suffixReg = /.*\.(.*$)/g;
        var suffix = plugin || suffixReg.exec(templatePath)[1];
        var tp = templatePlugin.all()[suffix];
        if (typeof tp === 'undefined') {
            throw "Don't support the template plugin type: [" + suffix + ']';
        }
        var renderFunctionStr = compile(templatePath, tp);
        fetchData('usedTemplates').mixin(JSON.parse('{"' + suffix + '": true}'));
        return new Function('_data', getCodeInFunction(renderFunctionStr));
    },
    /**
     * 解析模版语句, 自动匹配模版
     * @param templateDir 模版文件夹路径
     * @param fileName 模版文件名称（不包括后缀）
     * @return {null} 返回解析后的对象
     */
    compileAdaptive: function (templateDir, fileName) {
        var render = null;
        var allPlugins = templatePlugin.all();
        for (var suffix in allPlugins) {
            var realPath = templateDir + '/' + fileName + '.' + suffix;
            if (allPlugins.hasOwnProperty(suffix) && fs.existsSync(realPath)) {
                render = compile(realPath, allPlugins[suffix]);
            }
        }
        return render;
    }
};