THREE.InvertThreshholdPass = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",


		"void main() {",
			"vec4 colorSum = texture2D( tDiffuse, vUv );",
			"vec4 invert = vec4(1.0 - colorSum.r, 1.0 - colorSum.g, 1.0 - colorSum.b, 1.0 );",
			"float edge = 1.0 ;",
			"vec3 threshhold;",
			"if(invert.r < 1.0 || invert.g < 1.0 || invert.b < 1.0){",
			"	threshhold = vec3(0.0);",
			"	} else {",
			"	threshhold = vec3(1.0);",
			"}",
			"gl_FragColor = vec4(threshhold, 1.0);",

		"}"

	].join("\n")

};