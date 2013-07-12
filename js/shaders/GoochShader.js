THREE.GoochShader = {

	uniforms: {

		"LightPosition": { type: "v3", value: new THREE.Vector3(0,200, 80) },
		"SurfaceColor": { type: "v3", value: new THREE.Vector3(0.0, 0.0, 0.8)},
		"WarmColor": { type: "v3", value: new THREE.Vector3(1.0, 0.5, 0.0)},
		"CoolColor": { type: "v3", value: new THREE.Vector3(0,0,1)},
		"DiffuseWarm": { type: "f", value: 0.5},
		"DiffuseCool": { type: "f", value: 0.5}
	},

	vertexShader: [

		"uniform vec3 LightPosition;",
		
		"varying float NdotL;",
		"varying vec3 ReflectVec;",
		"varying vec3 ViewVec;",
		
		"void main() {",

			"vec3 ecPos = (modelViewMatrix * vec4(position, 1.0)).xyz;",
			"vec3 tnorm = normalize(normalMatrix * normal);",
			"vec3 lightVec 	= normalize(LightPosition - ecPos);",
			"ReflectVec    	= normalize(reflect(-lightVec, tnorm));",
			"ViewVec       	= normalize(-ecPos);",
			"NdotL         	= (dot (lightVec, tnorm) + 1.0) * 0.5;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform vec3  SurfaceColor;",
		"uniform vec3  WarmColor;",
		"uniform vec3  CoolColor;",
		"uniform float DiffuseWarm;",
		"uniform float DiffuseCool;",

		"varying float NdotL;",
		"varying vec3  ReflectVec;",
		"varying vec3  ViewVec;",

		"void main(void) {",
		
		  "vec3 kcool    = min (CoolColor + DiffuseCool * SurfaceColor, 1.0);",
		  "vec3 kwarm    = min (WarmColor + DiffuseWarm * SurfaceColor, 1.0);",
		  "vec3 kfinal   = mix (kcool, kwarm, NdotL);",

		  "vec3 nreflect = normalize (ReflectVec);",
		  "vec3 nview    = normalize (ViewVec);",

		  "float spec    = max (dot (nreflect, nview), 0.0);",
		  "spec          = pow (spec, 32.0);",

		  "gl_FragColor  = vec4 (min (kfinal + spec, 1.0), 1.0);",
		"}"

	].join("\n")

};