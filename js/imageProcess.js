var image;
var okToRun = false;
var projectionMatrix, modelViewMatrix;
var rttTexture, rttFramebuffer, renderBuffer;
var vs_blur =

        "    attribute vec3 vertexPos;\n" +
        "    attribute vec2 texCoord;\n" +
        "    uniform mat4 modelViewMatrix;\n" +
        "    uniform mat4 projectionMatrix;\n" +
        "    varying vec2 vTexCoord;\n" +
        "    void main(void) {\n" +
        "        // Return the transformed and projected vertex value\n" +
        "        gl_Position = projectionMatrix * modelViewMatrix * \n" +
        "            vec4(vertexPos, 1.0);\n" +
        "        // Output the texture coordinate in vTexCoord\n" +
        "        vTexCoord = texCoord;\n" +
        "    }\n";

var fs_blur =
        "    precision mediump float;\n" +
        "    varying vec2 vTexCoord;\n" +
        "    uniform sampler2D uSampler1;\n" +
        "    uniform sampler2D uSampler2;\n" +
        "    uniform float width;\n" +
        "    uniform float height;\n" +
        "    void main(void) {\n" +
		"	 	vec2 onePixel = vec2(1.0 / width * 2.0 , 1.0 / height * 2.0);\n" +
		"	 	vec4 colorSum = 						\n" +
		"			texture2D(uSampler1, vTexCoord + ( onePixel * vec2(-1.0, -1.0))) * 0.045 + \n" +
		"			texture2D(uSampler1, vTexCoord + ( onePixel * vec2( 0.0, -1.0))) * 0.122 + \n" +
		"			texture2D(uSampler1, vTexCoord + ( onePixel * vec2( 1.0, -1.0))) * 0.045 + \n" +
		"			texture2D(uSampler1, vTexCoord + ( onePixel * vec2(-1.0,  0.0))) * 0.122 + \n" +
		"			texture2D(uSampler1, vTexCoord + ( onePixel * vec2( 0.0,  0.0))) * 0.332 + \n" +
		"			texture2D(uSampler1, vTexCoord + ( onePixel * vec2( 1.0,  0.0))) * 0.122 + \n" +
		"			texture2D(uSampler1, vTexCoord + ( onePixel * vec2(-1.0,  1.0))) * 0.045 + \n" +
		"			texture2D(uSampler1, vTexCoord + ( onePixel * vec2( 0.0,  1.0))) * 0.122 + \n" +
		"			texture2D(uSampler1, vTexCoord + ( onePixel * vec2( 1.0,  1.0))) * 0.045;  \n" +
		" 		vec4 blurred = vec4((colorSum.rgb ), 1.0); \n"+
		" 		vec4 original = vec4((texture2D (uSampler2, vTexCoord)).rgb, 1.0); 	\n"+
		" 		float base[4]; 														\n"+
		" 		float top[4]; 														\n"+
		" 		base[0] = original.r; 												\n"+
		" 		base[1] = original.g; 												\n"+
		" 		base[2] = original.b; 												\n"+
		" 		base[3] = original.a; 												\n"+
		" 		top[0] = blurred.r; 												\n"+
		" 		top[1] = blurred.g; 												\n"+
		" 		top[2] = blurred.b; 												\n"+
		" 		top[3] = blurred.a; 												\n"+
		" 		float preFinal[4]; 													\n"+
		" 		float final[4]; 													\n"+
		" 		for (int i = 0; i < 3; i++ ){										\n"+
		" 			if(base[i] < 0.5){ 												\n"+
		" 		 		preFinal[i] = 2.0 * top [i] * base[i];						\n"+
		" 		 	}	else {														\n"+
		" 		 		preFinal[i] = 1.0 - (2.0 * (1.0 - base[i]) * (1.0 - top[i]));	\n"+
		" 		 	}																\n"+
		" 		 	final[i] = (preFinal[i] + (2.0 * base[i]) - 1.0) * 0.65;					\n"+
		" 		 }\n"+
		" 		 \n"+
		" 		 \n"+
		" 		 \n"+
		" 		 \n"+
		" 		 \n"+
		" 		gl_FragColor = vec4(final[0], final[1], final[2], final[3] * 0.62); \n"+
        "}\n";

