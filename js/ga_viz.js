// Written with great difficulty by graphics n00b Arefin Mohiuddin. Would appreciate a little credit if you're using the shader :) 

var population;
var MUT_PROB = 0.05;
var camera, scene,renderer;
var controls;
var directional, ambient;
var objectList = [];
var count = 0;
	

init();
//runGA();
function init() {

	var d = document.getElementById("attr-name");
	d.innerHTML = "Optimization using Genetic Algorithm ";
	var e = document.createElement("div");
    e.id = "details";
	d.appendChild(e);
	e.innerHTML = "Optimizing for maximum volume and minimum surface area of a cuboid<br>- or - max ( L x B x H / 2 x ( L x B + B x H + L x H) ) <br>where L = length, B = breadth, H = height<br>Optimum is reached when result is a CUBE, where L = B = H<br> Vol / Area = 16.67 (cube of side 100 units) <br>Click to iterate and watch cuboids morph into a cube";
	var link = document.createElement("a");
	link.href =  "";
	link.innerHTML = "";
	e.appendChild(link);
    var b;
    b = document.createElement("div");
    document.body.appendChild(b);
	
	renderer = new THREE.WebGLRenderer({ antialias: true});
	renderer.setClearColor(0xcccccc, 2);
	renderer.setSize(window.innerWidth, window.innerHeight);
	
	camera = new THREE.OrthographicCamera( window.innerWidth / - 2,  window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, -150, 150 );
	camera.position.z = 1;
	camera.position.y = 1;
	camera.lookAt(new THREE.Vector3(0,0,0));

	
	b.appendChild(renderer.domElement);

	scene = new THREE.Scene();

	directional = new THREE.DirectionalLight( 0xffffff, 1.0 );
	directional.position.set( 0, 100, 50 );
	directional.position.normalize();
	scene.add( directional );
	
	var ambient = new THREE.AmbientLight( 0x111111);
	scene.add( ambient );
	
	population = initPopulation(9);
	
	var geom = new THREE.CubeGeometry(100,100,100,1,1,1);
	var initX = -800;
	var delta = 200;
	var multiMaterial = [ new THREE.MeshBasicMaterial({color: 0x111111, wireframe: true, transparent: true}), new THREE.MeshLambertMaterial({color: 0xdd3333, wireframe: false})];
	
	for (var i = 0; i < 9; i++){
		var cube = THREE.SceneUtils.createMultiMaterialObject( geom.clone(), multiMaterial );
		//var cube = new THREE.Mesh(geom, new THREE.MeshLambertMaterial({color: 0xdd3333, wireframe: false}));
		cube.rotation.set(0,Math.PI/4, 0);
		cube.position.set(initX ,0 , 0);
		cube.scale.set( population[i][0], population[i][1], population[i][2]);
		initX = initX + delta;
		scene.add(cube);
		objectList.push(cube);
	} 
	
	renderer.render(scene, camera);
	document.getElementById('button').innerHTML = "Initial Population. Click to start GA"
	
	window.addEventListener( 'resize', onWindowResize, false );
	window.addEventListener( 'click', onClick, false );
}


function onWindowResize() {

	camera.left =  window.innerWidth / - 2;
	camera.right =  window.innerWidth / 2;
	camera.top = window.innerHeight / 2;
	camera.bottom = window.innerHeight / -2;
	

	camera.updateProjectionMatrix();

	//controls.handleResize();

	renderer.setSize( window.innerWidth, window.innerHeight );
}

function onClick(){
	runGA();
}


function initPopulation(size) {
	var population = [];
	for (var i = 0; i < size; i++){
		
		var individual = [];
		
		var length = genRandom();
		var breadth = genRandom();
		var height = genRandom();
		
		individual.push(length, breadth, height);
		population.push(individual);
	}
	
	return population;
}

