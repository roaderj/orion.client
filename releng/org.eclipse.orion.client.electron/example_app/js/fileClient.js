// Get file from server
define(['Deferred'],function(Deferred){
	var getJSON = function(message) {
		var d = new Deferred();
		var ipc = require('ipc');
		ipc.on('fileServer-reply', function(data) {
			d.resolve(data);
		});
		ipc.send('fileClient-sent', message);
		return d;
	}
	return {
		getJSON : getJSON
	};
});

