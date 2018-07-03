// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

var pressButton=Ti.Media.createAudioPlayer({
				url:'/music/pressButton.mp3'
			});

function doClickTwitter(){
	var Codebird = require("codebird");
	var cb = new Codebird();
	cb.setConsumerKey('	lMb5EfHvi5KXndZ1CI174utVJ', 'NqeI5xLfm0gldYTX5XXxQ2lpeZ8srMcMQVXY1sO7nFSAjJOfj1');
	cb.setToken( "	591516160-5RbIh79tDxtr1HqrE4FF9led7GOQrvlHsa6WlQpk" , "XFGUR0hY4GFw6cqrSnREJm2CPmsqojmfwN5eLZMwZDBE" );
	
	var descargar="Si quieres jugarlo descargalo desde http://simondice.000webhostapp.com/";
	var nombre=args.jugador;
	var tweet=nombre+" obtuviste "+args.puntos+ " puntos en el juego \'Simon Dice\' \n"+descargar;
	
	pressButton.start();
	cb.__call(
		"statuses_update",
		{"status":tweet},//"Whohoo, I just tweeted!"},
		function (reply, rate, err) {
		        	// ...
	});	
}

function doClickFacebook(){
	var fb=require('facebook');
	var nombre=args.jugador;
	var publicar=nombre+" obtuviste "+args.puntos+ " puntos en el juego \'Simon Dice\' \n";
	fb=args.fb;
	if(fb.loggedIn)
	{
			fb.addEventListener('shareCompleted', function (e) {
		        		if (e.success) {
		            		Ti.API.info('Share request succeeded.');
		        		} else {
		            		Ti.API.warn('Failed to share.');
		        		}
		    		});
			
			fb.presentShareDialog({
							hashtag:publicar,
			            	quote:publicar,
			            	message:publicar,
			        		link: 'http://simondice.000webhostapp.com/',
			            	name: 'Simon Dice',
			            	description: 'Simon Dice es un juego muy divertido',
			    		});
	  }	
	  
	 pressButton.start();
}

function doClickCerrar(){
	pressButton.start();
	$.RedesSociales.close();
}

$.lb_mensaje.setText("Fin del juego\nObtuviste "+args.puntos+" puntos \nCompartelo en:");
