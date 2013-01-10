var socket = io.connect('http://localhost:3000');

var load = function() {
	socket.on('conectados',function (data) {
		console.log(data);
	});
	socket.on('history',function (data) {
		var history = '';
		for(var c in data)
		{	
			history = '<article class="msg"><section class="foto"><img src="'+ data[c].Foto +'" /></section><section class="nombre">'+data[c].Usuario+'</section><section class="mensaje">'+data[c].Chat+'</section></article>' + history;
		};
		$('#messages').append(history);
		$('#messages').animate({ scrollTop: 60000 }, 'slow');
	});
	socket.on('nMensaje',function (data){
		$('#messages').append('<article class="msg"><section class="foto"><img src="'+ data.picture +'" /></section><section class="nombre">'+data.nombre+'</section><section class="mensaje">'+data.mensaje+'</section></article>');
	   	$('#messages').animate({ scrollTop: 60000 }, 'slow');
	});
	$('#say input').keypress(function (e) {
	    if(e.which == 13) {
	    	var message = $('#say input').val();
	    	socket.emit('mensaje',message);
	    	$('#say input').attr("value","");
	    }
	});
};

$(document).on('ready', load);