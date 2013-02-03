/**
 * @describe: 编译html后缀的模板
 * @time: 上午9:44
 * @author: Knight
 * @version: 0.0.1
 */
var fs = require('fs');
var path = require('path');
var uglify = require('uglify-js');

module.exports = {
    tp: require('ktemplate'),
    compile: function (filePath, dataProgress) {
        var template = this.tp.compile(filePath);
        var templateFunc = uglify.parse(template.toString());
        if (dataProgress !== '') {
            templateFunc.body[0].body.unshift(uglify.parse(dataProgress));
        }
        return templateFunc;
    },
    sourceMap: function (generatedFilePath, runRoot, handleMap) {
        this.tp.generateSourceMap(generatedFilePath, runRoot, handleMap);
    },
    update: function (to) {
        var tpPath = '';
        module.children.forEach(function (mobj) {
            if (mobj.id.indexOf('ktemplate') !== -1) {
                tpPath = path.dirname(mobj.id);
            }
        });
        var code = fs.readFileSync(tpPath + '/lib/html.js', 'utf-8').toString();
        fs.writeFileSync(path.resolve(__dirname, to || '../../tptools/', './html.js'), code);
        console.log('Update html.js success.');
    }
};
