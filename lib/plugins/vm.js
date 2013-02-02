/**
 * @describe: 编译支持vm后缀的模板
 * @time: 上午9:46
 * @author: Knight
 * @version: 0.0.1
 */
var fs = require('fs');
var path = require('path');
var uglify = require('uglify-js');

module.exports = {
    tp: require('velocityjs'),
    compile: function (filePath, dataProgress) {
        var template = this.tp.Parser.parse(fs.readFileSync(filePath, 'utf-8').toString());
        var ast = JSON.stringify(template);
        var vmTP = 'function TvmT (_data){\n' +
            dataProgress +
            'return (velocity(' + ast + ')).render(_data);\n' +
            '}';
        return  uglify.parse(vmTP);
    },
    update: function (to) {
        var tpPath = '';
        module.children.forEach(function (mobj) {
            if (mobj.id.indexOf('/velocityjs/')) {
                tpPath = path.dirname(path.dirname(mobj.id));
            }
        });
//        var coffee = require('coffee-script');
//        require(tpPath + '/Cakefile');
//        require();
//        var code = fs.readFileSync(tpPath + '/lib/html.js', 'utf-8').toString();
//        fs.writeFileSync(path.resolve(__dirname, to || '../../tptools/', './vm.js'), code);
        console.log(tpPath, 'Update html.js success.');
    }
};