var vs_desat_invert =

        "    attribute vec3 vertexPos;\n" +
        "    attribute vec2 texCoord;\n" +
        "    uniform mat4 modelViewMatrix;\n" +
        "    uniform mat4 projectionMatrix;\n" +
        "    varying vec2 vTexCoord;\n" +
        "    void main(void) {\n" +
        "        // Return the transformed and projected vertex value\n" +
        "        gl_Position = projectionMatrix * modelViewMatrix * \n" +
        "            vec4(vertexPos, 1.0);\n" +
        "        // Output the texture coordinate in vTexCoord\n" +
        "        vTexCoord = texCoord;\n" +
        "    }\n";

var fs_desat_invert =
        "    precision mediump float;\n" +
        "    varying vec2 vTexCoord;\n" +
        "    uniform sampler2D uSampler;\n" +
        "    void main(void) {\n" +
		"	 		vec4 frag = texture2D (uSampler, vTexCoord); \n" +
		"			vec3 desaturate = vec3 ((frag.g * 0.59) + (frag.r * 0.3) + (frag.b * 0.11)); \n" +
		" 			gl_FragColor = vec4(1.0 - desaturate.r, 1.0 - desaturate.r, 1.0 - desaturate.r, 1.0); \n"+
        "}\n";




//var shaderVertexPositionAttribute, shaderTexCoordAttribute;
//var shaderProjectionMatrixUniform, shaderModelViewMatrixUniform, shaderSamplerUniform;
var canvas, gl, square;
var webGLTexture;


function startDraw(){

	canvas = document.getElementById("webgl");

	gl = initWebGL(canvas);

	initViewport(gl, canvas);

	square = createSquare(gl);

	initMatrices(canvas);

	//initShader(gl);
	
	initTexture(gl);

	

}

function initWebGL(canvas) {

        var gl = null;
        var msg = "Your browser does not support WebGL, " +
            "or it is not enabled by default.";
        try
        {
            gl = canvas.getContext("experimental-webgl", {alpha: false});
        }
        catch (e)
        {
            msg = "Error creating WebGL Context!: " + e.toString();
        }

        if (!gl)
        {
			document.getElementById('details').innerHTML = 'Something went wrong. Does your browser <br>support <a href = "http://get.webgl.org/">WebGL </a> ?';
			
        }

        return gl;
     }
	 
function initViewport(gl, canvas)
	{
		gl.viewport(0, 0, canvas.width, canvas.height);
	}
	
 // Create the vertex data for a square to be drawn
function createSquare(gl) {
	   // Vertex Data
        var vertexBuffer;
        vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        var verts = [
           // Front face
           -1.0, -1.0,  0.0,
            1.0, -1.0,  0.0,
            1.0,  1.0,  0.0,
           -1.0,  1.0,  0.0,
           ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

		// Tex coords
		var texCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        var textureCoords = [
          // Front face
          0.0, 0.0,
          1.0, 0.0,
          1.0, 1.0,
          0.0, 1.0,
		];
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);

        // Index data (defines the triangles to be drawn)
        var cubeIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);
        var cubeIndices = [
            0, 1, 2,      0, 2, 3    // Front face
        ];
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW);

        var cube = {buffer:vertexBuffer, indices:cubeIndexBuffer, texCoordBuffer: texCoordBuffer,
                vertSize:3, nVerts:4,  nIndices:6, texCoordSize: 2, nTexCoord: 4,
                primtype:gl.TRIANGLES};

        return cube;
}

