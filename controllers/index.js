module.exports.set = function(app) {
    var fs = require('fs');
    var xml2js = require('xml2js').parseString;
    var nodemailer = require('nodemailer');
    var nl2br  = require('nl2br');
    var ini = require('ini');
    var config = ini.parse(fs.readFileSync(__dirname + '/../../../kaneloughnan.ini', 'utf-8'));
    var MongoClient = require('mongodb').MongoClient;
    var MongoURL = "mongodb://localhost:27017/";
    
    app.post('/getGallery', (req, res) => {
        var response = {
            success: true,
            images: [],
            description: "",
            error_msgs: []
        };
        var id = req.body.id;

        fs.readdir(__dirname + '/../public/img/portfolio/' + id + '/gallery/', function(err, items) {
            response.images = items;
    
            fs.readFile(__dirname + '/../public/assets/portfolio.xml', 'utf8', function(err, data) {
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
            subject: 'Someone filled out the form at kaneloughnan.com',
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

    app.post('/logVisit', (req, res) => {
        var response = {
            success: true,
            error_msgs: []
        };
        var data = req.body;

        MongoClient.connect(MongoURL, function(err, db)
        {
            if(err)
            {
                response.success = false;
                response.error_msgs.push(err);
                res.status(400).send(response);
            }

            var dbo = db.db('kaneloughnan');

            dbo.collection('visits').insertOne(data, function(err, res) {
                if(err)
                {
                    response.success = false;
                    response.error_msgs.push(err);
                    res.status(400).send(response);
                }

                db.close();
            });
        });

        res.send(response);
    });
}