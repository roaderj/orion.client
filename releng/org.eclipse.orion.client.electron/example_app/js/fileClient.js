// Get file from server
define(['Deferred'],function(Deferred){
	var getJSON = function(message) {
		var d = new Deferred();
		var ipc = nodereq('electron').ipcRenderer;
		ipc.on(message + '-reply', function(event,data) {
			d.resolve(data);
		});
		ipc.send('fileClient-sent', message);
		return d;
	}
	return {
		getJSON : getJSON
	};
});

