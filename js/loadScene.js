require([
	'goo/entities/GooRunner',
	//'goo/statemachine/FSMSystem',
	//'goo/addons/howler/systems/HowlerSystem',
	'goo/loaders/DynamicLoader',
	'js/Game',
	'js/Time',
	'js/Input',
	'js/Ball',
	'goo/math/Plane',
	'goo/math/Vector3',
	'goo/entities/EntityUtils',
	'js/Grid'
], function (
	GooRunner,
	//FSMSystem,
	//HowlerSystem,
	DynamicLoader,
	Game,
	Time,
	Input,
	Ball,
	Plane,
	Vector3,
	EntityUtils,
	Grid
) {
	'use strict';

	function init() {

		// If you try to load a scene without a server, you're gonna have a bad time
		if (window.location.protocol==='file:') {
			alert('You need to run this webpage on a server. Check the code for links and details.');
			return;

			/*

			Loading scenes uses AJAX requests, which require that the webpage is accessed via http. Setting up
			a web server is not very complicated, and there are lots of free options. Here are some suggestions
			that will do the job and do it well, but there are lots of other options.

			- Windows

			There's Apache (http://httpd.apache.org/docs/current/platform/windows.html)
			There's nginx (http://nginx.org/en/docs/windows.html)
			And for the truly lightweight, there's mongoose (https://code.google.com/p/mongoose/)

			- Linux
			Most distributions have neat packages for Apache (http://httpd.apache.org/) and nginx
			(http://nginx.org/en/docs/windows.html) and about a gazillion other options that didn't
			fit in here.
			One option is calling 'python -m SimpleHTTPServer' inside the unpacked folder if you have python installed.


			- Mac OS X

			Most Mac users will have Apache web server bundled with the OS.
			Read this to get started: http://osxdaily.com/2012/09/02/start-apache-web-server-mac-os-x/

			*/
		}

		// Make sure user is running Chrome/Firefox and that a WebGL context works
		var isChrome, isFirefox, isIE, isOpera, isSafari, isCocoonJS;
		isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
			isFirefox = typeof InstallTrigger !== 'undefined';
			isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
			isChrome = !!window.chrome && !isOpera;
			isIE = false || document.documentMode;
			isCocoonJS = navigator.appName === "Ludei CocoonJS";
		if (!(isFirefox || isChrome || isSafari || isCocoonJS)) {
			alert("Sorry, but your browser is not supported.\nGoo works best in Google Chrome or Mozilla Firefox.\nYou will be redirected to a download page.");
			window.location.href = 'https://www.google.com/chrome';
		} else if (!window.WebGLRenderingContext) {
			alert("Sorry, but we could not find a WebGL rendering context.\nYou will be redirected to a troubleshooting page.");
			window.location.href = 'http://get.webgl.org/troubleshooting';
		} else {
			Game.world.setSystem(new Time(Game));

			// Preventing brower peculiarities to mess with our control
			document.body.addEventListener('touchstart', function(event) {
				event.preventDefault();
			}, false);
			// Loading screen callback
			var progressCallback = function (handled, total) {
				var loadedPercent = (100*handled/total).toFixed();
				var loadingOverlay = document.getElementById("loadingOverlay");
				var progressBar = document.getElementById("progressBar");
				var progress = document.getElementById("progress");
				var loadingMessage = document.getElementById("loadingMessage");
				loadingOverlay.style.display = "block";
				loadingMessage.style.display = "block";
				progressBar.style.display = "block";
				progress.style.width = loadedPercent + "%";
			};

			// Create typical Goo application
			//var goo = new GooRunner({
			//	antialias: true,
			//	manuallyStartGameLoop: true
			//});
			//var fsm = new FSMSystem(goo);
			//goo.world.setSystem(fsm);
			//goo.world.setSystem(new HowlerSystem());

			// The loader takes care of loading the data
			var loader = new DynamicLoader({
				world: Game.world,
				rootPath: 'res',
				progressCallback: progressCallback});

			loader.loadFromBundle('project.project', 'root.bundle', {recursive: false, preloadBinaries: true}).then(function(configs) {
				console.log(loader._configs);
				var ball = loader.getCachedObjectForRef('entities/Sphere.entity');
				Ball.ref = ball;
				ball.removeFromWorld();

				var brick = loader.getCachedObjectForRef('entities/Box_2.entity');
				brick.removeFromWorld();
				Game.entity = [];
				var col = 9;
				while(col--){
					var row = 10;
					while(row--){
						var b = EntityUtils.clone(Game.world, brick);
						b.name = "Brick:"+col+","+row
						b.mask = 2;
						b.type = "Brick";
						Grid.cellList[b.name] = [];
						b.transformComponent.setTranslation(col-4, (row*0.5), 0);
						b.addToWorld();
						Grid.addToGrid(
							b.name,
							Grid.cellList[b.name],
							b.transformComponent.transform.translation.x,
							b.transformComponent.transform.translation.y,
							0.5,
							0.25,
							b.mask
						);
						Game.entity[b.name] = b;
					}
				}

				Game.sound1 = new window.Howl({
					urls: ["res/sounds/Bounce1.ogg", "res/sounds/Bounce1.mp3"],
					volume:1.0});
				Game.sound2 = new window.Howl({
					urls: ["res/sounds/Bounce2.ogg", "res/sounds/Bounce2.mp3"],
					volume:1.0});

				var viewCam = loader.getCachedObjectForRef('entities/Camera.entity');

				Game.ball = Ball.create();
				var plane = new Plane(new Vector3(0,0,1), 0);
				var pos = new Vector3();
				var dir = new Vector3();
				var distance = 0.0;
				Game.hitMin = -4.61;
				function onTap(bool0){
					if(bool0){
						viewCam.cameraComponent.camera.getPickRay(
						Input.mousePosition.x,
						Input.mousePosition.y,
						Game.renderer.viewportWidth,
						Game.renderer.viewportHeight,
						Game.ray);
						if(plane.rayIntersect(Game.ray, pos)){
							if(pos.y <= Game.hitMin){
								if(pos.x >= -6.15 || pos.x <= 6.15){
									//if(Game.ball.hitCount > 0){return;}
									if(Game.ball.transformComponent.transform.translation.y > Game.hitMin){return;}
									Vector3.sub(Game.ball.transformComponent.transform.translation, pos, dir);
									distance = dir.length();
									if(distance <= 1){
										Game.sound1.play();
										//Game.ball.hitCount ++;
										Game.ball.vel = dir.normalize();
									}
								}
							}
						}
					}
				}

				function onTouch(x, y){
					console.log("Touched at:"+x+","+y);
					viewCam.cameraComponent.camera.getPickRay(
					x,
					y,
					Game.renderer.viewportWidth,
					Game.renderer.viewportHeight,
					Game.ray);
					if(plane.rayIntersect(Game.ray, pos)){
						if(pos.y <= Game.hitMin){
							if(pos.x >= -6.15 || pos.x <= 6.15){
								//if(Game.ball.hitCount > 0){return;}
								if(Game.ball.transformComponent.transform.translation.y > Game.hitMin){return;}
								Vector3.sub(Game.ball.transformComponent.transform.translation, pos, dir);
								distance = dir.length();
								if(distance <= 1){
									Game.sound1.play();
									//Game.ball.hitCount ++;
									Game.ball.vel = dir.normalize();
								}
							}
						}
					}
				}

				Input.assignMouseButtonToAction(1, "Tap");
				Game.register("Tap", Game, onTap);
				Game.register("TouchStart", Game, onTouch);
				Game.doRender = true;

			}).then(null, function(e) {
				// If something goes wrong, 'e' is the error message from the engine.
				alert('Failed to load scene: ' + e);
				console.log(e.stack);
			});
		}
	}

	init();
});
