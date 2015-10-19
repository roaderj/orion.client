requirejs(['fileClient'],function(fileClient){
	fileClient.getJSON(function(data){
		console.log(data);
	});
});
