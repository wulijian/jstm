/**
 * @describe: 支持mustache模板预编译
 * @time: 上午9:47
 * @author: Knight
 * @version: 0.0.1
 */
var fs = require('fs');
var path = require('path');

module.exports = {
    tp: require('hogan.js'),
    compile: function (filePath, dataProgress) {
        var templateCode = fs.readFileSync(filePath, 'utf-8').toString();
        templateCode = templateCode.replace(/"/g, '\\"');
        var template = this.tp.compile(templateCode, {
            asString: true
        });
        return 'function ThoganT (_data){\n' +
            dataProgress +
            'var template = new hogan.Template(' + template + ');\n' +
            'return template.render(_data);\n' +
            '}\n';
    },
    update: function (to) {
        var tpPath = '';
        module.children.forEach(function (mobj) {
            if (mobj.id.indexOf('hogan.js') !== -1) {
                tpPath = path.dirname(mobj.id);
            }
        });
        var hogan = ['template.js'];
        var code = 'define(function(require, exports, module){\n';
        for (var i = 0; i < hogan.length; i++) {
            code += fs.readFileSync(tpPath + '/' + hogan[i], 'utf-8').toString();
        }
        code += '});\n';
        fs.writeFileSync(path.resolve(__dirname, to || '../../tptools/', './hogan.js'), code);
        console.log('Update hogan.js success.');
    }
};
