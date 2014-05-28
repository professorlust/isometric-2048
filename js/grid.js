/*****************************************************
*
*	Designed and programmed by Mohamed Adam Chaieb.
*
******************************************************/

/*
	Constructs an empty 4 by 4 grid.
*/
function Grid() {
	this.gridSize = 4;
	this.moveMap = [];
	this.tiles = [[null,null,null,null],[null,null,null,null],[null,null,null,null],[null,null,null,null]];
	this.newTile = null;
	this.score = 0;
};

/*
	Iterator for the tiles in the grid, applies the given function
	to all tiles in the grid. The order of iteration is decided by
	the direction parameter
*/
Grid.prototype.eachCell = function(dir, fun) {
	if(!dir || dir < 2) {
		for (var i = this.gridSize-1; i >= 0; i--) {
			for (var j = this.gridSize-1; j >= 0; j--) {
				fun(i, j, this.tiles[i][j]);
			};
		};
	} else {
		for (var i = 0; i < gridSize; i++) {
			for (var j = 0; j < gridSize; j++) {
				fun(i, j, this.tiles[i][j]);
			};
		};
	};
};

/*
	Inserts the tile in the grid in the correct cell
*/
Grid.prototype.insertTile = function(tile) {
	this.tiles[tile.x][tile.y] = tile;
};

/*
	Removes the tile from the grid, does nothing when passed null
*/
Grid.prototype.removeTile = function(tile) {
	this.tiles[tile.x][tile.y] = null;
};

/*
	Updates the position of the specified tile, without removing it from the grid.
*/
Grid.prototype.updateTile = function(tile, newPos) {
	this.removeTile(tile);
	tile.updatePosition(newPos);
	this.insertTile(tile);
}

/*
	Returns an array of all the free positions in the grid
*/
Grid.prototype.freePositions = function() {
	var free = [];
	var self = this;
	this.eachCell(null, function(x,y,tile) {
		if(!tile)
			free.push({x: x, y: y});
	});
	return free;
};

/*
	Returns a random empty position.
*/
Grid.prototype.getRandomPosition = function() {
	var freeTiles = this.freePositions();
	if(freeTiles.length)
		return freeTiles[Math.floor(Math.random()*freeTiles.length)];
};

/*
	Initializes the grid with two tiles.
*/
Grid.prototype.init = function() {
	this.generateTile();
	this.generateTile();
	this.newTile = null;
};

/*
	Returns a tuple {newPos, merge} of the new position of the tile at the given
	position, and a boolean indicating if the tile merged.
*/
Grid.prototype.getMovePosition = function(pos, dir) {
	var merge = false;
	var newPos = {x:pos.x, y:pos.y};
	var inc = 1;
	switch(dir) {
		case 0: //up
			// Find the upmost valid position, then depending on the tile that's right after,
			// determine if you need to merge or not
			while(pos.y+inc < gridSize) {
				if(this.tiles[pos.x][pos.y+inc] == null)
					inc++;
				else break;
			};
			if(this.tiles[pos.x][pos.y+inc] == null) {
				newPos = {x:pos.x, y:pos.y+inc-1}
				break;
			} else if(this.tiles[pos.x][pos.y+inc]) {
				if(this.tiles[pos.x][pos.y+inc].level == this.tiles[pos.x][pos.y].level) {
					newPos = {x: pos.x, y: pos.y+inc};
					merge = true;
				} else newPos = {x: pos.x, y: pos.y+inc-1};
				break;
			};
			break;
		case 1: //right
			while(pos.x+inc < gridSize) {
				if(this.tiles[pos.x+inc][pos.y] == null)
					inc++;
				else break;
			};
			if(this.tiles[pos.x+inc] == null) {
				newPos = {x:pos.x+inc-1, y:pos.y}
				break;
			} else if(this.tiles[pos.x+inc][pos.y]) {
				if(this.tiles[pos.x+inc][pos.y].level == this.tiles[pos.x][pos.y].level) {
					newPos = {x: pos.x+inc, y: pos.y};
					merge = true;
				} else newPos = {x: pos.x+inc-1, y: pos.y};
				break;
			};
			break;
		case 2: //down
			while(pos.y-inc >= 0) {
				if(this.tiles[pos.x][pos.y-inc] == null)
					inc++;
				else break;
			};
			if(this.tiles[pos.x][pos.y-inc] == null) {
				newPos = {x:pos.x, y:pos.y-inc+1}
				break;
			} else if(this.tiles[pos.x][pos.y-inc]) {
				if(this.tiles[pos.x][pos.y-inc].level == this.tiles[pos.x][pos.y].level) {
					newPos = {x: pos.x, y: pos.y-inc};
					merge = true;
				} else newPos = {x: pos.x, y: pos.y-inc+1};
				break;
			};
			break;
		case 3: //left
			while(pos.x-inc >= 0) {
				if(this.tiles[pos.x-inc][pos.y] == null)
					inc++;
				else break;
			};
			if(this.tiles[pos.x-inc] == null) {
				newPos = {x:pos.x-inc+1, y:pos.y}
				break;
			} else if(this.tiles[pos.x-inc][pos.y]) {
				if(this.tiles[pos.x-inc][pos.y].level == this.tiles[pos.x][pos.y].level) {
					newPos = {x: pos.x-inc, y: pos.y};
					merge = true;
				} else newPos = {x: pos.x-inc+1, y: pos.y};
				break;
			};
			break;
	}
	return {newPos: newPos, merge: merge};
};

