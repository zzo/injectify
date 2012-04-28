var Injectify = require('./index.js').Injectify
    , parser = new Injectify(
        {
            file: 't.js'
            , start: 'var __program = [];'
            , end: 'process.on("exit", function () { console.log(JSON.stringify(__program)); });'
            , functionStart: function(name, args, ast) {
                var obj, str;

                var xtra = { args: {}, name: name }
                    , jxtra
                ;                    

                args.forEach(function(arg) {
                    xtra.args[arg] = '_' + arg;
                });

                jxtra = JSON.stringify(xtra);

                args.forEach(function(arg) {
                    jxtra = jxtra.replace('"_' + arg + '"', '(typeof(' + arg + ') !== "function" ? ' + arg + ' : ' + arg + '.toString())');
                });

                return '__program.push(' + jxtra + ');';
            }
        }
    )
    , newJS = parser.parse()
    , vm = require('vm')
;

// console.log(newJS);
vm.runInThisContext(newJS, 't.js')

