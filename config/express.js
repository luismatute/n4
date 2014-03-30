var express 	= require('express'),
	path 		= require('path'),
	env 		= process.env.NODE_ENV || 'development',
	request 	= require('request'),
	cheerio		= require('cheerio'),
	// Instantiate Express
	app 		= express(),
	setup

setup = function() {
	// Env Settings and App variables
	app.locals( require('./environments')[env] )
	app.locals.root_path = path.dirname(__dirname)

	// All Envs
	app
		.set('views', path.join(app.locals.root_path, 'views'))
		.set('view engine', 'jade')
		.set('env', env)
		.use(express.favicon())
		.use(express.logger('dev'))
		.use(express.json())
		.use(express.urlencoded())
		.use(express.multipart())
		.use(app.router)

	// development only
	if (env !== 'development') {
  		app.use(express.errorHandler())  // This will show us a detailed error in development
	}

	app.get('/', function(req,res) {
		res.render('index');
	})

	app.post('/scrapper', function(req,res) {
		var urls = []

		request(req.body.url, function (err, resp, body) {
			var $ = cheerio.load(body)
			if ( !err && resp.statusCode == 200 ) {
				$('a').each(function (index, element) {
					var url = this.attr('href')
					urls.push(url)
				})
				console.log(urls);
			}
		})
		res.render('index')
	})

	// assume 404 since no middleware responded
	app.use(function(req, res, next){
		res.status(404).render(path.join(__dirname, 'common/views/404'), {
			url: req.originalUrl,
			error: 'Not found'
		})
	})
	return app
}

// Exposing Module
module.exports = setup;