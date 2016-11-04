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
    compile: function (filePath, dataProgress, helperName, isEs6) {
        var template = this.tp.compile(filePath, helperName + '.html', isEs6);
        if (isEs6) {
            let templateFunc = template.toString();
            if (dataProgress !== '') {
                templateFunc = templateFunc.replace(/("es6insertposition";)/, function ($1) {
                    return $1 + '\n' + dataProgress;
                });
            }
            return templateFunc;
        } else {
            let templateFunc = uglify.parse(template.toString());
            if (dataProgress !== '') {
                templateFunc.body[0].body.unshift(uglify.parse(dataProgress));
            }
            return templateFunc.print_to_string();
        }
    },
    sourceMap: function (generatedFilePath, runRoot, handleMap) {
        this.tp.generateSourceMap(generatedFilePath, runRoot, handleMap);
    },
    update: function (tpPath) {
        return fs.readFileSync(tpPath(module.children) + '/lib/html.js', 'utf-8').toString();
    }
};
