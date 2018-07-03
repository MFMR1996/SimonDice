var jugadores=Alloy.Collections.jugadores;

var tv_lista = Ti.UI.createTableView({ objName: 'table' });
var tv_rank = Ti.UI.createTableView({ objName: 'table2' });
Ti.App.Properties.setInt('idJugador',0);
Ti.App.Properties.setBool('subscrito',false);
var toast=Ti.UI.createNotification({});
var fb=require('facebook');


var pressButton=Ti.Media.createAudioPlayer({
				url:'/music/pressButton.mp3'
			});
			
var secuenciaColor=Ti.Media.createAudioPlayer({
				url:'/music/secuenciaColor.mp3'
			});
			
function limpiar(){
	Ti.App.Properties.setInt('idBoton',0);
	Ti.App.Properties.setInt('Puntos',0);
	Ti.App.Properties.setInt('i',0);
	Ti.App.Properties.setBool('inicio',false);
	Ti.App.Properties.setBool('jugando',false);
	Ti.App.Properties.setInt('nivel',1);
	Ti.App.Properties.setBool('fin',false);	
	Ti.App.Properties.setList('secuencia',[]);	
}

function pushNotification(){
	var CloudPush = require('ti.cloudpush');
	var Cloud = require("ti.cloud");
	var deviceToken =null;
	
	CloudPush.debug = true;
    CloudPush.enabled = true;
	CloudPush.showTrayNotificationsWhenFocused = true;
	CloudPush.focusAppOnPush = false;
	
	Cloud.debug = true;
	 
	CloudPush.retrieveDeviceToken({
    	success: deviceTokenSuccess,
    	error: deviceTokenError
	});
	
	function deviceTokenSuccess(e) {
    		deviceToken = e.deviceToken;
	}
	function deviceTokenError(e) {
    		alert('Failed to register for push notifications! ' + e.error);
	}
	
	
	CloudPush.addEventListener('trayClickLaunchedApp', function (evt) {
    		Ti.API.info('Tray Click Launched App (app was not running)');
	});
	CloudPush.addEventListener('trayClickFocusedApp', function (evt) {
    		Ti.API.info('Tray Click Focused App (app was already running)');
	});
	
	
	CloudPush.addEventListener('callback', function (evt) {
		var notificacion=JSON.parse(evt.payload);
    	alert("Notification received: " + notificacion.android.alert);
	});
	
	setTimeout(function(){
		Cloud.PushNotifications.subscribeToken({
        	device_token: deviceToken,
        	channel: 'news_alerts',
        	type: Ti.Platform.name === 'android' ? 'android' : 'ios'
    	}, function (e) {
        if (e.success) {
            Ti.App.Properties.setBool('subscrito',true);
        } else {
            alert('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
        }
    	});
	},10000);
	
	setTimeout(function(){
	var latitude;
	var longitude; 
	var pushDeviceToken; // Device token obtained earlier...

		Titanium.Geolocation.getCurrentPosition(function(e) {
	    	if (e.error) {
	        	Ti.API.error('Error: ' + e.error);
	    	} else {
	        	latitude = e.coords.latitude;
	        	longitude = e.coords.longitude;
	        	Cloud.PushNotifications.updateSubscription({
	        	device_token: deviceToken,
	       		loc: [longitude, latitude]
	       }, function (e) {
	            if (e.success) {
	                alert('Subscription Updated.');
	            }
	            else {
	                alert(e);
	            }
	        });                        
	    }
		});
	},20000);
}

//------------------------------Ranking---------------------------------------------
	
function doClickRank() {
	var w_ranking=Ti.UI.createWindow({
		backgroundColor:'white',
		layout:'vertical',
		width:'100%',
		height:'100%'	
	});
	
	var v_cabeceraRank=Ti.UI.createView({
		width:'100%',
		height:'10%',
		layout:'absolute',
		backgroundColor:'#C0C0C0'
	});
	
	var lb_titulo=Ti.UI.createLabel({
	    text:'Ranking',
		color:"white",
	    height:'60%',
	    width:'70%', 
	    textAlign:'left', 
	    font:{ fontSize:20 },
	    left:'5%' 
	});
	
	var btn_cerrar=Ti.UI.createButton({
		backgroundColor:'black',
		borderColor:'white',
		title:'cerrar',
		color:'white',
		height:'60%',
		width:'20%',
		right:'5%'
	});
	
	btn_cerrar.addEventListener('click',function(){
		w_ranking.close();
	});
	
	jugadores.fetch();
	if(jugadores.length!=0)
	{
			var datos=[];
			for(var j=1;j<(jugadores.length+1);j++){
				var encontrado=jugadores.where({rank:j});
				var jugador=encontrado[0];
			    var nom=jugador.get('nombre');
			    var rank=jugador.get('rank');
			    var puntos=jugador.get('puntos');
			        	
			    var row = Ti.UI.createTableViewRow({
					className: 'row',
					objName: 'row',
					touchEnabled: true,
					height:50
				});
						
				var v_rank=Ti.UI.createView({
					backgroundColor:'white',
					width: '80%',
					borderColor:'black',
					borderWidth:1,
					borderRadius:1,
					height: 50,
					layout: 'absolute'
				});
		
						
				var lb_rank=Ti.UI.createLabel({
			        text:rank+'.'+nom,
					color:"black",
			    	height:18,
			    	width:'60%', 
			    	textAlign:'left', 
			    	left:'5%',
			    	font:{ fontSize:14 } 
				});
				
				var lb_puntos=Ti.UI.createLabel({
			        text:puntos,
					color:"black",
			    	height:18,
			    	width:'20%', 
			    	textAlign:'left',
			    	right:'5%', 
			    	font:{ fontSize:14 } 
				});
				
				v_rank.add(lb_puntos);		
				v_rank.add(lb_rank);	        	
				row.add(v_rank);
			    datos.push(row);
			 }
			tv_rank.setData(datos);
	}
	
	pressButton.start();
	
	v_cabeceraRank.add(lb_titulo);
	v_cabeceraRank.add(btn_cerrar);
	
	w_ranking.add(v_cabeceraRank);
	w_ranking.add(tv_rank);
	w_ranking.open();
}


function doClickFacebook(){
		
		
		pressButton.start();
		
		var win= Ti.UI.createWindow({
			height:'100%',
			width:'100%',
			backgroundColor:'white',
		});
		
		var fotoPerfil=Ti.UI.createImageView({
					height: '30%',
					width:'40%',
					top:"5%"
			});
			
		var cerrar=Ti.UI.createButton({
			title:"x",
			top:'5%',
			right:"5%",
			backgroundColor:'red',
			color:'white',
			width:"5%",
			height:'5%'
		});
			
		var v_datos=Ti.UI.createView({
			height:'30%',
			width:'100%',
			layout:'absolute',
			backgroundColor:'white',
			top:'40%',
			right:'0%'
		});
		
		var lb_nombre=Ti.UI.createLabel({
			color:'black',
			text:'Nombre del usuario:',
			font: {
				fontSize:'15%'
			},
			top:'5%',
			left:'5%',
			width:'80%',
			height:'30%'
		});
		
		
		var lb_jugador=Ti.UI.createLabel({
			color:'black',
			text:'Nombre del jugador:',
			font: {
				fontSize:'15%'
			},
			top:'30%',
			left:'5%',
			width:'80%',
			height:'30%'
		});
		
		
		var lb_puntos=Ti.UI.createLabel({
			color:'black',
			text:'Puntos:',
			font: {
				fontSize:'15%'
			},
			top:'60%',
			left:'5%',
			width:'80%',
			height:'30%'
		});
//------------------------------------------CONECTAR CON FACEBOOK------------------------------		
	 	fb.permissions = ['email'];
	 	fb.initialize();
	 	fb.addEventListener('login', function(e) {
			    if (e.success) {
			        var nombre=JSON.parse(e.data).name;
			        Ti.App.Properties.setString('usuarioFB',nombre);
			        lb_nombre.setText('Nombre del usuario: '+nombre);
			        
			        fb.requestWithGraphPath('me/picture', {'redirect': 'false'}, 'GET',  function(r) {
					        if (!r.success) {
					            if (r.error) {
					                alert(r.error);
					            } else {
					                alert("call was unsuccessful");
					            }
					            return;
					        }
					      
					        var result = JSON.parse(r.result);
					        var url=result.data.url;
					        Ti.App.Properties.setString('urlFoto',url);
					        fotoPerfil.setImage(result.data.url);
					        win.add(fotoPerfil);
					    });
			        
			    }
			    else if (e.cancelled) {
			        alert('cancelled');
			    }
			    else {
			        alert(e.error);
			    }
		});
		
		var loginButton = fb.createLoginButton({
			readPermissions: ['email'],
			bottom:'10%',
			height:'15%',
		});
		
		loginButton.readPermissions = ['email'];
		win.add(loginButton); 
		
		//fb.authorize();
	 	win.fbProxy = fb.createActivityWorker({lifecycleContainer: win});
	 	
	 	cerrar.addEventListener('click',function(){
	 		pressButton.start();
	 		win.close();
	 	});
	 	
//-------------------Mostrar datos del jugador---------------------------------------
	 	var id=Ti.App.Properties.getInt('idJugador');
		var jugador=jugadores.get(id);
		var tipoDato=typeof(jugador);
			
		if(tipoDato!=="undefined")
		{
			var jugadorNombre=jugador.get('nombre');
			var puntos=jugador.get('puntos');
			lb_jugador.setText('Nombre del jugador: '+jugadorNombre);
			lb_puntos.setText('Puntos: '+puntos);
   		}
   		
   		if(fb.loggedIn)
   		{
   			lb_nombre.setText('Nombre del usuario: '+Ti.App.Properties.getString('usuarioFB'));
   			var foto=Ti.App.Properties.getString('urlFoto');
   			fotoPerfil.setImage(foto);
			win.add(fotoPerfil);	
   		}
	 	
	 	v_datos.add(lb_nombre);
		v_datos.add(lb_jugador);
		v_datos.add(lb_puntos);
		
		win.add(cerrar);
		win.add(v_datos);
		win.open(); 		
}

//------------------------------CLICK COLORES---------------------------------------------
function doClickVerde(){
	
	setTimeout(function(){
		$.bVerde.setBackgroundColor('#C0FCB7');
		Jugando();
	},80);
						
	setTimeout(function(){
		$.bVerde.setBackgroundColor('#1BC502');
	},50);
	
	Ti.App.Properties.setInt('idBoton',1);
	pressButton.start();
}

function doClickRojo(){
	setTimeout(function(){
		$.bRojo.setBackgroundColor('#FF807E');
		Jugando();
	},80);
						
	setTimeout(function(){
		$.bRojo.setBackgroundColor('#FC0804');
	},50);
	
	Ti.App.Properties.setInt('idBoton',2);
	pressButton.start();
}

function doClickAmarillo(){
	setTimeout(function(){
		$.bAmarillo.setBackgroundColor('#FEFEB3');
		Jugando();
	},80);
						
	setTimeout(function(){
		$.bAmarillo.setBackgroundColor('#FFFF03');
	},50);
	
	Ti.App.Properties.setInt('idBoton',3);
	pressButton.start();
}

function doClickAzul(){
	setTimeout(function(){
		$.bAzul.setBackgroundColor('#ABEDFE');
		Jugando();
	},80);
						
	setTimeout(function(){
		$.bAzul.setBackgroundColor('#055FD1');
	},50);
	Ti.App.Properties.setInt('idBoton',4);
	pressButton.start();
}


//------------------------CONTROL DE JUGADORES--------------------------------------

function cargarJugadores(guardar){
	jugadores.fetch();
	var datos=[];
	
	        for(var j=0;j<jugadores.length;j++){
	        	
	        	var jugador=jugadores.at(j);
	        	var nom=jugador.get('nombre');
	        	var id=jugador.get('jugador_id');
	        	
	        	if((guardar)&&(id==(jugadores.length)))
	        	{
	        		jugador.save({rank:id});	
	        	}
	        	
	        	var row = Ti.UI.createTableViewRow({
				    className: 'row',
				    objName: 'row',
				    touchEnabled: true,
				    height:50
				  });
				
				var v_jugador=Ti.UI.createView({
					backgroundColor:'white',
					width: '80%',
					borderColor:'black',
					borderWidth:1,
					borderRadius:1,
					height: 50,
					layout: 'absolute'
				});

				
				var lb_nombre=Ti.UI.createLabel({
	        			text:id+'.'+nom,
						color:"black",
	    				height:18,
	    				width:'80%', 
	    				textAlign:'left', 
	    				font:{ fontSize:14 } 
				});
		
				v_jugador.add(lb_nombre);	        	
				row.add(v_jugador);
	        	datos.push(row);
	        }
	        tv_lista.setData(datos);
	
}

function doClickJugador(){
	var w_jugadores=Ti.UI.createWindow({
		backgroundColor:'white',
		layout:'vertical',
		width:'100%',
		height:'100%',
		windowSoftInputMode:Ti.UI.Android.SOFT_INPUT_ADJUST_PAN
	});
	
	var v_cabeceraLista=Ti.UI.createView({
		width:'100%',
		height:'10%',
		layout:'absolute',
		backgroundColor:'#C0C0C0'
	});
	
	var lb_titulo=Ti.UI.createLabel({
	    text:'Lista de Jugadores',
		color:"white",
	    height:'60%',
	    width:'70%', 
	    textAlign:'left', 
	    font:{ fontSize:20 },
	    left:'5%' 
	});
	
	var btn_cerrar=Ti.UI.createButton({
		backgroundColor:'black',
		borderColor:'white',
		title:'cerrar',
		color:'white',
		height:'60%',
		width:'20%',
		right:'5%'
	});
	
	btn_cerrar.addEventListener('click',function(){
		w_jugadores.close();
	});
	
	var v_Agregar=Ti.UI.createView({
		width:'100%',
		height:'15%',
		layout:'horizontal'
	});
	
	var tf_nombre=Ti.UI.createTextField({
		width:'70%',
		height:'70%',
		hintText:'Nuevo Jugador',
		color:'black',
		hintTextColor:'gray',
		borderColor:'black',
		borderRadius:10,
		left:'10%',
		borderStyle:Ti.UI.INPUT_BORDERSTYLE_ROUNDED
	});
	
	var btn_Agregar=Ti.UI.createButton({
		title:'+',
		color:'white',
		height:'60%',
		width:'15%',
		right:'5%'
	});
		
	btn_Agregar.addEventListener('click',function(){
			
			var jug=Alloy.createModel('jugadores',{
				nombre:tf_nombre.getValue(),
				puntos:0,
				});
			jug.save();
			tf_nombre.value='';
			jugadores.fetch();
			cargarJugadores(true);
			
	});
	cargarJugadores(false);
	
	tv_lista.addEventListener('click',function(e){
		var fuente=e.source;
		var dato=fuente.text;
		
		var tipoDato=typeof(dato);
		if(tipoDato=='string')
		{
			var datos_jugador=dato.split('.');
			var id_act=datos_jugador[0];
			id_act=parseInt(id_act);
			
			var model=jugadores.get(id_act);
			$.labelJugador.setText(datos_jugador[1]);
			$.labelPuntos.setText(model.get('puntos'));
			Ti.App.Properties.setInt('idJugador',id_act);
			w_jugadores.close();
			
		}
	});
	
	toast.setMessage('Presiona el nombre del jugador deseado');
	toast.show();
	
	v_cabeceraLista.add(lb_titulo);
	v_cabeceraLista.add(btn_cerrar);
	
	v_Agregar.add(tf_nombre);
	v_Agregar.add(btn_Agregar);
	
	w_jugadores.add(v_cabeceraLista);
	w_jugadores.add(v_Agregar);
	w_jugadores.add(tv_lista);
	w_jugadores.open();
	
}


//------------------------------JUEGO---------------------------------------------

function actualizaRank(){
	var temp;
	var id=Ti.App.Properties.getInt('idJugador');
	var jugadorA=jugadores.get(id);
	var recordA=jugadorA.get('puntos');
	var rankA=jugadorA.get('rank');
	
	for(var i=(rankA-1);i>0;i--)
	{
		var encontrado=jugadores.where({rank:i});
		var jugadorB=encontrado[0];
		var recordB=jugadorB.get('puntos');
		var rankB=jugadorB.get('rank');
		
		if(recordA>recordB)
		{
			temp=rankB;
			rankB=rankA;
			rankA=temp;
			
			jugadorA.set({
			rank:rankA
			});
			
			jugadorB.set({
			rank:rankB
			});
			
			jugadorA.save();
			jugadorB.save();
		}
		else{
			i=0;
		}
	}
	jugadores.fetch();
	
};

function actualizaPuntos(puntos){
	
	if(jugadores.length!=0)
	{
		var id=Ti.App.Properties.getInt('idJugador');
		var jugador=jugadores.get(id);
		var tipoDato=typeof(jugador);
		if(tipoDato!=="undefined")
		{
			var record=jugador.get('puntos');
			var JuegoTerminado=Ti.App.Properties.getBool('fin');
			if((puntos>record)&&JuegoTerminado)
			{
				jugador.set({
				puntos:puntos
				});
				jugador.save();
			}
			
			actualizaRank();	
		}	
	}
}

function secuencia(elemento){
		var secuen=Ti.App.Properties.getList('secuencia');
		var seleccionado=secuen[elemento];
		var jugando=Ti.App.Properties.getList('jugando');
		
		if(jugando)
		{
			if(elemento<secuen.length)
			{
				switch(seleccionado) {
					case 1:
						setTimeout(function(){
							$.bVerde.setBackgroundColor('#1BC502');
						},600);
						
						setTimeout(function(){
							secuenciaColor.start();
							$.bVerde.setBackgroundColor('#C0FCB7');
							elemento++;
							secuencia(elemento);
						},800);
						break;
					case 2:
						setTimeout(function(){
							$.bRojo.setBackgroundColor('#FC0804');
						},600);
						
						setTimeout(function(){
							secuenciaColor.start();
							$.bRojo.setBackgroundColor('#FF807E');
							elemento++;
							secuencia(elemento);
						},800);
						break;
					case 3:
						setTimeout(function(){
								$.bAmarillo.setBackgroundColor('#FFFF03');
						},600);
						setTimeout(function(){
							secuenciaColor.start();
							$.bAmarillo.setBackgroundColor('#FEFEB3');
							elemento++;
							secuencia(elemento);
						},800);
						break;
					case 4:
						setTimeout(function(){
							$.bAzul.setBackgroundColor('#055FD1');
						},600);
						setTimeout(function(){
							secuenciaColor.start();
							$.bAzul.setBackgroundColor('#ABEDFE');
							elemento++;
							secuencia(elemento);
						},800);
						break;
					}
			}
			else
			{
				Ti.App.Properties.setBool('inicio',true);
			}
		}
}

function Jugando(){
	var puntos=Ti.App.Properties.getInt('Puntos');
	var i=Ti.App.Properties.getInt('i');
	var idBoton=Ti.App.Properties.getInt('idBoton');
	var camino=Ti.App.Properties.getList('secuencia');
	var empezar=Ti.App.Properties.getBool('inicio');
	var nivel=Ti.App.Properties.getInt('nivel');

	if(empezar)
	{
		if(idBoton==camino[i])
		{
			i++;
			puntos++;	
			$.labelPuntos.setText(puntos);
			Ti.App.Properties.setInt('Puntos',puntos);
			Ti.App.Properties.setInt('i',i);
			Ti.App.Properties.setInt('idBoton',0);
			
			if(i==camino.length)
			{
				
				toast.setMessage('Muy bien...!! Sigue Asi');
				toast.show();
				
				nivel++;
				actualizaPuntos(puntos);
				
				Ti.App.Properties.setInt('i',0);
				Ti.App.Properties.setBool('inicio',false);
				Ti.App.Properties.setBool('jugando',false);
				Ti.App.Properties.setInt('nivel',nivel);
						
					doClickStart();
			}
		}
		else{
			Ti.App.Properties.setBool('fin',true);
			toast.setMessage("Fallaste\nObtuviste "+puntos+" puntos");
			toast.show();
			
			actualizaPuntos(puntos);
			limpiar();
			
			var fail=Ti.Media.createAudioPlayer({
				url:'/music/fail.mp3'
			});
			
			fail.start();
			setTimeout(function(){Publicar(puntos);},3000);
		}
	}
	
}

//------------------------------CONTROL DEL JUEGO---------------------------------------------
function doClickStart(){
	var nivel=Ti.App.Properties.getInt('nivel');
	var camino=Ti.App.Properties.getList('secuencia');
	var jugando=Ti.App.Properties.getBool('jugando');
		if(nivel==1)
		{
			toast.setMessage('Inicio del juego');
			toast.show();
			pressButton.start();	
		}
		
		if(!jugando){
			Ti.App.Properties.setBool('jugando',true);
			
				var slecBoton=((Math.round(Math.random()*10))%4)+1;
				camino.push(slecBoton);
				
				Ti.App.Properties.setList('secuencia',camino);
						
				jugando=Ti.App.Properties.getBool('jugando');
						
				setTimeout(function(){
					secuencia(0);
				},700);	
		}
}

function doClickStop(){
	toast.setMessage('Juego Terminado');
	toast.show();
	pressButton.start();
	var puntos=Ti.App.Properties.getInt('Puntos');
	
	Publicar(puntos);
	Ti.App.Properties.setBool('fin',true);
	actualizaPuntos(puntos);
	limpiar();
}


//------------------------------------------------Publicar---------------------------------------------

function Publicar(puntos){
	var id=Ti.App.Properties.getInt('idJugador');
	var jugador=jugadores.get(id);
	var tipoDato=typeof(jugador);
	
	if(tipoDato!=="undefined")
	{
		var nombre=jugador.get('nombre');
		var args = {
	        jugador: nombre,
	        puntos: puntos,
	        fb:fb
	    };
	    var compartir = Alloy.createController("RedesSociales", args).getView();
    	compartir.open();
   }
}

pushNotification();	
limpiar();
$.index.open();
