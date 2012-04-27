<html>
<head>
    <style type="text/css">
    span { padding: 0; margin: 0; }
    </style>
</head>

<body>
<button id="ss">Pause</button>
<script src="http://yui.yahooapis.com/3.5.0/build/yui/yui-min.js"></script>
<script>
    YUI().use("node", 'json', function(Y) {
        var i = 0
            , button = Y.one('#ss')
            , paused = false
            , data = Y.JSON.parse(dd)
        ;

        /*
        for (i = 0; i < data.length; i++) {
            setTimeout(nextStatement.bind(data[i]), 1000);
        }
        */

        button.on('click', function(evt) {
            if (paused) {
                button.set('innerHTML', 'Pause');
                paused = false;
                setTimeout(nextStatement.bind(data[++i]), 0);
            } else {
                button.set('innerHTML', 'Resume');
                paused = true;
            }
        });


        setTimeout(nextStatement.bind(data[i]), 0);

        function nextStatement() {
            var startpos = this.start.pos
                , endpos = this.end.endpos
                , j
            ;

            Y.all("span").setStyle("backgroundColor", "white");

            for (j = startpos; j < endpos; j++) {
                Y.one("#pos_" + j).setStyle("backgroundColor", "green");
            }

        //    Y.one('#pos_' + endpos).scrollIntoView();

            if (!paused) {
                setTimeout(nextStatement.bind(data[++i]), 1000);
            }
        }
    });
</script>
