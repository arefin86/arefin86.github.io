var camera, scene, sceneDiffuse, renderer, composer, composer2;
var effectFXAA, cannyEdge, multiplyPass, texturePass;
var renderTargetEdge, renderTargetDiffuse;
var object, objectDiffuse, light;
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

	object = new THREE.Object3D();
	scene.add( object );

	var geometry = new THREE.TorusGeometry( 120,30,5,8,2* Math.PI );
	var material = new THREE.MeshNormalMaterial({shading: THREE.FlatShading});
	var mesh = new THREE.Mesh(geometry, material);
	object.add(mesh);
	
	sceneDiffuse = new THREE.Scene();
	//sceneDiffuse.fog = new THREE.Fog( 0x000000, 1, 1000 );
	objectDiffuse = new THREE.Object3D();
	sceneDiffuse.add( objectDiffuse );
	
	var geometry2 = new THREE.TorusGeometry( 120,30,5,8,2 * Math.PI );
	var material = new THREE.ShaderMaterial(THREE.GoochShader);
	var mesh = new THREE.Mesh(geometry2, material);
	objectDiffuse.add(mesh);

	light = new THREE.DirectionalLight( 0xffffff );
	light.position.set( 50, 50, 50 );
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

function animate() {

	requestAnimationFrame( animate );

	var time = Date.now();

	object.rotation.x += 0.005;
	object.rotation.y += 0.01;	
	objectDiffuse.rotation.x += 0.005;
	objectDiffuse.rotation.y += 0.01;
	
	composer.render(0.5);
	composer2.render(0.5);

}

