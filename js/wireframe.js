// Written with great difficulty by graphics n00b Arefin Mohiuddin. Would appreciate a little credit if you're using the shader :) 

var camera, scene,renderer;
var controls;
var directional, ambient;
var material, vertShader, fragShader, attributes, uniforms;
var objectList = [];
var UI = {
	opacity: 0.5,
	zoom: 10
};
var gui = new DAT.GUI({autoPlace:false});
	gui.add(UI, 'opacity', 0, 1);
	gui.add(UI, 'zoom', 2, 20);

	

	
document.getElementById('button').appendChild(gui.domElement);

init();
animate();
function init() {

	var d = document.getElementById("attr-name");
	d.innerHTML = "Single-pass Wireframe";
	var e = document.createElement("div");
    e.id = "details";
	d.appendChild(e);
	e.innerHTML = "Using clip-space coordinates. Lines are pre-filtered and anti-aliased. <br>Try zooming and changing transparency. <br> WebGL doesn't have geometry shaders and non-perspective interpolation, so had to be done manually. <br>Bunny from The Stanford 3D Scanning Repository<br>Paper at: ";
	var link = document.createElement("a");
	link.href =  "https://www.google.co.in/url?sa=t&rct=j&q=&esrc=s&source=web&cd=3&cad=rja&ved=0CDsQFjAC&url=http%3A%2F%2Fwww2.imm.dtu.dk%2Fpubdb%2Fviews%2Fedoc_download.php%2F4884%2Fpdf%2Fimm4884.pdf&ei=NS7_UZ-SN8HXrQem0oH4BQ&usg=AFQjCNGlvxRSlMahnnyGYi9XEZuD-y12yQ&sig2=7j2Vq6-X3Uc9udnRq1QuKA&bvm=bv.50165853,d.bmk";
	link.innerHTML = "Single-pass Wireframe Rendering, SIGGRAPH 2006";
	e.appendChild(link);
    var b;
    b = document.createElement("div");
    document.body.appendChild(b);
	
	renderer = new THREE.WebGLRenderer({ antialias: true});
	renderer.setClearColor(0xffffff, 2);
	renderer.setSize(window.innerWidth, window.innerHeight);
	
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 100 );
	camera.position.z = 10;
	camera.lookAt(new THREE.Vector3(0,0,0));

	/*controls = new THREE.TrackballControls(camera);
    controls.rotateSpeed = 1;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 1.8;
    controls.noZoom = false;
    controls.noPan = true;
    controls.noOrbit = true;
    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0;
    controls.keys = [65, 83, 68];*/
	
	b.appendChild(renderer.domElement);

	scene = new THREE.Scene();

	directional = new THREE.DirectionalLight( 0xffffff, 1.0 );
	directional.position.set( 0, 100, 50 );
	directional.position.normalize();
	scene.add( directional );
	
	var ambient = new THREE.AmbientLight( 0x111111);
	scene.add( ambient );
	
	vertShader = document.getElementById('vertexShader').innerHTML;
	fragShader = document.getElementById('fragmentShader').innerHTML;
	
	attributes = {v0: {type: 'v4', value:[]},
				  v1: {type: 'v4', value:[]},
				  v2: {type: 'v4', value:[]}
				  };
				  
	uniforms = {WIN_SCALE: {type: 'v2', value: new THREE.Vector2(window.innerWidth/2.0, window.innerHeight/2.0)},
			WIRE_COL:  {type: 'v4', value: new THREE.Vector4(0,0,0 , 1.0)},
			FILL_COL:  {type: 'v3', value: new THREE.Vector3(0.486, 0.678, 0.678)},
			opacity:   {type: 'f', value: UI.opacity }
			};
	
	material = new THREE.ShaderMaterial({ uniforms: uniforms, 
										  attributes: attributes, 
										  vertexShader: vertShader, 
										  fragmentShader: fragShader,
										  side: THREE.DoubleSide,
										  transparent: true, needsUpdate: true});
	
	loader = new THREE.BinaryLoader();
	var callback = function(geometry, materials) {createScene(geometry, material, new THREE.Vector3(0,.75,0), attributes)};
	loader.load("files/bunny.js", callback);
	
	var ball = new THREE.Mesh(new THREE.SphereGeometry(0.5,30,30), new THREE.MeshPhongMaterial({color: 0x3333dd, shininess: 90, specular : 0xffffff}));
	scene.add(ball);
	
	window.addEventListener( 'resize', onWindowResize, false );
}


