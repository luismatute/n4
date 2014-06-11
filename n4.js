#!/usr/bin/env node
// ==============================================
// 	File: n4.js
// 	Author: Luis Matute
// 	Description:
//   Search for 404 links on the provided domain
// ==============================================
'use strict'

// Vars and Dependencies ========================
	var argvs 		= require('minimist')(process.argv.slice(2)),
		request 	= require('request'),
		cheerio 	= require('cheerio'),
		url_mod		= require('url'),
		urls_obj 	= {},
		domain		= ''

// Checks if URL arg comes with 'http',
// if not, add it
var check_url = function (url) {
	if (!url.match(/^http(s)?/)) {
		url = 'http://'+url
	}
	var parsed_url = url_mod.parse(url)
	domain = parsed_url.protocol+'//'+parsed_url.hostname;
	return url
}

var traverse_structure = function () {
	var count = 0
	for (var key in urls_obj) {
		if (urls_obj[key].scrapped === false) {
			scrap(key)
			break
		}

		count++
		if (count === Object.keys(urls_obj).length) {
			// If we get here, scrapping has finished
			console.log('Finished scrapping the domain "'+domain+'".'+Object.keys(urls_obj).length+' links were found. Here are the results')
			console.log(urls_obj)

			console.log('\nErrors:');
			for (var key in urls_obj) {
				if ('error' in urls_obj[key]) {
					console.log(' Error:' + urls_obj[key].error + ' - "' + key + '"');
				}
			}
		}
	}
}

var mark_url = function (url, scrapped, error, referer) {
	scrapped = (scrapped)? scrapped: false;
	if (urls_obj[url] === undefined) {
		urls_obj[url] = { scrapped: scrapped, count: 1 }
		if (error) {
			urls_obj[url].error = error
		}
	} else {
		urls_obj[url].scrapped = true
		urls_obj[url].count += 1
	}
}

function scrap (url) {
	var request_url = url
	if (request_url.match(/^(\/[a-zA-Z]|$)/))
		request_url = domain+url // Puts the protocol and domain if only the path is provided

	console.log('Scrapping: '+request_url)
	request(request_url, function (error, response, body) {
		if (error) {
			console.log("Error: ")
			console.log(error);
			mark_url(url_mod.parse(request_url).path,false,error,url)
			traverse_structure()
			return false
		}

		if (!request_url.match(/(.js|.css)/i)) {
			var $ = cheerio.load(body)
			if (response.statusCode == 200) {
				var urls = $('[href],[src]')

				for (var i = 0; i < urls.length; i++) {
					var link = '' // Link to push

					// Determine if is src or href
					if('href' in urls[i].attribs) {
						link = urls[i].attribs.href
					} else {
						link = urls[i].attribs.src
					}

					// Removing URL queries
					if (link.indexOf('?') !== -1) {
						link = link.slice(0,link.indexOf('?'))
					}

					// Removing links that are external or are not valid
					if (link.match(/(^http(s)?|^\/\/|^tel|^mailto|^#)/i)) {
						link = ''
					}

					// Add to object if not empty and if it hasnt been added
					if (link !== '') {
						if (link.indexOf('/') !== 0) {
							link = '/'+link
						}
						if (urls_obj[link] === undefined) {
							urls_obj[link] = { scrapped: false, count: 0 }
						} else {
							urls_obj[link].count += 1
						}
					}
				}
				// Setting this URL as Scrapped and Add to count
				mark_url(url_mod.parse(request_url).path,true,null,url)
			} else {
				console.warn("Error: " + response.statusCode + ' - ' + url_mod.parse(request_url).path)
				mark_url(url_mod.parse(request_url).path,true,response.statusCode,url)
			}
		} else {
			// js or css
			mark_url(url_mod.parse(request_url).path,true,null,url)
		}
		traverse_structure()
	})
}

// Initial load
// urls_obj['/'] = { scrapped: false, count: 0 }
scrap(check_url(argvs._[0]))