function initMatrices(canvas)
{
	// Create a model view matrix with camera at 0, 0, −3.333
	modelViewMatrix = mat4.create();
	mat4.identity(modelViewMatrix);
	//mat4.translate(modelViewMatrix, [0.0, 0.0, -1.0], modelViewMatrix);

	// Create a project matrix with 45 degree field of view
	projectionMatrix = mat4.create();
	mat4.identity(projectionMatrix);
	//mat4.perspective(Math.PI / 4,canvas.width / canvas.height, 1.0, 1000.0, projectionMatrix);
}

function createShader(gl, str, type) {
	var shader;
	if (type == "fragment") {
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else if (type == "vertex") {
		shader = gl.createShader(gl.VERTEX_SHADER);
	} else {
		return null;
	}

	gl.shaderSource(shader, str);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(shader));
		return null;
	}

	return shader;
}

function initShader(gl, vs_source, fs_source) {
	
	// Since all attributes and uniforms remain same in all my shader pairs
	// load and compile the fragment and vertex shader
	var fragmentShader = createShader(gl, fs_source, "fragment");
	var vertexShader = createShader(gl, vs_source, "vertex");

	// link them together into a new program
	shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert("Could not initialise shaders");
	}
	
	return shaderProgram;
}

function handleTextureLoaded(gl, texture) {
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.bindTexture(gl.TEXTURE_2D, null);
	okToRun = true;
}


function initTexture(gl) {
	webGLTexture = gl.createTexture();
	webGLTexture.image = image;
	/*webGLTexture.image.onload = function () {
		handleTextureLoaded(gl, webGLTexture);
		if(okToRun){
			draw(gl, square);
		}*/
	if(image){
		handleTextureLoaded(gl, webGLTexture);
		if(okToRun){
			draw(gl, square);
	}
}

	//webGLTexture.image.crossOrigin = "anonymous";
	//webGLTexture.image.src = "img/cubetexture.png";
}

