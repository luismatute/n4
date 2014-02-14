var subSystemPath = '../views';

exports.index = function (req, res) {
	var file_path = app.locals.util.view_from_url('/home/index')
  	res.render(file_path,{system: 'FU'});
}