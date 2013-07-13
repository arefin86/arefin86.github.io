var camera, scene, sceneDiffuse, renderer, composer, composer2, loader;
var effectFXAA, cannyEdge, multiplyPass, texturePass;
var renderTargetEdge, renderTargetDiffuse;
var object, objectDiffuse, light;
var meshList = [];
init();
animate();
function init() {

	var d = document.getElementById("attr-name");
	d.innerHTML = "Gooch Shading + Canny Edge Detection";
	var e = document.createElement("div");
    e.id = "details";
	d.appendChild(e);
	e.innerHTML = "A Non-Photorealistic Lighting Model For Automatic Technical Illustration by Gooch et al + Profile edges using Canny Edge detection";
	//document.getElementById("attr-name").innerHTML = "Gooch Shading + Canny Edge Detection";
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
	sceneDiffuse = new THREE.Scene();
	object = new THREE.Object3D();
	objectDiffuse = new THREE.Object3D();

	loader = new THREE.JSONLoader();
	//var callback = function(geometry, materials) {createScene(geometry, materials)};
	
	//loader.load("files/complete_teapot.js", callback);
	
	var materials = {
		"diffuse": new THREE.ShaderMaterial(THREE.GoochShader),
		"edge"	 : new THREE.MeshBasicMaterial({color: 0xfff})
	};
	
	materials.diffuse.uniforms.WarmColor.value = new THREE.Vector3(1.0, 0.5, 0.0);
	materials.diffuse.uniforms.CoolColor.value = new THREE.Vector3(0,0,1);
	materials.diffuse.uniforms.SurfaceColor.value = new THREE.Vector3(0.0, 0.0, 0.8);

	createScene(new THREE.TorusKnotGeometry( 50, 15, 90, 10 ), materials, new THREE.Vector3(0,30,0));
	
	createScene(new THREE.SphereGeometry( 80, 30, 30 ), materials, new THREE.Vector3(-300, 30, 0));
	
	createScene(new THREE.TorusGeometry( 80, 20, 15, 30, 2 * Math.PI ), materials, new THREE.Vector3(300, 30, 0));

	light = new THREE.DirectionalLight( 0xffffff );
	light.position.set( 0, -500, 0 );
	sceneDiffuse.add( light );

	// postprocessing
	
	var renderTargetParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false, generateMipmaps: false };
	
	renderTargetEdge = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, renderTargetParameters);
	renderTargetEdge.generateMipmaps = false;

	composer = new THREE.EffectComposer( renderer, renderTargetEdge );
	var effect = new THREE.RenderPass( scene, camera );
	effect.renderToScreen = false;
	composer.addPass( effect );

	cannyEdge = new THREE.ShaderPass(THREE.CannyEdgeFilterPass);
	cannyEdge.renderToScreen = false;
	composer.addPass(cannyEdge);
	
	var effect = new THREE.ShaderPass( THREE.InvertThreshholdPass );
	effect.renderToScreen = false;
	composer.addPass( effect );
	
	var effect = new THREE.ShaderPass(THREE.CopyShader);
	effect.renderToScreen = false;
	composer.addPass(effect);
	
	renderTargetDiffuse = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, renderTargetParameters);
	
	composer2 = new THREE.EffectComposer(renderer, renderTargetDiffuse);
	
	var renderDiffuse = new THREE.RenderPass(sceneDiffuse, camera);
	renderDiffuse.renderToScreen = false;
	composer2.addPass(renderDiffuse);
	
	multiplyPass = new THREE.ShaderPass(THREE.MultiplyBlendShader);
	multiplyPass.renderToScreen = false;
	multiplyPass.uniforms["tEdge"].value = composer.renderTarget2;
	multiplyPass.needsSwap = true;
	composer2.addPass(multiplyPass);
	
	effectFXAA = new THREE.ShaderPass(THREE.FXAAShader);
	var e = window.innerWidth || 2;
	var a = window.innerHeight || 2;
	effectFXAA.uniforms.resolution.value.set(1/e,1/a);
	effectFXAA.renderToScreen = false;
	composer2.addPass(effectFXAA);
	
	var effect = new THREE.ShaderPass(THREE.CopyShader);
	effect.renderToScreen = true;
	composer2.addPass(effect);

	
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
	composer2.reset();
	renderTargetEdge.width = renderTargetDiffuse.width = parseFloat(window.innerWidth);
	renderTargetEdge.height = renderTargetDiffuse.height = parseFloat(window.innerHeight);

	composer.render();
	composer2.render();
}

function createScene(geometry, materials, position){
	
	/*var m = new THREE.Matrix4();
	m.makeScale(2,2,2);
	geometry.applyMatrix(m);*/
	
	geometryDiffuse = geometry.clone();
	meshDiffuse = new THREE.Mesh(geometryDiffuse,materials.diffuse);
	meshDiffuse.position = position.clone();
	sceneDiffuse.add(meshDiffuse);
	meshList.push(meshDiffuse);
	
	mesh = new THREE.Mesh(geometry,materials.edge);
	mesh.position = position.clone();
	scene.add(mesh);
	meshList.push(mesh);
}

function animate() {

	requestAnimationFrame( animate );

	var time = Date.now();
	composer.render(0.5);
	composer2.render(0.5);
	for(var i =0; i < meshList.length; i = i + 2){
		meshList[i].rotation.x += 0.01;
		meshList[i].rotation.y += 0.01;
		meshList[i+1].rotation.x += 0.01;
		meshList[i+1].rotation.y += 0.01;
	}

}

