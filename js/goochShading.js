var camera, scene, renderer, composer;
var effectFXAA, cannyEdge;
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
	//scene.fog = new THREE.Fog( 0x000000, 1, 1000 );

	object = new THREE.Object3D();
	scene.add( object );

	var geometry = new THREE.TorusGeometry( 150,60,3,3,2 * Math.PI );
	var material = new THREE.MeshNormalMaterial();
	var mesh = new THREE.Mesh(geometry, material);
	object.add(mesh);
	

/*	for ( var i = 0; i < 100; i ++ ) {
		
		var material = new THREE.MeshNormalMaterial({shading: THREE.FlatShading});
		var mesh = new THREE.Mesh( geometry, material );
		mesh.position.set( Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5 ).normalize();
		mesh.position.multiplyScalar( Math.random() * 400 );
		mesh.rotation.set( Math.random() * 2, Math.random() * 2, Math.random() * 2 );
		mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 50;
		object.add( mesh );
		 //= vec3( step(edge, invert.r), step(edge, invert.g), step(edge, invert.b) ) 

	}*/

	scene.add( new THREE.AmbientLight( 0x222222 ) );

	light = new THREE.DirectionalLight( 0xffffff );
	light.position.set( 1, 1, 1 );
	scene.add( light );

	// postprocessing

	composer = new THREE.EffectComposer( renderer );
	var effect = new THREE.RenderPass( scene, camera );
	effect.renderToScreen = false;
	composer.addPass( effect );

	cannyEdge = new THREE.ShaderPass(THREE.CannyEdgeFilterPass);
	cannyEdge.renderToScreen = false;
	composer.addPass(cannyEdge);
	
	var effect = new THREE.ShaderPass( THREE.InvertThreshholdPass );
	effect.renderToScreen = false;
	composer.addPass( effect );
	
	effectFXAA = new THREE.ShaderPass(THREE.FXAAShader);
	var e = window.innerWidth || 2;
	var a = window.innerHeight || 2;
	effectFXAA.uniforms.resolution.value.set(1/e,1/a);
	effectFXAA.renderToScreen = true;
	composer.addPass(effectFXAA);
	
	//

	window.addEventListener( 'resize', onWindowResize, false );

}
function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
	effectFXAA.uniforms.resolution.value.set(1 / window.innerWidth, 1 / window.innerHeight);
	cannyEdge.uniforms.uWindow.value.set(parseFloat(window.innerWidth), parseFloat(window.innerHeight));
    composer.reset();
}

function animate() {

	requestAnimationFrame( animate );

	var time = Date.now();

	object.rotation.x += 0.005;
	object.rotation.y += 0.01;
	
	renderer.clear();
	composer.render();

}

