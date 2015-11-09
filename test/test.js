var fs = require('fs'),
    path = require('path'),
    postcss = require('postcss'),
    test = require('ava'),
    base64 = require('../');

var opts = {
    debug: true,
    patterns: [
        'svg',
        /(url\(\')(<svg.*<\/svg>)(\'\))/
    ]
};

var src = fs.readFileSync(path.join(__dirname, 'test.css')),
    expected = fs.readFileSync(path.join(__dirname, 'expected.css')).toString(),
    output = postcss().use(base64(opts)).process(src).css;

test('Check output', t => {
    t.same(expected, output, 'Expected code and output code are not the same.');
    t.end();
});
