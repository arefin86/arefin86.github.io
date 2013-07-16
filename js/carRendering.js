var camera, scene,renderer, loader;
var   directional, ambient;
var meshList = [];
init();
animate();
function init() {

	var d = document.getElementById("attr-name");
	d.innerHTML = "Car Rendering";
	var e = document.createElement("div");
    e.id = "details";
	d.appendChild(e);
	e.innerHTML = "Car rendering";
    var b;
    b = document.createElement("div");
    document.body.appendChild(b);
	
	renderer = new THREE.WebGLDeferredRenderer( { width: window.innerWidth, height: window.innerHeight, scale: 1, antialias: true, tonemapping: THREE.FilmicOperator, brightness: 5.0 } );
	
	b.appendChild(renderer.domElement);
	
	var bloomEffect = new THREE.BloomPass( 1.0 );
	renderer.addEffect( bloomEffect );
	
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
	camera.position.y = 50;
	camera.position.z = 400;
	camera.lookAt(new THREE.Vector3(0,0,0));

	scene = new THREE.Scene();

	loader = new THREE.CTMLoader();
	var callback = function(geometry, material) {createScene(geometry, new THREE.MeshPhongMaterial({color: 0xff, perPixel: true, shininess: 90, specular: 0xffffff}), new THREE.Vector3(0, -70, -50))};
	loader.load("files/evo.ctm", callback, {useWorker: false});

	//createScene(new THREE.TorusKnotGeometry( 30, 10, 90, 10 ), new THREE.MeshPhongMaterial({color: 0xff, perPixel: true, shininess: 90, specular: 0xffffff}), new THREE.Vector3(0,0,0));

	directional = new THREE.DirectionalLight( 0xffffff, 0.01 );
	directional.position.set( 0, 1, 0 );
	//scene.add( directional );
	
	var area = new THREE.AreaLight (0xffffff, 5);
	area.position.set(0, 100, 0);
	area.width = 25;
	area.height = 25;
	scene.add(area);
	
	var meshEmitter = createAreaEmitter( area );
	scene.add( meshEmitter );
	
	var area = new THREE.AreaLight (0xffffff, 5);
	area.position.set(55, 100, 0);
	area.width = 25;
	area.height = 25;
	scene.add(area);
	
	var meshEmitter = createAreaEmitter( area );
	scene.add( meshEmitter );
	
	var area = new THREE.AreaLight (0xffffff, 5);
	area.position.set(-55, 100, 0);
	area.width = 25;
	area.height = 25;
	scene.add(area);
	
	var meshEmitter = createAreaEmitter( area );
	scene.add( meshEmitter );
	
	var area = new THREE.AreaLight (0xffffff, 3);
	area.position.set(0, 10, 200);
	area.rotation.set(Math.PI/2,0,0);
	area.width = 50;
	area.height = 25;
	scene.add(area);

	
	window.addEventListener( 'resize', onWindowResize, false );

}
function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
}

function createScene(geometry, material, position){

	mesh = new THREE.Mesh(geometry,material);
	if(position){
		mesh.position = position.clone();
	}
	scene.add(mesh);
	meshList.push(mesh);
}

function createAreaEmitter( light ) {

	var geometry = new THREE.CubeGeometry( 1, 1, 1 );
	var material = new THREE.MeshBasicMaterial( { color: light.color.getHex(), vertexColors: THREE.FaceColors } );

	var backColor = 0x222222;

	geometry.faces[ 5 ].color.setHex( backColor );
	geometry.faces[ 4 ].color.setHex( backColor );
	geometry.faces[ 2 ].color.setHex( backColor );
	geometry.faces[ 1 ].color.setHex( backColor );
	geometry.faces[ 0 ].color.setHex( backColor );

	var emitter = new THREE.Mesh( geometry, material );

	emitter.position = light.position;
	emitter.rotation = light.rotation;
	emitter.scale.set( light.width * 2, 0.2, light.height * 2 );

	return emitter;

}

function animate() {

	requestAnimationFrame( animate );
	renderer.render(scene, camera);
	for(var i =0; i < meshList.length; i++){
		//meshList[i].rotation.x += 0.01;
		meshList[i].rotation.y += 0.01;
	}

}

