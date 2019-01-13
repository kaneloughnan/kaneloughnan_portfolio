const express = require('express');
const app = express();
const port = 8000;
const bodyParser = require('body-parser');
const path = require('path');
const favicon = require('serve-favicon');
const controllers = require('./controllers');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', '/img/favicon_inverted/favicon.ico')));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

controllers.set(app);

app.listen(port, () => {
    console.log('HTTP server listening on port ' + port);
});