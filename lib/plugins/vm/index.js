/**
 * @describe: 编译支持vm后缀的模板
 * @time: 上午9:46
 * @author: Knight
 * @version: 0.0.1
 */
var fs = require('fs');
var path = require('path');
var uglify = require('uglify-js');

var buildCompile = function (velocityPath) {
    var files, helper, tpl, velocity;
    files = fs.readdirSync(velocityPath + '/src/compile');
    velocity = '';
    files.forEach(function (file) {
        var text;
        if (file !== 'index.js' && file !== 'node.js') {
            text = (fs.readFileSync(velocityPath + '/src/compile/' + file)).toString();
            text = text.replace('module.exports = ', "/** file: ./src/compile/" + file + "*/\n!");
            text = text.replace(/;\s*$/, "(Velocity, utils);\n\n");
            text = text.replace(/\n/g, "\n  ");
            velocity += text;
        }
    });
    helper = (fs.readFileSync(velocityPath + "/src/helper/text.js")).toString();
    helper = helper.replace('module.exports = ', '!');
    helper = helper.replace(/\n/g, "\n  ");
    helper = helper.replace(/;\s*$/, "(Velocity.Helper, utils);");
    tpl = (fs.readFileSync(path.resolve(__dirname, './vmtpl.js'))).toString();

    var utilsCode = fs.readFileSync(velocityPath + "/src/utils.js").toString();
    utilsCode = utilsCode.replace('module.exports = utils;', "");
    tpl = tpl.replace('{utils}',utilsCode);
    tpl = tpl.replace('{helper}', helper);
    tpl = tpl.replace('{velocity}', velocity);
    return tpl;
};


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
            if (mobj.id.indexOf('velocityjs') !== -1) {
                tpPath = path.dirname(path.dirname(mobj.id));
            }
        });
        var code = buildCompile(tpPath);
        fs.writeFileSync(path.resolve(__dirname, to || '../../tptools/', './vm.js'), code);
        console.log('Update vm.js success.');
    }
};
