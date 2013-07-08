var camera, scene, renderer, composer;
var object, light;
init();
animate();
function init() {
    var b;
    b = document.createElement("div");
    document.body.appendChild(b);
    renderer = new THREE.WebGLRenderer({antialias: false});
    renderer.setClearColor(0xffffff);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.autoClear = false;
    b.appendChild(renderer.domElement);
	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
	camera.position.z = 400;

	scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0x000000, 1, 1000 );

	object = new THREE.Object3D();
	scene.add( object );

	var geometry = new THREE.SphereGeometry( 1, 4, 4 );
	var material = new THREE.MeshNormalMaterial();

	for ( var i = 0; i < 100; i ++ ) {

		var mesh = new THREE.Mesh( geometry, material );
		mesh.position.set( Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5 ).normalize();
		mesh.position.multiplyScalar( Math.random() * 400 );
		mesh.rotation.set( Math.random() * 2, Math.random() * 2, Math.random() * 2 );
		mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 50;
		object.add( mesh );

	}

	//scene.add( new THREE.AmbientLight( 0x222222 ) );

	light = new THREE.DirectionalLight( 0xffffff );
	light.position.set( 1, 1, 1 );
	//scene.add( light );

	// postprocessing

	composer = new THREE.EffectComposer( renderer );
	var effect = new THREE.RenderPass( scene, camera );
	effect.renderToScreen = false;
	composer.addPass( effect );

	var effect = new THREE.ShaderPass( THREE.SobelFilterPass );
	effect.renderToScreen = false;
	composer.addPass( effect );

	var effect = new THREE.ShaderPass( THREE.InvertThreshholdPass );
	effect.renderToScreen = true;
	composer.addPass( effect );

	//

	window.addEventListener( 'resize', onWindowResize, false );

}
function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

	requestAnimationFrame( animate );

	var time = Date.now();

	object.rotation.x += 0.005;
	object.rotation.y += 0.01;
	
	renderer.clear();
	composer.render();

}

