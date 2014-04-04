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
		var urls = [],
			initial_url = req.body.url
		function url_proto () {
			this.url = initial_url;
			this.path = '/';
			this.checked = false;
		}

		makeRequest(new url_proto(), url_proto, urls)
		console.log(urls);
		console.log(urls.length);
		res.render('index')
	})

	function makeRequest (url_obj, url_proto, urls) {
		request(url_obj.url + url_obj.path, function (err, resp, body) {
			var $ = cheerio.load(body)

			for (var i = 0; i < urls.length; i++) {
				if ( urls[i].path === url_obj.path )
					urls[i].checked = true
					break
			}

			if ( !err && resp.statusCode == 200 ) {
				$('a').each(function (index, element) {
					var tmp_url_obj = new url_proto()
					if ( addUrl( this.attr('href'), url_proto, urls ) ) {
						var formatted_url = this.attr('href');
						formatted_url = (formatted_url.indexOf('/') == 0)? formatted_url: '/'+formatted_url
						tmp_url_obj.path = formatted_url
						urls.push(tmp_url_obj)
					}
				})
				for (var i = 0; i < urls.length; i++) {
					if ( urls[i].checked === false )
						var new_url_obj = new url_proto()
						new_url_obj.path = urls[i].path
						makeRequest(new_url_obj,url_proto,urls)
						break
				}
			}
		})
	}

	function addUrl (url, urls) {
		// function url_proto () {
		// 	this.url = '/';
		// 	this.checked = false;
		// }

		if(
			typeof url == 'string'
			&& url != ''
			&& !/#|tel:|mailto:|http[s]?/i.test(url)
		) {
			var exists_in_array = false
			url = (url.indexOf('/') == 0)? url: '/'+url
			for (var i = 0; i < urls.length; i++) {
				if ( urls[i].path === url )
					exists_in_array = true
			}
			if (!exists_in_array) {
				// urls.push(url_obj)
				return true
			} else {
				return false
			}
		}
	}

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