var Injectify = require('./index.js').Injectify
    , parser = new Injectify(
        {
            file: '../firefox.js'
            , start: 'var __program = [];'
            , end: 'process.on("exit", function () { console.log(JSON.stringify(__program)); });'
            , cb: function(ast, start, end) {
                var obj, str;

                obj = { 
                    start: { line: start.line, col: start.col, pos: start.pos, endpos: start.endpos }
                    , end: { line: end.line, col: end.col, pos: end.pos, endpos: end.endpos }
                    , when: 'DATE'
                    , file: process.argv[2]
                    , memory: 'MEM'
                }

                str = '__program.push(' + JSON.stringify(obj) + ');'
                str = str.replace('"DATE"', 'new Date().getTime()');
                str = str.replace('"MEM"', 'process.memoryUsage()');  // Only in NodeJS!

                return str;
            }
        }
    )
    , newJS = parser.parse()
;

console.log(newJS);