function evaluateFitness (population){
	var fitness = [];
	for (i in population){
		var volume = ( population[i][0] * 100 * population[i][1] * 100 * population[i][2] * 100 );
		var sArea = 2 * ( (population[i][0] * 100 * population[i][1] * 100) + (population[i][1] * 100 * population[i][2] * 100) + (population[i][0] * 100 * population[i][2] * 100) );
		var score = volume/sArea;
		fitness.push(score);
	}
	//fitness = normalizeScores(fitness);
	return fitness;
}

function normalizeScores(fitness){
	var sum = 0;
	for (i in fitness){
		sum += fitness[i];
	}
	
	for (j in fitness){
		fitness[j] /= sum;
	}
	return fitness;
}

function newGeneration(population, fitness){
	
	var tempGen = [];
	
	var eliteChildren = selectElite(population, fitness);
	tempGen.push( population[eliteChildren[0]]);
	
	while(tempGen.length < population.length){
		var parents = tournamentSelect(population, fitness);
		var children = crossOver( parents );
		tempGen.push(mutate(children[0]), mutate(children[1]));
	}

	population = [];
	population = tempGen;
	
	return population;
}

function selectElite(population, fitness){
	var elite = [];
	var values = highestTwo(fitness);
	elite.push( values.first, values.second );
	return elite;
}

function highestTwo(array){
// function to select highest two values from an unsorted array
	var values = {};
	var firstVal = secondVal = firstInd = secondInd = 0;
	for (i in array){
		if (array[i] > firstVal){
			secondVal = firstVal;
			firstVal = array[i];
			secondInd = firstInd;
			firstInd = i;
		} else if(array[i] > secondVal) {
			secondVal = array[i];
			secondInd = i;
		}
	}
	values.first = firstInd;
	values.second = secondInd;
	return values;
}

function crossOver(parents){
	
	var offspring = [];
	point = genRandom(1,parents.A.length - 1, true);
	
	var child1 = (parents.A.slice(0, point)).concat(parents.B.slice(point));
	offspring.push(child1);
	
	var child2 = (parents.B.slice(0, point)).concat(parents.A.slice(point));
	offspring.push(child2);
	
	return offspring;
	
	
}

function mutate(a){
	if(genRandom() > MUT_PROB){
	
		var point = genRandom(0,2, true);

		var newGene =   a[point] + Math.pow(-1, genRandom(1,2, true)) * (genRandom() * a[point]);
		newGene = clamp(newGene, 0, 1);
		a.splice(point,1,newGene);

		return a;
	
	} else return a;
	
}

function runGA(){
	
	count++;
	var fitness = evaluateFitness(population);
	population = newGeneration(population, fitness);
	
	var score = Math.round( fitness[0] * 1000 ) / 1000;
	var level = Math.round((score / 16.667 * 100) * 1000 ) / 1000;
	
	for(i in population){
		objectList[i].scale.set(population[i][0], population[i][1], population[i][2]);
		//objectList[i].material.color.setRGB(1, 1 - level/100, 1 - level/100);
	}
	
	if(count%1 === 0){
		renderer.render(scene, camera);
		document.getElementById('button').innerHTML = "Generation :" + count + "<br>" + 
													  "Score :" + score + 
													  "<br>Level : " + level + "%" + 
													  "<br>Click for next generation";
	}
}

function genRandom(min, max, integer){
	var maxNum = max ? max : 1;
	var minNum = min ? min : 0;
	var number;
	if (integer){
		number = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
	} else {
		number = Math.random() * (maxNum - minNum) + minNum;
	}
	
	return number;
}

function tournamentSelect(population, fitness){
	var candidates = [];
	var fitnesses = [];
	while(candidates.length < 5){
		var num = genRandom(0, population.length - 1, true);
		if(candidates.indexOf(num) === -1){
			candidates.push(num);
			fitnesses.push(fitness[num]);
		}
	}
	
	var selectedCandidates = highestTwo(fitnesses);
	var parents = {
		A: population[candidates[selectedCandidates.first ]],
		B: population[candidates[selectedCandidates.second]],
	};
	
	return parents;
}

function clamp(x, min, max) {
    return x < min ? min : (x > max ? max : x);
};
