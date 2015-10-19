// Get file from server
define(function(){
	var getJSON = function(callback) {
		var ipc = require('ipc');
		ipc.on('fileServer-reply', function(data) {
			callback(data);
		});
		ipc.send('fileClient-sent', 'index');
	}
	return {
		getJSON : getJSON
	};
});

