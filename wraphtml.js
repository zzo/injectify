var fs = require('fs')
    , file = fs.readFileSync(process.argv[2], 'utf8')
    , data = fs.readFileSync('wrap.out', 'utf8')
    , i
;

var obj = JSON.parse(data);
console.log("<script>var dd = '" + JSON.stringify(obj) + "';</script>");
var js = fs.readFileSync('wrap.js', 'utf8');
console.log(js);

for(i = 0; i < file.length; i++) {
    var d = file[i];
    if (file[i] === ' ') { d = '&nbsp;' }
    if (file[i] === '\n') { d = '<br />'; }
    process.stdout.write('<span id="pos_' + i + '">' + d + '</span>');
}

console.log('</body></html>');