/*
	Generates a new tile at a random position and adds it to the grid
*/
Grid.prototype.generateTile = function() {
	this.newTile = new Tile(this.getRandomPosition(), Math.floor(Math.random()*2));
	this.insertTile(this.newTile);
};

/*
	Returns a new grid with an updated state
*/
Grid.prototype.update = function(dir) {
	var update;
	var self = this;
	this.moveMap = [];
	this.eachCell(dir, function(x,y,tile) {
		if(tile) {
			console.log(self.adjacentTiles(tile));
			update = self.getMovePosition({x:x, y:y}, dir);
			if(update.merge) {
				self.score += Math.pow(2, tile.level+1);
				self.removeTile(tile);
				self.insertTile(new Tile(update.newPos, tile.level+1));
				self.addToMoveMap({oldPos: {x:x, y:y}, newPos: update.newPos, level: tile.level+1});
			} else {
				self.updateTile(tile, update.newPos)
				self.addToMoveMap({oldPos: {x:x, y:y}, newPos: update.newPos, level: tile.level});
			};
		};
	});
	if(this.differentState())
		this.generateTile();
	else this.newTile = null;
	console.log(this.gameOver());
};

/*
	Returns true if the previous state is different from the current one.
*/
Grid.prototype.differentState = function() {
	// Check where all the tiles in the movement map are going, if they're staying in place,
	// then the state is the same
	for (var i = 0; i < this.moveMap.length; i++) {
		if(this.moveMap[i]) {
			if(this.moveMap[i].oldPos.x != this.moveMap[i].newPos.x || this.moveMap[i].oldPos.y != this.moveMap[i].newPos.y)
				return true;
		}
	};
	return false;
};

/*
	Checks whether the game is over or not.
	TODO: fix this!
*/
Grid.prototype.gameOver = function() {
	var self = this;
	var adjacent = [];
	var free = this.freePositions();
	if(free.length > 0)
		return false;
	else {
		//check if there exists two adjacent cells with the same level
		this.eachCell(null, function(x,y,tile) {
			if(tile) {
				adjacent = self.adjacentTiles(tile);
				for (var i = 0; i < adjacent.length; i++) {
					if(adjacent[i].level == tile.level)
						return false;
				};
			};
		});
		return true;
	};
};

/*
	Returns an array of adjacent tiles.
*/
Grid.prototype.adjacentTiles = function(tile) {
	var adjacent = [];
	if(this.tiles[tile.x+1]) {
		if (this.tiles[tile.x+1][tile.y])
			adjacent.push(this.tiles[tile.x+1][tile.y]);
	} if (this.tiles[tile.x-1]) {
		if (this.tiles[tile.x-1][tile.y])
			adjacent.push(this.tiles[tile.x-1][tile.y]);
	} if (this.tiles[tile.x][tile.y+1]) {
		adjacent.push(this.tiles[tile.x][tile.y+1]);
	} if (this.tiles[tile.x][tile.y-1]) {
		adjacent.push(this.tiles[tile.x][tile.y-1]);
	};
	return adjacent;
};

/*
	Inserts the movement object in place so that the moveMap is sorted
	from the largest coordinates to the smaller coordinates (from {3,3}
	to {0,0}).
*/
Grid.prototype.addToMoveMap = function(move) {
	var index = move.newPos.x+move.newPos.y*gridSize;
	while(this.moveMap[index])
		index--;
	if(index < 0)
		this.moveMap.push(move);
	else this.moveMap[index] = move;
};