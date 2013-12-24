define([
	"js/NodeList",
	"js/Game",
	"goo/renderer/bounds/BoundingBox"
], 
function(
	NodeList,
	Game,
	BoundingBox
){
	"use strict";
	var Cell = function(){
		this.name = "cell";
		this.mask = {};
	}
	var Grid = function(){
		var minX = -10.0;
		var minY = -10.0;
		var maxX = 10.01;
		var maxY = 10.01;
		var cellX = 2.0;
		var cellY = 2.0;
		var _this = {};
		_this.cell = {};
		_this.cCheck = {};
		_this.cellList = {};
		for(var j = minY; j < maxY; j += cellY){
			for(var i = minX; i < maxX; i += cellX){
				var c = new Cell();
				c.name = i+","+j;
				c.mask[1] = new NodeList();
				c.mask[2] = new NodeList();
				_this.cell[i+","+j] = c;
			}
		}
		_this.addToGrid = function(_name, _list, _centerX, _centerY, _yExtent, _xExtent, _mask){
			var minX = ~~((_centerX - _xExtent)/cellX)*cellX;
			var maxX = ~~((_centerX + _xExtent)/cellX)*cellX;
			var minY = ~~((_centerY - _yExtent)/cellY)*cellY;
			var maxY = ~~((_centerY + _yExtent)/cellY)*cellY;
			
			//console.log("X:"+minX+':'+maxX+" Y:"+minY+":"+maxY);

			//var list = {};
			for(var j = minY; j <= maxY; j+= cellY){
				for(var i = minX; i <= maxX; i+= cellX){
					if(null == _this.cell[i+","+j]){continue;}
					for (var bit = 1; _mask >= bit; bit *= 2){
						if(_mask & bit){
							_this.cell[i+","+j].mask[bit].add({"previous":null, "next":null, "name":_name});
						}
					}
					_list.push(_this.cell[i+","+j]);
				}
			}
		}
		_this.removeFromGrid = function(_name, _list, _mask){
			var i = _list.length;
			while(i--){
				for(var bit = 1; _mask >= bit; bit *= 2){
					if(_mask & bit){
						var n = _list[i].mask[bit].first;
						while(n != null){
							if(n.name == _name){
								_list[i].mask[bit].remove(n);
								break;
							}
							n = n.next;
						}
					}
				}
			}
			_list.length = 0;
		}
		return _this;
	}
	return Grid();
});