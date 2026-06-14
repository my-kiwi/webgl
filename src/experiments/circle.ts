const canvas = document.getElementById('circle-canvas') as HTMLCanvasElement;
const gl = canvas.getContext('webgl');

if (!gl) {
  alert('WebGL non supporté dans votre navigateur !');
  throw new Error('WebGL non supporté');
}

const vertexShaderSource = `
    attribute vec2 aPosition;
    void main() {
        gl_Position = vec4(aPosition, 0.0, 1.0);
    }
`;

const fragmentShaderSource = `
    precision mediump float;
    void main() {
        gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
    }
`;

function compileShader(gl: WebGLRenderingContext, source: string, type: number): WebGLShader {
  const shader = gl!.createShader(type)!;
  gl!.shaderSource(shader, source);
  gl!.compileShader(shader);
  if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
    console.error('Erreur de compilation du shader:', gl!.getShaderInfoLog(shader));
    gl!.deleteShader(shader);
    throw new Error('Erreur de compilation du shader');
  }
  return shader;
}

const vertexShader = compileShader(gl, vertexShaderSource, gl!.VERTEX_SHADER);
const fragmentShader = compileShader(gl, fragmentShaderSource, gl!.FRAGMENT_SHADER);

const program = gl!.createProgram()!;
gl!.attachShader(program, vertexShader);
gl!.attachShader(program, fragmentShader);
gl!.linkProgram(program);
if (!gl!.getProgramParameter(program, gl!.LINK_STATUS)) {
  console.error('Erreur de linkage du programme:', gl!.getProgramInfoLog(program));
  throw new Error('Erreur de linkage du programme');
}
gl!.useProgram(program);

const segments = 64;
const radius = 0.5;
const vertices = new Float32Array((segments + 2) * 2);
vertices[0] = 0.0;
vertices[1] = 0.0;
for (let i = 0; i <= segments; i += 1) {
  const angle = (i / segments) * Math.PI * 2;
  vertices[2 + i * 2] = Math.cos(angle) * radius;
  vertices[3 + i * 2] = Math.sin(angle) * radius;
}

const vertexBuffer = gl!.createBuffer()!;
gl!.bindBuffer(gl!.ARRAY_BUFFER, vertexBuffer);
gl!.bufferData(gl!.ARRAY_BUFFER, vertices, gl!.STATIC_DRAW);

const aPosition = gl!.getAttribLocation(program, 'aPosition');
gl!.enableVertexAttribArray(aPosition);
gl!.vertexAttribPointer(aPosition, 2, gl!.FLOAT, false, 0, 0);

gl!.clearColor(0.0, 0.0, 0.0, 1.0);
gl!.clear(gl!.COLOR_BUFFER_BIT);

gl!.drawArrays(gl!.TRIANGLE_FAN, 0, segments + 2);

export default {};
