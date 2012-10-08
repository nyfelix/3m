/* 
 * This a very simple node server for WikiMindMap
 *
 * For now, I just send a simple HTML file back, since most of the code will be clientside.
 * 
 */


var express = require('express'),
    app = express.createServer();

app.get('/', function(req, res){
    //res.send(req.url)
    res.sendfile('static/index.html');
});

app.get('/js/*', function(req, res){
    res.sendfile('static/js/'+req.params[0]);
});


app.get('/css/*', function(req, res){
    //console.log(req)
    res.sendfile('static/css/'+req.params[0]);
});

app.listen(process.env.PORT);
console.log('Express server started on port %s', process.env.PORT);