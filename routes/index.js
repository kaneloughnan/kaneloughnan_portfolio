var express = require('express');
var router = express.Router();
var fs = require('fs');
var xml2js = require('xml2js').parseString;
var nodemailer = require('nodemailer');
var nl2br  = require('nl2br');
var ini = require('ini');
var config = ini.parse(fs.readFileSync(__dirname + '/../../../kaneloughnan.ini', 'utf-8'));
var MongoClient = require('mongodb').MongoClient;
var MongoURL = "mongodb://localhost:27017/";

/* GET home page. */
router.get('/', function(req, res, next) {
	var experiences = [
		{
			image: 'mandoe.png', 
			imageAlt: 'Mandoe logo', 
			heading: 'Mandoe', 
			title: 'Web Programmer', 
			text: 'Further developing all programming and teamwork skills. Also filled in on the service desk for 3 months', 
			skills: ['HTML5', 'CSS3', 'JavaScript', 'PHP', 'MySQL', 'Teamwork', 'Customer Service'], 
			date: '2014 - Present'
		}, {
			image: 'tafe.jpg', 
			imageAlt: 'TAFE logo', 
			heading: 'North Sydney TAFE', 
			title: 'Diploma – Website Development', 
			text: 'Further developed HTML, CSS, JavaScript and learned PHP and MySQL', 
			skills: ['HTML5', 'CSS3', 'JavaScript', 'PHP', 'MySQL'], 
			date: '2013'
		}, {
			image: 'tafe.jpg', 
			imageAlt: 'TAFE logo', 
			heading: 'Loftus TAFE', 
			title: 'Certificate IV – Web Based Technologies', 
			text: 'Further developed HTML and CSS skills and started JavaScript', 
			skills: ['HTML5', 'CSS3', 'JavaScript', 'SEO', 'Teamwork'], 
			date: '2012'
		}, {
			image: 'tafe.jpg', 
			imageAlt: 'TAFE logo', 
			heading: 'Loftus TAFE', 
			title: 'Certificate IV – Multimedia', 
			text: 'Studied a broad range of technologies in Multimedia', 
			skills: ['HTML5', 'CSS3', 'Video editting', 'Adobe Creative Suite', '2D & 3D Animation'], 
			date: '2011'
		}, {
			image: 'subway.png', 
			imageAlt: 'Subway logo', 
			heading: 'Subway', 
			title: 'Sandwich Artist', 
			text: 'Worked at Subway for 7 years', 
			skills: ['Communication', 'Leadership', 'Customer Service'], 
			date: '2010 - 2017'
		}
	];

	var skills = [
		{src: 'html5.png', alt: 'HTML5 logo'}, 
		{src: 'css3.png', alt: 'CSS3 logo'}, 
		{src: 'sass.png', alt: 'Sass logo'}, 
		{src: 'js.png', alt: 'JavaScript logo'}, 
		{src: 'jquery.gif', alt: 'jQuery logo'}, 
		{src: 'php.png', alt: 'PHP logo'}, 
		{src: 'nodejs.png', alt: 'Node.js logo'}, 
		{src: 'express.png', alt: 'Express logo'}, 
		{src: 'mysql.png', alt: 'MySQL logo'}, 
		{src: 'mongodb.png', alt: 'MongoDB logo'}, 
		{src: 'bootstrap.png', alt: 'Bootstrap logo'}, 
		{src: 'git.png', alt: 'Git logo'}, 
		{src: 'jira.png', alt: 'JIRA logo'}, 
		{src: 'microsoft_office.png', alt: 'Microsoft Office logo'}, 
		{src: 'bash.png', alt: 'Bash logo'}, 
		{src: 'godaddy.png', alt: 'GoDaddy logo'}, 
		{src: 'netsuite.png', alt: 'Netsuite logo'}, 
		{src: 'rti.png', alt: 'RTI logo'}
	];

	var tiles = [
		{id: 'mandoe_website', title: 'Mandoe Website'}, 
		{id: 'tablet_kiosk', title: 'Tablet & Kiosk'}, 
		{id: 'mobile_website', title: 'Mobile Web Development'}, 
		{id: 'pdf_tracking', title: 'PDF Tracking'}, 
		{id: 'queuing', title: 'Queuing'}, 
		{id: 'reporting', title: 'Reporting & Analytics'}
	];

  	res.render('index', {
		  title: 'Express',
		  skills: skills, 
		  experiences: experiences, 
		  tiles: tiles
	});
});

router.post('/getGallery', (req, res) => {
	var response = {
		success: true,
		images: [],
		description: "",
		error_msgs: []
	};
	var id = req.body.id;

	fs.readdir(__dirname + '/../public/images/portfolio/' + id + '/gallery/', function(err, items) {
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

router.post('/contact', (req, res) => {
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
		to: 'kane.loughnan@gmail.com',
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

router.post('/logVisit', (req, res) => {
	var response = {
		success: true,
		error_msgs: []
	};
	var data = req.body;

	MongoClient.connect(MongoURL, { useNewUrlParser: true }, function(err, db)
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

module.exports = router;