function draw(gl, obj) {

        // Init Framebuffer
		
		rttFramebuffer = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, rttFramebuffer);
		rttFramebuffer.width = webGLTexture.image.width;
		rttFramebuffer.height = webGLTexture.image.height;
		
		// Init empty texture
		
		rttTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, rttTexture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
		
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, rttTexture, 0);
		
		// Back to Defaults
		
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		
		// Ready the framebuffer
		
		gl.bindFramebuffer(gl.FRAMEBUFFER, rttFramebuffer);
		
		// ** INVERSION & DESATURATION PASS ** //
		
		// set the shader to use
		var shader = initShader(gl, vs_desat_invert, fs_desat_invert);
        gl.useProgram(shader);

        // connect up the shader parameters: vertex position, color and projection/model matrices
        // set up the buffers
        
		// attribute - VertPos
		gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer);
		
		var shaderVertexPositionAttribute = gl.getAttribLocation(shader, "vertexPos");
		gl.enableVertexAttribArray(shaderVertexPositionAttribute);
		
        gl.vertexAttribPointer(shaderVertexPositionAttribute, obj.vertSize, gl.FLOAT, false, 0, 0);
		
		// attribute - TexCoord
        gl.bindBuffer(gl.ARRAY_BUFFER, obj.texCoordBuffer);
		
		var shaderTexCoordAttribute = gl.getAttribLocation(shader, "texCoord");
		gl.enableVertexAttribArray(shaderTexCoordAttribute);

        gl.vertexAttribPointer(shaderTexCoordAttribute, obj.texCoordSize, gl.FLOAT, false, 0, 0);
		
		// Indices
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indices);

		// uniform - Matrices
		var shaderProjectionMatrixUniform = gl.getUniformLocation(shader, "projectionMatrix");
        gl.uniformMatrix4fv(shaderProjectionMatrixUniform, false, projectionMatrix);
		
		var shaderModelViewMatrixUniform = gl.getUniformLocation(shader, "modelViewMatrix");
        gl.uniformMatrix4fv(shaderModelViewMatrixUniform, false, modelViewMatrix);
		
		// Texture binding
		gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, webGLTexture);
		
		// uniform - Sampler
		var shaderSamplerUniform = gl.getUniformLocation(shader, "uSampler");
        gl.uniform1i(shaderSamplerUniform, 0);
		
		// clear the background
        gl.clearColor(0.0, 1.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT);
	

        // draw the object (to framebuffer texture)
        gl.drawElements(obj.primtype, obj.nIndices, gl.UNSIGNED_SHORT, 0);
		
		// ** END OF 1ST PASS **
		
		
		// Back to defualt framebuffer
		
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		
		// ** BLUR PASS **
		
		// set the shader to use
		var shader2 = initShader(gl, vs_blur, fs_blur);
        gl.useProgram(shader2);
		
		// Rebind everything
		
		// attribute - VertPos
		gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer);
		
		var shaderVertexPositionAttribute = gl.getAttribLocation(shader2, "vertexPos");
		gl.enableVertexAttribArray(shaderVertexPositionAttribute);
		
        gl.vertexAttribPointer(shaderVertexPositionAttribute, obj.vertSize, gl.FLOAT, false, 0, 0);
		
		// attribute - TexCoord
        gl.bindBuffer(gl.ARRAY_BUFFER, obj.texCoordBuffer);
		
		var shaderTexCoordAttribute = gl.getAttribLocation(shader2, "texCoord");
		gl.enableVertexAttribArray(shaderTexCoordAttribute);

        gl.vertexAttribPointer(shaderTexCoordAttribute, obj.texCoordSize, gl.FLOAT, false, 0, 0);
		
		// Indices
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indices);

		// uniform - Matrices
		var shaderProjectionMatrixUniform = gl.getUniformLocation(shader2, "projectionMatrix");
        gl.uniformMatrix4fv(shaderProjectionMatrixUniform, false, projectionMatrix);
		
		var shaderModelViewMatrixUniform = gl.getUniformLocation(shader2, "modelViewMatrix");
        gl.uniformMatrix4fv(shaderModelViewMatrixUniform, false, modelViewMatrix);
		
		// uniform - width
		var width = gl.getUniformLocation(shader2, "width");
		gl.uniform1f(width, parseFloat(canvas.width));		
		
		// uniform - width
		var height = gl.getUniformLocation(shader2, "height");
		gl.uniform1f(height, parseFloat(canvas.height));
		
		// Now draw again - this time with rttTexture
		
		// Bind rendered texture
		gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, rttTexture);

		// uniform - Sampler
		var shaderSamplerUniform1 = gl.getUniformLocation(shader2, "uSampler1");
        gl.uniform1i(shaderSamplerUniform1, 0);
		
		// Bind old texture
		gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, webGLTexture);

		// uniform - Sampler
		var shaderSamplerUniform2 = gl.getUniformLocation(shader2, "uSampler2");
        gl.uniform1i(shaderSamplerUniform2, 1);
		
		// clear the background
        gl.clearColor(1.0, 1.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT);
	

        // draw the object (to framebuffer texture)
        gl.drawElements(obj.primtype, obj.nIndices, gl.UNSIGNED_SHORT, 0);
  }
  
  function handleImage(input){
	if(!input){
		return;
	} else {
		console.log(input);
		image = new Image();
		image.crossOrigin = 'anonymous';
		try {
			image.src = input;
		}
		catch (e){
			alert("Not a valid image \n" + e.toString());
			return;
		}
		
		image.onload = function(){
			var canvas;
			canvas = document.getElementById('webgl');
			if(canvas){
				canvas.parentNode.removeChild(canvas);
			}
			canvas = document.createElement('canvas');
			canvas.id = 'webgl';
			var aspect = image.width / image.height;
			if ((image.width > window.innerWidth) || (image.height > window.innerHeight)){
				canvas.width = Math.floor(aspect * window.innerHeight * 0.75);
				canvas.height = Math.floor(window.innerHeight * 0.75);
			} else {
				canvas.width = image.width;
				canvas.height = image.height;
			}
			canvas.padding = 10;
			document.getElementById('input').appendChild(canvas);
			startDraw();
		}
	}
  }