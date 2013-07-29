var camera, scene,renderer;
var   directional, ambient;
var mesh;
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
	
	renderer = new THREE.WebGLRenderer({clearAlpha:1, clearColor: 0xffffff, antialias: true});
	renderer.setSize(window.innerWidth, window.innerHeight);
	
	b.appendChild(renderer.domElement);
	
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
	camera.position.z = 300;
	camera.lookAt(new THREE.Vector3(0,0,0));

	scene = new THREE.Scene();

	directional = new THREE.DirectionalLight( 0xffffff, 1.0 );
	directional.position.set( 0, 100, 50 );
	directional.position.normalize();
	scene.add( directional );
	
	var ambient = new THREE.AmbientLight( 0x111111);
	scene.add( ambient );
	
	mesh = new THREE.Mesh( new THREE.TorusKnotGeometry( 30, 10, 90, 10 ), new THREE.MeshPhongMaterial({color: 0xff, perPixel: true, shininess: 90, specular: 0xffffff}));
	scene.add(mesh);
	
	window.addEventListener( 'resize', onWindowResize, false );

}
function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
}


function animate() {

	requestAnimationFrame( animate );
	renderer.render(scene, camera);

}

