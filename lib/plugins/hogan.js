/**
 * @describe: 支持mustache模板预编译
 * @time: 上午9:47
 * @author: KnightWu
 */
var fs = require('fs');
var path = require('path');

module.exports = {
    tp: require('hogan.js'),
    tpName:'hogan.js',
    compile: function (filePath, dataProgress, helperName) {
        var templateCode = fs.readFileSync(filePath, 'utf-8').toString();
        templateCode = templateCode.replace(/"/g, '\\"');
        var template = this.tp.compile(templateCode, {
            asString: true
        });
        return 'function ThoganT (_data){\n' +
            dataProgress +
            'var template = new ' + helperName + '.hogan.Template(' + template + ');\n' +
            'return template.render(_data);\n' +
            '}\n';
    },
    update: function (tpPath) {
        var hogan = ['template.js'];
        var code = 'define(function(require, exports, module){\n';
        for (var i = 0; i < hogan.length; i++) {
            code += fs.readFileSync(tpPath(module.children) + '/' + hogan[i], 'utf-8').toString();
        }
        code += '});\n';
        return code;
    }
};
