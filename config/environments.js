// Global Keys
var splunk = {
		APIURL: "",
		token: "",
		projectID: ""
	},
	mongo01 = {serverName:'mongodb://localhost',serverPort:'27017'},
	emailList = ["luis.matute@me.com","adolfo.gutierrez.87@gmail.com","joshvoll@yahoo.com"],

	// Actual Conf
	config = {
		// Development Configs
		development: {
			// App Settings
			port: process.env.PORT || 3000,
			title: 'Skeleton-Dev',

			// Mongo
			mongo: {
				dsn: "",
				username: "",
				password: "",
				hosts: [ mongo01 ]
			},
			// Git
			git: {
				branch: "dev",
				project_name: ""
			},
			// Splunk
			splunk: splunk,
			emailList: emailList,
			keyMandrillAPI: "",
		},

		// Production Configs
		production: {
			port: process.env.PORT || 8080,
			title: 'Skeleton-Prod',
			// Mongo
			mongo: {
				dsn: "",
				username: "",
				password: "",
				hosts: [ mongo01 ]
			},
			// Git
			git: {
				branch: "dev",
				project_name: ""
			},
			// Splunk
			splunk: splunk,
			emailList: emailList,
			keyMandrillAPI: "",
		}
	}

// Exposing Module
module.exports = config;