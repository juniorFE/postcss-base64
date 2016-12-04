var fs = require('fs'),
    postcss = require('postcss');

function getUrl(value) {
    var reg = /url\((\s*)(['"]?)(.+?)\2(\s*)\)/g,
        match = reg.exec(value),
        url = match[3];

    return url;
}

function getUrlWithoutPattern(value, pattern) {
    return value.match(pattern)[2];
}

function getUrlWithBaseDir(value, baseDir) {
    if (baseDir !== undefined) {
        return baseDir + value;
    }

    return value;
}

function replaceFiles(string, opts) {
    if (opts.isConvertPattern === false) {
        file = getUrlWithoutPattern(string, opts.pattern);
        file = getUrlWithBaseDir(file, opts.baseDir);
    } else {
        file = getUrl(string);
    }

    ext = file.split('.')[1];

    if(ext === 'svg') ext = ext + '+xml';

    fileContents = fs.readFileSync(file);
    output = 'data:image/' + ext + ';base64,' + fileContents.toString('base64');

    return string.replace(file, output);
}

function replaceInline(string, opts) {
    output = new Buffer(string).toString('base64');
    if(opts.prepend) output = opts.prepend + output;

    return output;
}

module.exports = postcss.plugin('postcss-base64', function (opts) {
    return function (css, result) {
        opts = opts || {};

        var exts,
            ext,
            search,
            file,
            fileContents,
            output;

        if(opts.extensions) {
            exts = '\\' + opts.extensions.join('|\\');
            search = new RegExp('url\\(.*(' + exts + ').*\\)', 'i');

            css.replaceValues(search, function (string) {
                return replaceFiles(getUrlWithBaseDir(string, opts.baseDir), opts);
            });
        }

        if(opts.pattern) {
            if(!opts.pattern instanceof RegExp) {
                throw new Error('Given search pattern is not a (valid) regular expression.');
            }

            search = opts.pattern;

            css.replaceValues(search, function (string) {
                if (opts.isConvertPattern === false) {
                    return replaceFiles(string, opts)
                } else {
                    return replaceInline(string, opts);
                }
            });
        }
    };
});
