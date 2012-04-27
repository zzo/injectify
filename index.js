/**
  * ARGS contains
  *
  * file:      filename of JS to inject
  * cb:        Callback for each statement (gets AST)
  * start:     String JS code to put at top of file
  * end:       String JS code of put at end of file
  * after:     Inject JS AFTER the statement instead of before (the default)
  */
var Injectify = function(args) {
    var fs = require('fs');

    this.cb    = args.cb;
    this.start = args.start;
    this.end   = args.end;
    this.after = args.after;

    this.processor = require('uglify-js/lib/process');
    this.parser    = require("uglify-js/lib/parse-js");
    this.MAP       = this.processor.MAP;

    this.nofill = false;
    this.source = fs.readFileSync(args.file, 'utf8')
};

/* do it to it - returns the modified JS */
Injectify.prototype.parse = function() {

        var ast   = this.parser.parse(this.source, false, true) // parse code and get the initial AST
        , w       = this.processor.ast_walker()
        , walk    = w.walk
        , parser  = this
        , walkers = {
            "var": function(defs) {
                var arr = [ this[0], parser.MAP(defs, function(def){
                    var a = [ def[0] ];
                    if (def.length > 1)
                            a[1] = walk(def[1]);
                    return a;
                }) ];
                return parser.statement(arr);
            }
            /*
            , "defun": function(name, args, body) {
                var xtra = { args: {} }
                    , jxtra
                ;                    

                args.forEach(function(arg) {
                    xtra.args[arg] = '_' + arg;
                });

                jxtra = JSON.stringify(xtra);

                args.forEach(function(arg) {
                    //jxtra = jxtra.replace('"_' + arg + '"', 'typeof(' + arg + ') !== "function" ? JSON.stringify(' + arg + ') : ' + arg + '.toString()');
                    jxtra = jxtra.replace('"_' + arg + '"', 'typeof(' + arg + ') !== "function" ? ' + arg + ' : ' + arg + '.toString()');
                });

                body.unshift(parser.parse('try{__program.push(' + jxtra + ');}catch(e){}'));
                return [ this[0], name, args.slice(), this.MAP(body,walk) ];
            }
            */
            ,"try": function(t, c, f) {
                var arr = [
                        this[0],
                        parser.MAP(t, walk),
                        c != null ? [ c[0], parser.MAP(c[1], walk) ] : null,
                        f != null ? parser.MAP(f, walk) : null
                ];
                return parser.statement(arr);
            }
            ,"throw": function(expr) {
                var arr =  [ this[0], walk(expr) ];
                return parser.statement(arr);
            }
            ,"switch": function(expr, body) {
                var exp, arr;

                this.nofill = true;
                exp = walk(expr);
                this.nofill = false;

                arr = [ this[0], exp, parser.MAP(body, function(branch) {
                        return [ branch[0] ? walk(branch[0]) : null, parser.MAP(branch[1], walk) ];
                }) ];
                return parser.statement(arr);
            }
            ,"break": function(label) {
                var arr =  [ this[0], label ];
                return parser.statement(arr);
            }
            ,"continue": function(label) {
                var arr =  [ this[0], label ];
                return parser.statement(arr);
            }
            ,"conditional": function(cond, t, e) {  // ? :
                var conditional, arr;

                this.nofill = true;
                conditional = walk(cond);
                nofiall = false;

                arr = [ this[0], conditional, walk(t), walk(e) ];
                return parser.statement(arr);
            }
            ,"if": function(conditional, t, e) {
                var cc, arr;

                this.nofill = true;
                cc = walk(conditional);
                this.nofill = false;

                arr = [ this[0], cc, walk(t), walk(e) ];
                return parser.statement(arr);
            }
            , "for": function(init, cond, step, block) {
                var ini, con, ste, arr;

                this.nofill = true;
                ini = walk(init);
                con = walk(cond);
                ste = walk(step);
                this.nofill = false;

                arr = [ this[0], ini, con, ste, walk(block) ];
                return parser.statement(arr);
            }
            , "for-in": function(vvar, key, hash, block) {
                var vva, ke, has, arr;

                this.nofill = true;
                vva = walk(vvar);
                ke = walk(key);
                has = walk(hash);
                this.nofill = false;

                arr = [ this[0], vva, ke, has, walk(block) ];
                return parser.statement(arr);
            }
            , "while": function(cond, block) {
                var cc, arr;

                this.nofill = true;
                cc = walk(cond);
                this.nofill = false;

                arr = [ this[0], cc, walk(block) ];
                return parser.statement(arr);
            }
            , "do": function(cond, block) {
                var cc, arr;

                this.nofill = true;
                cc = walk(cond);
                this.nofill = false;

                arr = [ this[0], cc, walk(block) ];
                return parser.statement(arr);
            }
            , "return": function(expr) {
                var arr = [ this[0], walk(expr) ];
                return parser.statement(arr);
            }
            , "stat": function(stat) {
                var arr= [ this[0], walk(stat) ];
                return parser.statement(arr);
            }
            , "label": function(name, block) {
                var arr = [ this[0], name, walk(block) ];
                return parser.statement(arr);
            }
            , "with": function(expr, block) {
                var exp, arr;

                this.nofill = true;
                exp = walk(expr);
                this.nofill = false;

                arr = [ this[0], exp, walk(block) ];
                return parser.statement(arr);
            }
        }
        , finalAST = w.with_walkers(walkers, function() { return walk(ast); });
    ;

    return this.start + this.processor.gen_code(finalAST, { beautify: true }) + '; ' + this.end;
};

Injectify.prototype.statement = function(ast) {
    var start = ast[0].start
        , end = ast[0].end
        , xast
        , js
        , block
    ;

    if (this.nofill) {
        return ast;
    }

    if (!start || !end) {
        return ast;
    }
 
    // Fill up object w/something interesting
    if (start && end) {
        js = this.cb(ast, start, end);
    }

    /*
     console.log(JSON.stringify(ast));
    */
    if (!js) {
        return ast;
    }

    // Generate AST From cb-provided JS
    xast  = this.parser.parse(js);

    // Stick before current statement...
    block = [ xast[1][0], ast ];
    if (this.after) {
        // Or maybe even after...
        block.reverse();
    }

    return [ "block", block ];  // New AST  - fortunately blocks don't matter/scope for JS!!
};

module.exports = {
    Injectify: Injectify
};
