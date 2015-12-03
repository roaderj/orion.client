requirejs(['fileClient'],function(fileClient){
	var d = fileClient.getJSON('test1');
	d.then(function(result){
	    console.log(result);
	});
	var d2 = fileClient.getJSON('test2');
	d2.then(function(result){
	    console.log(result);
	});
});
