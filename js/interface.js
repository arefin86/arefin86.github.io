var treeList = {};
var deltaTable = {
	getDelta: function(UID_a,UID_b,paramName){
		return this[UID_a][paramName]-this[UID_b][paramName];
	}
};

createTree("default");

function createTree(fromUID){
	
	var UID = (generateUID()).toString();	
		 
	var d = document.createElement('div');
	d.id = "alt-"+ UID;
	d.class = "alt"
	d.style.cssFloat = 'left';

	var d2 = document.createElement('div');

	var buttonNew = document.createElement('button'); 
	buttonNew.id = "btnN-"+ UID;
	buttonNew.title = "Create a new tree from this tree";
	buttonNew.addEventListener('click', function(event){createTree(UID)});
	var t = document.createTextNode("Create new Tree");
	buttonNew.appendChild(t);
	d2.appendChild(buttonNew);

	var buttonNew = document.createElement('button'); 
	buttonNew.id = "btnS-"+ UID;
	buttonNew.title = "Save a snapshot of this state";
	buttonNew.addEventListener('click', function(event){snapshot(UID)});
	var t = document.createTextNode("Snapshot");
	buttonNew.appendChild(t);
	d2.appendChild(buttonNew);


	var buttonClose = document.createElement('button'); 
	buttonClose.title = "Delete this tree";
	buttonClose.id = "btnC-"+ UID;
	buttonClose.style.cssFloat ="right";
	buttonClose.addEventListener('click', function(event){deleteTree(UID)});
	var c = document.createTextNode("x");
	buttonClose.appendChild(c);
	d2.appendChild(buttonClose);

	
	d.appendChild(d2);
	
	var elements = {};
	var tree;
	if (fromUID == "default"){
		 tree = new Tree(UID, "default");
	} else {
		tree = new Tree(UID, fromUID, treeList[fromUID].tree.PARAMS);
	}
	

	elements.tree = tree;

	var gui = new dat.GUI({autoPlace:false, width: tree.canvas.width});
		elements.gui = gui;
		treeList[UID]=elements;
		
		treeList[UID].gui.add(treeList[UID].tree, 'linked')
			.onChange(function(value){
				updateDeltas(value, UID)
				})
			.listen();

		treeList[UID].gui.add(treeList[UID].tree.PARAMS, 'angleX', 0, Math.PI)
			.min(0).step(Math.PI/24)
			.onChange(function(value){
				if (treeList[UID].tree.linked) updateAngleX(value, UID);
				updateDisplay();
				});

		treeList[UID].gui.add(treeList[UID].tree.PARAMS, 'angleY', 0, Math.PI)
			.min(0).step(Math.PI/24)
			.onChange(function(value){
				if (treeList[UID].tree.linked) {updateAngleY(value, UID)};
				updateDisplay();
				});		

		treeList[UID].gui.add(treeList[UID].tree.PARAMS, 'scale', .3, .8)
			.min(.3).max(.8)
			.onChange(function(value){
				if (treeList[UID].tree.linked) updateScale(value,UID);
				updateDisplay();
				});

		treeList[UID].gui.add(treeList[UID].tree.PARAMS, 'generations', 1, 10)
			.min(1).step(1)
			.onChange(function(value){
				if (treeList[UID].tree.linked) updateGenerations(value, UID);
				updateDisplay();
				});

		treeList[UID].gui.add(treeList[UID].tree.PARAMS, 'branchLength', 10, 300)
			.min(10).step(1)
			.onChange(function(value){
				if (treeList[UID].tree.linked) updateBranchLength(value, UID);
				updateDisplay();
				});
				
		treeList[UID].gui.addColor(treeList[UID].tree.PARAMS,'colour')
			.onChange(function(value){
				if (treeList[UID].tree.linked) updateColour(value);
				updateDisplay();
				});


		d.appendChild(treeList[UID].tree.canvas);
		d.appendChild(treeList[UID].gui.domElement);

		var gallery = document.createElement('div');
		gallery.id = 'gal-'+UID;
		$(gallery).css('width','300px');
		$(gallery).css('height','300px');
		$(gallery).css('overflow','scroll');
		d.appendChild(gallery);
		
		if(fromUID=="default"){
			$('#container').append(d);	
		}  else {
			$(d).insertAfter('#alt-'+fromUID);
			$('#alt-'+UID).hide();
			$('#alt-'+UID).show(300);
		}
		
		$(".close-button").remove();


		drawAllTrees(treeList);

}