function onWindowResize() {

	uniforms.WIN_SCALE.value.set( window.innerWidth/2.0, window.innerHeight/2.0 );
	camera.aspect = window.innerWidth / window.innerHeight;

	camera.updateProjectionMatrix();

	//controls.handleResize();

	renderer.setSize( window.innerWidth, window.innerHeight );
}


function animate() {

	requestAnimationFrame( animate );
	
	for (var i=0; i< objectList.length; i++){
		objectList[i].rotation.y += 0.001;
		//objectList[i].rotation.z += 0.005;
	}
	
	material.uniforms.opacity.value = UI.opacity;
	camera.position.z = UI.zoom;
	renderer.render(scene, camera);
	//controls.update();

}

function createScene(geometry, material, position, attr){

	THREE.GeometryUtils.triangulateQuads(geometry);
	THREE.GeometryUtils.center(geometry);
	
	/* reorganize geometry */
	var tempGeom = new THREE.Geometry();
	
	c=0;
	
	for(var i =0; i< geometry.faces.length; i++){
		tempGeom.vertices.push(geometry.vertices[geometry.faces[i].a].clone());
		tempGeom.vertices.push(geometry.vertices[geometry.faces[i].b].clone());
		tempGeom.vertices.push(geometry.vertices[geometry.faces[i].c].clone());
		
		var fac = new THREE.Face3();
		fac.a = c+0;
		fac.b = c+1;
		fac.c = c+2;
		tempGeom.faces.push(fac);
		
				
		c=c+3;
		}
		
	for (var i = 0; i < tempGeom.faces.length; i++){
		//a
		var aV0_temp = tempGeom.vertices[tempGeom.faces[i].a].clone();
		attr.v0.value.push(new THREE.Vector4(aV0_temp.x, aV0_temp.y, aV0_temp.z,0.0));
		
		var aV1_temp = tempGeom.vertices[tempGeom.faces[i].b].clone();
		attr.v1.value.push(new THREE.Vector4(aV1_temp.x, aV1_temp.y, aV1_temp.z,1.0));

		var aV2_temp = tempGeom.vertices[tempGeom.faces[i].c].clone();
		attr.v2.value.push(new THREE.Vector4(aV2_temp.x, aV2_temp.y, aV2_temp.z,1.0));		
		
		//b
		var bV0_temp = tempGeom.vertices[tempGeom.faces[i].b].clone();
		attr.v0.value.push(new THREE.Vector4(bV0_temp.x, bV0_temp.y, bV0_temp.z,1.0));
		
		var bV1_temp = tempGeom.vertices[tempGeom.faces[i].c].clone();
		attr.v1.value.push(new THREE.Vector4(bV1_temp.x, bV1_temp.y, bV1_temp.z,1.0));

		var bV2_temp = tempGeom.vertices[tempGeom.faces[i].a].clone();
		attr.v2.value.push(new THREE.Vector4(bV2_temp.x, bV2_temp.y, bV2_temp.z,1.0));
		
		//c
		var cV0_temp = tempGeom.vertices[tempGeom.faces[i].c].clone();
		attr.v0.value.push(new THREE.Vector4(cV0_temp.x, cV0_temp.y, cV0_temp.z,2.0));
		
		var cV1_temp = tempGeom.vertices[tempGeom.faces[i].a].clone();
		attr.v1.value.push(new THREE.Vector4(cV1_temp.x, cV1_temp.y, cV1_temp.z,1.0));

		var cV2_temp = tempGeom.vertices[tempGeom.faces[i].b].clone();
		attr.v2.value.push(new THREE.Vector4(cV2_temp.x, cV2_temp.y, cV2_temp.z,1.0));
		
		}
	
	tempGeom.computeFaceNormals();
	tempGeom.computeVertexNormals();
	mesh = new THREE.Mesh(tempGeom,material);
	//material);
	//new THREE.MeshPhongMaterial({color: 0x7cadad, shininess: 90, specular: 0xffffff, perPixel: true, opacity: 0.5, transparent: true}));
	//new THREE.MeshBasicMaterial({color: 0xff, wireframe: true}));
	
	if(position){
		mesh.position = position.clone();
	}
	
	scene.add(mesh);
	objectList.push(mesh);
}


