/**
 * @describe: 编译html后缀的模板
 * @time: 上午9:44
 * @author: KnightWu
 */
var fs = require('fs');
var path = require('path');
var uglify = require('uglify-js');

module.exports = {
    tp: require('ktemplate'),
    tpName: 'ktemplate',
    compile: function (filePath, dataProgress, helperName) {
        var template = this.tp.compile(filePath, helperName + '.html');
        var templateFunc = uglify.parse(template.toString());
        if (dataProgress !== '') {
            templateFunc.body[0].body.unshift(uglify.parse(dataProgress));
        }
        return templateFunc;
    },
    sourceMap: function (generatedFilePath, runRoot, handleMap) {
        this.tp.generateSourceMap(generatedFilePath, runRoot, handleMap);
    },
    update: function (tpPath) {
        return fs.readFileSync(tpPath(module.children) + '/lib/html.js', 'utf-8').toString();
    }
};
