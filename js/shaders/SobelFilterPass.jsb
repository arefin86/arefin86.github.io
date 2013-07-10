
THREE.SobelFilterPass = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"uWindow": { type: "v2", value: null }

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
			"vec2 onePixel = vec2( 1.0 , 1.0 ) / 2048.0;",
			"vec4 colorSum = ",
			"	texture2D( tDiffuse, vUv + ( onePixel * vec2(-1.0, -1.0))) * -1.0 +",
			"	texture2D( tDiffuse, vUv + ( onePixel * vec2( 0.0, -1.0))) * -1.0 +",
			"	texture2D( tDiffuse, vUv + ( onePixel * vec2( 1.0, -1.0))) * -1.0 +",
			"	texture2D( tDiffuse, vUv + ( onePixel * vec2(-1.0,  0.0))) * -1.0 +",
			"	texture2D( tDiffuse, vUv + ( onePixel * vec2( 0.0,  0.0))) *  8.0 +",
			"	texture2D( tDiffuse, vUv + ( onePixel * vec2( 1.0,  0.0))) * -1.0 +",
			"	texture2D( tDiffuse, vUv + ( onePixel * vec2(-1.0,  1.0))) * -1.0 +",
			"	texture2D( tDiffuse, vUv + ( onePixel * vec2( 0.0,  1.0))) * -1.0 +",
			"	texture2D( tDiffuse, vUv + ( onePixel * vec2( 1.0,  1.0))) * -1.0 ;",
			"gl_FragColor = vec4( colorSum.rgb, 1.0 );",

		"}"

	].join("\n")

};