/*
	Utilities
*/

var
	fs 			= require('fs'),
	path		= require('path'),
	fw_ini		= require('../config/ini'),
	defaults 	= {
		default_system: 	'front',
		default_section: 	'main',
		default_item: 		'index',
		reload: 			'reload',
		password: 			'true',

		// Methods
		systems_registrar: systems_registrar,
		view_from_url: view_from_url,
		log: log
	},
	util = merge(defaults,fw_ini)

function systems_registrar(app) {
	var systems = fs.readdirSync(app.locals.root_path + '/systems') // Getting the Systems

	app.locals.systems = systems // Making them available globally
	app.locals.routes = []
	app.set('views', app.locals.root_path+'/systems/')

	for (var i = 0; i < systems.length; i++) {
		var system_dir 			= app.locals.root_path+'/systems/'+systems[i],
			views_dir 			= system_dir+'/views',
			controllers_dir		= system_dir+'/controllers',
			sections 			= (fs.existsSync(views_dir))? fs.readdirSync(views_dir): [],
			controllers_array 	= (fs.existsSync(views_dir))? fs.readdirSync(controllers_dir): [],
			controllers_obj 	= {}

		app.use('/'+systems[i]+'/assets', system_dir+'/assets')

		for (var i = 0; i < controllers_array.length; i++) {
			controllers_obj[path.basename(controllers_array[i],'.js')] = controllers_array[i]
		}

		for (var step = 0; step < sections.length; step++) {
			var items = fs.readdirSync(views_dir+'/'+sections[step])

			for (var file = 0; file < items.length; file++) {
				items[file] = items[file].slice(0, items[file].lastIndexOf("."));
				var route = '/'+systems[i]+'/'+sections[step]+'/'+items[file]
				app.locals.routes.push( route )
				if( typeof controllers_obj[sections[step]] === 'string') {
					var controller = require(controllers_dir+'/'+controllers_obj[sections[step]])
					app.get(route, controller[items[file]] )
				} else {
					app.get(route, function(req,res){
						// send file
						var file_path = util.view_from_url('/home/index')
						res.render(file_path, {system: 'Admin'})
					})
				}
			}
		}
	}

	util.log(app.locals.routes)
}

// Builds the view path
// @param url
	function view_from_url(url) {
		var url_array = url.split('?')[0].split('/'),
			action = ''

		if( url_array[0] === '' ) url_array.shift()
		// Add System
		if( app.locals.systems.indexOf(url_array[0]) !== -1 ) {
			action += url_array[0]+'/views/'+url_array[1]+'/'+url_array[2]
		} else {
			action += util.default_system+'/views/'+url_array[0]+'/'+url_array[1]
		}
		return action
	}

// Generate a console.log()
// @param msg
	function log(msg) {
		console.log(msg)
	}

// Overwrites obj1's values with obj2's and adds obj2's if non existent in obj1
// @param obj1
// @param obj2
// @returns obj3 a new object based on obj1 and obj2
	function merge(obj1,obj2){
	    var obj3 = {}
	    for (var attrname in obj1) { obj3[attrname] = obj1[attrname] }
	    for (var attrname in obj2) { obj3[attrname] = obj2[attrname] }
	    return obj3
	}

// Exposing Module
	module.exports = util;