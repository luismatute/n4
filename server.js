/*
	Server JS
	Developers:
		Luis Matute 		- luis.matute@me.com
		Adolfo Gutierrez	- adolfo.gutierrez.87@gmail.com
		Josue Rodriguez 	- joshvoll@yahoo.com
	Description:
		This is the server configuration.
*/

// Module Dependencies and App Instantiation
var settings 	= require('./config/express'),
	utilities 	= require('./config/utilities')

// App settings
	app = settings()

// Fire up the Server
	app.listen(app.locals.port, function () {
		console.log(
			'Express server listening on port ' + app.locals.port + '\n'
			+ 'With ' + app.get('env').toUpperCase() + ' Environment settings loaded'
		)
	})