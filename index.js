var postcss = require('postcss');

module.exports = postcss.plugin('postcss-base64', function (opts) {
    return function (css, result) {
        opts = opts || {
            debug: false,
            patterns: ['svg']
        };

        var output,
            isFile,
            search;

        if(!opts.patterns) throw new Error('No search pattern given.');

        opts.patterns.forEach(function(data, i) {
            if(typeof data === 'string') {
                isFile = true;
            }

            if(data instanceof RegExp) {
                isFile = false;
            }

            if(isFile) {
                search = new RegExp('\.' + data + '$');
            } else {
                search = data;
            }

            css.replaceValues(search, function (string) {
                output = 'data:image/svg+xml;base64,' + new Buffer(string).toString('base64');
                if(opts.debug) {
                    console.info('In: ' + string);
                    console.info('Out: ' + output);
                }
                return output;
            });
        });
    };
});
