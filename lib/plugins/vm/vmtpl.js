/**
 * @describe:
 * @time: 上午11:42
 * @author: Knight
 * @version: 0.0.1
 */

define(function (require, exports, module) {
    var Velocity = function (asts) {
        this.asts = asts;
        this.init();
    };
    Velocity.Helper = {};
    Velocity.prototype = {
        constructor: Velocity
    };

    var hasEnumBug = !({toString: 1}.propertyIsEnumerable('toString'));

    var keys = Object.keys || function (o) {
        var result = [], p, i;

        for (p in o) {
            result.push(p);
        }

        if (hasEnumBug) {
            for (i = enumProperties.length - 1; i >= 0; i--) {
                p = enumProperties[i];
                if (o.hasOwnProperty(p)) {
                    result.push(p);
                }
            }
        }

        return result;
    };

    //api map
    {utils}

    {helper}

    {velocity}
    module.exports = function(ast){
        return new Velocity(ast);
    }
});