injectify
=========

Inject arbitrary JS into JS at statement level

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

Executing the returned JS will output a JSON array containing line+position+timestamp+filename+memory usage between every line of your JS!  Take a look at the newly generated JS to see exactly what I'm talking about.  

Using 'injectify' you too can now inject ANY Javascript you want between each statement in your JS or you can be more selective and only inject BEFORE OR AFTER specific ones.

More advanced usages requires some knowledge of uglify's AST syntax/semantics sorry - will cook up helper functions for more comming usages like 'what are the names of the paramters passed to a function' and 'what are the names of all the variables being defined in a 'var' statement'....

