define([
	'js/Game',
	'js/Time',
	'goo/entities/EntityUtils',
	'js/Input',
	'goo/math/Vector3',
	'goo/renderer/bounds/BoundingBox',
	'js/Grid'
],
function(
	Game,
	Time,
	EntityUtils,
	Input,
	Vector3,
	BoundingBox,
	Grid
){
	var maxSpeed = 5.0;
	var maxY = 5.25;
	var maxX = 6.0;
	var endZone = -7.0;
	var count = 0;
	var Ball = {};
	var rad = 0.0;
	var RIGHT = new Vector3(-1,0,0);
	var LEFT = new Vector3(1,0,0);
	var UP = new Vector3(0,-1,0);
	var DOWN = new Vector3(0,1,0);
	//var normal = new Vector3();
	var u = new Vector3();
	var w = new Vector3();

	var overlap = new Vector3();
	Ball.ref = null;

	Ball.gridUpdate = function(){
		if(null != this.meshRendererComponent.worldBound){
			Grid.removeFromGrid(this.name, Grid.cellList[this.name], this.mask);
			Grid.addToGrid(
				this.name,
				Grid.cellList[this.name],
				this.meshRendererComponent.worldBound.center.x,
				this.meshRendererComponent.worldBound.center.y,
				this.meshRendererComponent.worldBound.xExtent,
				this.meshRendererComponent.worldBound.yExtent,
				this.mask
			);
			for(var p in Grid.cCheck[this.name]){
				if(Grid.cCheck[this.name].hasOwnProperty(p)){
					delete Grid.cCheck[this.name][p];
				}
			}
			//Grid.cCheck[this.name] = {};
			Grid.cCheck[this.name][this.name] = true;
		}
	}

	Ball.update = function(){
		this.oldPos.x = this.newPos.x;
		this.oldPos.y = this.newPos.y;

		if(this.ballSpeed > maxSpeed){
			this.ballSpeed -= Time.dt;
			if(this.ballSpeed < maxSpeed){
				this.ballSpeed = maxSpeed;
			}
		}
		rad = Math.atan2(this.vel.y, this.vel.x);
		this.newPos.x = this.oldPos.x + (Math.cos(rad) * this.ballSpeed * Time.dt);
		this.newPos.y = this.oldPos.y + (Math.sin(rad) * this.ballSpeed * Time.dt);

		if(this.newPos.x > maxX){
			// play random wall sound here
			Game.sound2.play();
			u.copy(RIGHT);
			u.scale(Vector3.dot(this.vel, RIGHT));
			Vector3.sub(this.vel, u, w);
			Vector3.sub(w, u, this.vel);
			this.newPos.x = maxX;
		}
		if(this.newPos.x < -maxX){
			// play random wall sound here
			Game.sound2.play();
			u.copy(LEFT);
			u.scale(Vector3.dot(this.vel, LEFT));
			Vector3.sub(this.vel, u, w);
			Vector3.sub(w, u, this.vel);
			this.newPos.x = -maxX;
		}
		if(this.newPos.y > maxY){
			// play random wall sound here
			Game.sound2.play();
			u.copy(UP);
			u.scale(Vector3.dot(this.vel, UP));
			Vector3.sub(this.vel, u, w);
			Vector3.sub(w, u, this.vel);
			this.newPos.y = maxY;
		}
		if(this.newPos.y < endZone){
			// play 'missed ball' sound here
			this.vel.x = 1;
			this.vel.y = 1;
			this.oldPos.x = 0;
			this.oldPos.x = 0;
			this.newPos.y = -2;
			this.newPos.y = -2;
			this.ballSpeed = maxSpeed;
			this.hitCount = 1;
		}
		//if(this.hitCount > 0 && this.newPos.y > Game.hitMin){
		//	this.hitCount = 0;
		//}

		// check for brick collisions...

		if(null != this.meshRendererComponent.worldBound){
			var i = Grid.cellList[this.name].length;
			var cX = 0.0;
			var cY = 0.0;
			var cRad = 0.0;
			var cDist = 0.0;
			while(i--){
				var n = Grid.cellList[this.name][i].mask[2].first;
				while(n != null){
					if(null == Grid.cCheck[this.name][n.name]){
						Grid.cCheck[this.name][n.name] = true;
						switch(Game.entity[n.name].type){
							case "Brick":

								if(this.newPos.y > Game.entity[n.name].transformComponent.transform.translation.y - 0.375 &&
									this.newPos.y < Game.entity[n.name].transformComponent.transform.translation.y + 0.375 &&
									this.newPos.x > Game.entity[n.name].transformComponent.transform.translation.x - 0.625 &&
									this.newPos.x < Game.entity[n.name].transformComponent.transform.translation.x + 0.625){
									Grid.removeFromGrid(n.name, Grid.cellList[n.name], 2);
									Game.entity[n.name].removeFromWorld();
									
									var xCross;
									var yCross;
									if(this.newPos.x > Game.entity[n.name].transformComponent.transform.translation.x){
										xCross = (Game.entity[n.name].transformComponent.transform.translation.x + 0.625) - this.newPos.x;
									}
									else{
										xCross =  (Game.entity[n.name].transformComponent.transform.translation.x - 0.625) - this.newPos.x;
									}
									if(this.newPos.y > Game.entity[n.name].transformComponent.transform.translation.y){
										yCross = (Game.entity[n.name].transformComponent.transform.translation.y + 0.375) - this.newPos.y;
									}
									else{
										yCross =  (Game.entity[n.name].transformComponent.transform.translation.y - 0.375) - this.newPos.y;
									}

									if(Math.abs(xCross) < Math.abs(yCross)){
										if(xCross < 0){
											u.copy(RIGHT);
											u.scale(Vector3.dot(this.vel, RIGHT));
											Vector3.sub(this.vel, u, w);
											Vector3.sub(w, u, this.vel);
											this.newPos.x = Game.entity[n.name].transformComponent.transform.translation.x - 0.625;
										}
										else{
											u.copy(LEFT);
											u.scale(Vector3.dot(this.vel, LEFT));
											Vector3.sub(this.vel, u, w);
											Vector3.sub(w, u, this.vel);
											this.newPos.x = Game.entity[n.name].transformComponent.transform.translation.x + 0.625
										}
									}
									else{
										if(yCross < 0){
											u.copy(UP);
											u.scale(Vector3.dot(this.vel, UP));
											Vector3.sub(this.vel, u, w);
											Vector3.sub(w, u, this.vel);
											this.newPos.y = Game.entity[n.name].transformComponent.transform.translation.y - 0.375
										}
										else{
											u.copy(DOWN);
											u.scale(Vector3.dot(this.vel, DOWN));
											Vector3.sub(this.vel, u, w);
											Vector3.sub(w, u, this.vel);
											this.newPos.y = Game.entity[n.name].transformComponent.transform.translation.y + 0.375
										}
									}

								}
								break;
						}
					}
					n = n.next;
				}
			}

		}

		this.transformComponent.setTranslation(
			this.newPos.x,
			this.newPos.y,
			0);
	};
	Ball.create = function(){
		var b = EntityUtils.clone(Game.world, Ball.ref);
		b.name = "Ball:"+(count++);
		//b.transformComponent.setTranslation(0, Game.hitMin-1, 0);
		b.oldPos = new Vector3(0, -2, 0);
		b.newPos = new Vector3(0, -2, 0);
		b.vel = new Vector3(1,1,0);
		b.ballSpeed = maxSpeed;
		b.hitCount = 1;
		b.mask = 1;
		Grid.cCheck[b.name] = {};
		Grid.cellList[b.name] = [];
		b.addToWorld();
		Game.register("GridUpdate", b, Ball.gridUpdate);
		Game.register("Update", b, Ball.update);
		return b;
	}
	return Ball;
});