function Tree(UID, fromUID, params){
	
	this.PARAMS = {
		angleX: Math.PI/4,
		angleY: Math.PI/4,
		scale: 0.8,
		generations: 8,
		branchLength: 70,
		lineWidth: 10,
		colour: "#204d78"
	};

	if (params) jQuery.extend( this.PARAMS, params);
	this.linked = false;
	
	this.UID = UID;
	this.createdFrom = fromUID;

	this.canvas = document.createElement('canvas');
	this.canvas.id = "cnv-"+this.UID;
	this.canvas.width = 300;
	this.canvas.height = 300;
	this.canvas.title = this.UID +" created from " + this.createdFrom;
	this.canvas.addEventListener('click', function(event){/*alert("Hello")*/});
	
	this.generationCount = 0;
	
	this.origin = {
		x: this.canvas.width/2,
		y: this.canvas.height/6*5
	}
	
	this.gallery = [];
	
	this.draw = function(){

		this.generationCount = 0;
		var ctx = this.canvas.getContext('2d');
		ctx.save()
		ctx.translate(this.origin.x, this.origin.y);
		ctx.clearRect(-this.origin.x,this.canvas.height - this.origin.y,this.canvas.width,-this.canvas.height);

		this.drawTree(0, ctx);
		ctx.restore();
	}

	this.drawTree = function(angle, ctx) { 

			this.generationCount++; 
			ctx.save(); 
			ctx.rotate(angle);  
			ctx.scale(this.PARAMS.scale, this.PARAMS.scale);

			ctx.beginPath(); 
			ctx.lineJoin = "bevel";
			ctx.lineCap = "round";
			ctx.moveTo(0, 0); 
			ctx.translate(0, -this.PARAMS.branchLength);
			ctx.lineTo(0, 0);
			ctx.lineWidth = this.PARAMS.lineWidth;
			ctx.strokeStyle = this.PARAMS.colour;
			ctx.stroke(); 

			if(this.generationCount<=this.PARAMS.generations) {

				this.drawTree( this.PARAMS.angleX,ctx);
				this.drawTree(-this.PARAMS.angleY,ctx);

			}
			ctx.restore();
			this.generationCount--; 
		}
}


function drawAllTrees(treeList){
	for (var tree in treeList){
			for (var i in treeList[tree].gui.__controllers){
				treeList[tree].gui.__controllers[i].updateDisplay();	
			}
		setTimeout(treeList[tree].tree.draw(), 10);
	}
}

function generateUID() {
    return ("0000" + (Math.random()*Math.pow(36,4) << 0).toString(36)).slice(-4)
}


function updateDisplay(){
	drawAllTrees(treeList);
}
function updateScale(value, fromUID){
	for (var tree in treeList){
		if (treeList[tree].tree.linked) {
			var val = value + deltaTable.getDelta(tree, fromUID, 'scale');
			var finalVal = Math.max( Math.min (val, 0.8),0.3);
			treeList[tree].tree.PARAMS.scale = finalVal;
		}
	}
}
function updateAngleX(value, fromUID){
	for (var tree in treeList){
		if (treeList[tree].tree.linked ) {
			var val = value + deltaTable.getDelta(tree, fromUID, 'angleX');
			var finalVal = Math.max( Math.min (val, Math.PI),0);
			treeList[tree].tree.PARAMS.angleX = finalVal;
		}
	}
}
function updateAngleY(value, fromUID){
	for (var tree in treeList){
		if (treeList[tree].tree.linked ) {
			var val = value + deltaTable.getDelta(tree, fromUID, 'angleY');
			var finalVal = Math.max( Math.min (val, Math.PI),0);
			treeList[tree].tree.PARAMS.angleY = finalVal;
		}
	}
}
function updateGenerations(value, fromUID){
	for (var tree in treeList){
		if (treeList[tree].tree.linked ) {
			var val = value + deltaTable.getDelta(tree, fromUID, 'generations');
			var finalVal = Math.max( Math.min (val, 10),1);
			treeList[tree].tree.PARAMS.generations = finalVal;
		}
	}
}
function updateBranchLength(value, fromUID){
	for (var tree in treeList){
		if (treeList[tree].tree.linked ) {
			var val = value + deltaTable.getDelta(tree, fromUID, 'branchLength');
			var finalVal = Math.max( Math.min (val, 300),10);
			treeList[tree].tree.PARAMS.branchLength = finalVal;
		}
	}
}
function updateColour(value, fromUID){
	for (var tree in treeList){
		if (treeList[tree].tree.linked ) treeList[tree].tree.PARAMS.colour = value;
	}
}
function updateLinkedCount(value, fromUID){
	if (value == true){
		linkedCount++;
	} else {
		linkedCount--;
	}
}

function deleteTree(UID){
	if (Object.keys(treeList).length < 2){
		alert("Sorry, you can't delete all trees.");
		return;
	}
	var r = confirm("Are you sure you want to delete this tree ?");
	if (r){
		$('#alt-'+UID).hide(300, function(){$(this).remove()});
		delete treeList[UID];
	}
	drawAllTrees(treeList);
}

function updateDeltas(value,UID){
	if (value ==true){
		deltaTable[UID] = {};
		jQuery.extend(deltaTable[UID],treeList[UID].tree.PARAMS);
	} else {
		delete deltaTable[UID];
	}

}

function snapshot(UID){
	var dataURL = treeList[UID].tree.canvas.toDataURL();
	var img = document.createElement('img');
	img.id = UID +'-'+ treeList[UID].tree.gallery.length;
	img.nID = treeList[UID].tree.gallery.length;
	img.style.width = '92px';
	img.style.height = '92px';
	img.title = "Double-click to restore";
	img.src = dataURL;
	$(img).dblclick(function(){
		restoreState(UID, this.nID);
	})
	$('#gal-'+UID).append(img);
	
	var snapshot = {};
	snapshot.image = dataURL;
	snapshot.params = {};
	jQuery.extend(snapshot.params, treeList[UID].tree.PARAMS);
	treeList[UID].tree.gallery.push(snapshot);

}

function restoreState(UID, whichState){
	var wasLinked;
	if(treeList[UID].tree.linked){
		treeList[UID].tree.linked = false;
		wasLinked = true;
		updateDeltas(false, UID);
	}
	
	jQuery.extend(treeList[UID].tree.PARAMS, treeList[UID].tree.gallery[whichState].params);
	drawAllTrees(treeList);
	if (wasLinked){
		treeList[UID].tree.linked = true;
		updateDeltas(true, UID);
	}
}
