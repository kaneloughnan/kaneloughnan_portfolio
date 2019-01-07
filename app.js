const express = require('express');
const app = express();
const port = 8080;
const bodyParser = require('body-parser');
const fs = require('fs');
const ini = require('ini');
const xml2js = require('xml2js').parseString;
const config = ini.parse(fs.readFileSync(__dirname + '/../../kaneloughnan.ini', 'utf-8'))
const path = require('path');
const nodemailer = require('nodemailer');
const nl2br  = require('nl2br');
const favicon = require('serve-favicon');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', '/img/favicon_inverted/favicon.ico')));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

app.post('/getXML', (req, res) => {
    var xml = req.body.xml;
    var response = {
        success: true,
        data: [],
        error_msgs: []
    };
    
    fs.readFile(__dirname + '/public/assets/' + xml + '.xml', 'utf8', function(err, data) {
        xml2js(data, function (err, result) {
            response.data = result;
            res.send(response);
        });
    });
});

app.post('/getGallery', (req, res) => {
    var response = {
        success: true,
        images: [],
        description: "",
        error_msgs: []
    };
    var id = req.body.id;
    
    fs.readdir(__dirname + '/public/img/portfolio/' + id + '/gallery/', function(err, items) {
        response.images = items;

        fs.readFile(__dirname + '/public/assets/portfolio.xml', 'utf8', function(err, data) {
            xml2js(data, function (err, result) {
                var items = result.root.tile;

                for(var i = 0; i < items.length; i++)
                {
                    if(items[i].id[0] == id)
                    {
                        response.description = items[i].description[0];

                        break;
                    }
                }

                res.send(response);
            });
        });
    });
});

app.post('/contact', (req, res) => {
    var response = {
        success: true,
        error_msgs: []
    };
    var transporter = nodemailer.createTransport({
        
        service: 'gmail',
        auth: {
            user: config.email.username,
            pass: config.email.password
        }
    });
    var mailOptions = {
        from: config.email.username,
        to: config.email.username,
        subject: 'Sending Email using Node.js',
        html: '<p><strong>Name:</strong> ' + req.body.name + '</p>' + 
        '<p><strong>Email:</strong> ' + req.body.email + '</p>' + 
        '<p><strong>Subject:</strong> ' + req.body.subject + '</p>' + 
        '<p><strong>Message:</strong> ' + nl2br(req.body.message) + '</p>'
    };

    transporter.sendMail(mailOptions, function(err, info){
        if(err)
        {
            response.success = false;
            response.error_msgs.push(err);
            res.status(400).send(response);
        }
        else
        {
            res.send(response);
        }
    });
});
 
app.listen(port, () => {
    console.log('HTTP server listening on port ' + port);
});