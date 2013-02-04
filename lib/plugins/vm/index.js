/**
 * @describe: 编译支持vm后缀的模板
 * @time: 上午9:46
 * @author: KnightWu
 */
var fs = require('fs');
var path = require('path');

var buildCompile = function (velocityPath) {
    var files, helper, tpl, velocity;
    files = fs.readdirSync(velocityPath + '/compile');
    velocity = '';
    files.forEach(function (file) {
        var text;
        if (file !== 'index.js' && file !== 'node.js') {
            text = (fs.readFileSync(velocityPath + '/compile/' + file)).toString();
            text = text.replace('module.exports = ', "/** file: ./src/compile/" + file + "*/\n!");
            text = text.replace(/;\s*$/, "(Velocity, utils);\n\n");
            text = text.replace(/\n/g, "\n  ");
            velocity += text;
        }
    });
    helper = (fs.readFileSync(velocityPath + "/helper/text.js")).toString();
    helper = helper.replace('module.exports = ', '!');
    helper = helper.replace(/\n/g, "\n  ");
    helper = helper.replace(/;\s*$/, "(Velocity.Helper, utils);");
    tpl = (fs.readFileSync(path.resolve(__dirname, './vmtpl.js'))).toString();

    var utilsCode = fs.readFileSync(velocityPath + "/utils.js").toString();
    utilsCode = utilsCode.replace('module.exports = utils;', "");
    tpl = tpl.replace('{utils}', utilsCode);
    tpl = tpl.replace('{helper}', helper);
    tpl = tpl.replace('{velocity}', velocity);
    return tpl;
};


module.exports = {
    tp: require('velocityjs'),
    tpName: 'velocityjs',
    compile: function (filePath, dataProgress, helperName) {
        var template = this.tp.Parser.parse(fs.readFileSync(filePath, 'utf-8').toString());
        var ast = JSON.stringify(template);
        return 'function TvmT (_data){\n' +
            dataProgress +
            'return (' + helperName + '.vm(' + ast + ')).render(_data);\n' +
            '}';
    },
    update: function (tpPath) {
        return buildCompile(tpPath(module.children));
    }
};
