requirejs(['fileClient'],function(fileClient){
	var d = fileClient.getJSON('index');
	d.then(function(result){
	    console.log(result);
	});
});
