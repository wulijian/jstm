/**
 * @date 13-2-5
 * @describe: 添加jade支持
 * @author: KnightWu
 */
var fs = require('fs');
var path = require('path');
var uglify = require('uglify-js');

module.exports = {
    tp: require('jade'),
    tpName: 'jade',
    compile: function (filePath, dataProgress, helperName) {
        var templateCode = fs.readFileSync(filePath).toString();
        //编译
        var templateFunc = this.tp.compileClient(
            templateCode,
            {compileDebug: false}
        ).toString();
        //参数需要是 _data
        templateFunc = templateFunc.replace(/locals/g, '_data')
            //处理函数应该以helperName为命名空间
            .replace(/jade\./g, (helperName || '___kkit___.tph') + '.jade.');

        var templateFuncU = uglify.parse(templateFunc);

        //添加中间的数据处理
        if (dataProgress !== '' && dataProgress !== undefined) {
            templateFuncU.body[0].body.unshift(uglify.parse(dataProgress));
        }
        return templateFuncU.print_to_string();
    },
    update: function (tpPath) {
        return 'define(function(require, exports, module){\n' +
            'var ' + fs.readFileSync(tpPath(module.children) + '/runtime.js', 'utf-8').toString() + '\n' +
            'module.exports = jade;\n' +
            '});';
    }
};
