var path = require('path');
var fs = require('fs');
var jade = require('../lib/plugins/jade');

describe('plugins:', function () {
    describe("jade", function () {
        it('compile:', function () {
            jade.compile(path.resolve(__dirname, './tmpl/ind.jade'));
        });
    });
});
