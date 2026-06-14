const canvasElement = document.getElementById('cube-canvas');
if (!(canvasElement instanceof HTMLCanvasElement)) {
  throw new Error('Cube canvas not found');
}

const canvas = canvasElement;
const gl = canvas.getContext('webgl');

if (!gl) {
  alert('WebGL non supporté dans votre navigateur !');
  throw new Error('WebGL non supporté');
}

gl.clearColor(0.0, 0.0, 0.0, 1.0);
canvas.style.display = 'block';
canvas.style.width = '100%';
canvas.style.height = '240px';

const vertexShaderSource = `
    attribute vec3 aPosition;
    attribute vec3 aColor;
    uniform mat4 uMVP;
    varying vec3 vColor;
    void main() {
        gl_Position = uMVP * vec4(aPosition, 1.0);
        vColor = aColor;
    }
`;

const fragmentShaderSource = `
    precision mediump float;
    varying vec3 vColor;
    void main() {
        gl_FragColor = vec4(vColor, 1.0);
    }
`;

function compileShader(gl: WebGLRenderingContext, source: string, type: number): WebGLShader {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Erreur de compilation du shader:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    throw new Error('Erreur de compilation du shader');
  }
  return shader;
}

const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
const fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);

const program = gl.createProgram()!;
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  console.error('Erreur de linkage du programme:', gl.getProgramInfoLog(program));
  throw new Error('Erreur de linkage du programme');
}
gl.useProgram(program);

const vertices = new Float32Array([
  // positions       // colors
  -0.5, -0.5, 0.5, 1.0, 0.0, 0.0, 0.5, -0.5, 0.5, 0.0, 1.0, 0.0, 0.5, 0.5, 0.5, 0.0, 0.0, 1.0, -0.5,
  0.5, 0.5, 1.0, 1.0, 0.0, -0.5, -0.5, -0.5, 1.0, 0.0, 1.0, 0.5, -0.5, -0.5, 0.0, 1.0, 1.0, 0.5,
  0.5, -0.5, 1.0, 1.0, 1.0, -0.5, 0.5, -0.5, 0.5, 0.5, 0.5,
]);

const indices = new Uint16Array([
  0, 1, 2, 2, 3, 0, 4, 5, 6, 6, 7, 4, 0, 1, 5, 5, 4, 0, 3, 2, 6, 6, 7, 3, 0, 3, 7, 7, 4, 0, 1, 2, 6,
  6, 5, 1,
]);

const vertexBuffer = gl.createBuffer()!;
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

const indexBuffer = gl.createBuffer()!;
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

const aPosition = gl.getAttribLocation(program, 'aPosition');
const aColor = gl.getAttribLocation(program, 'aColor');
const stride = 6 * Float32Array.BYTES_PER_ELEMENT;

gl.enableVertexAttribArray(aPosition);
gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, stride, 0);

gl.enableVertexAttribArray(aColor);
gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, stride, 3 * Float32Array.BYTES_PER_ELEMENT);

const uMVP = gl.getUniformLocation(program, 'uMVP');

gl.enable(gl.DEPTH_TEST);

gl.clearColor(0.0, 0.0, 0.0, 1.0);

function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function perspective(
  fieldOfViewInRadians: number,
  aspect: number,
  near: number,
  far: number
): Float32Array {
  const f = 1.0 / Math.tan(fieldOfViewInRadians / 2);
  const rangeInv = 1 / (near - far);
  return new Float32Array([
    f / aspect,
    0,
    0,
    0,
    0,
    f,
    0,
    0,
    0,
    0,
    (near + far) * rangeInv,
    -1,
    0,
    0,
    near * far * rangeInv * 2,
    0,
  ]);
}

function multiplyMatrices(a: Float32Array, b: Float32Array): Float32Array {
  const result = new Float32Array(16);
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      let sum = 0;
      for (let i = 0; i < 4; i += 1) {
        sum += a[i * 4 + row] * b[col * 4 + i];
      }
      result[col * 4 + row] = sum;
    }
  }
  return result;
}

function xRotation(angleInRadians: number): Float32Array {
  const c = Math.cos(angleInRadians);
  const s = Math.sin(angleInRadians);
  return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]);
}

function yRotation(angleInRadians: number): Float32Array {
  const c = Math.cos(angleInRadians);
  const s = Math.sin(angleInRadians);
  return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]);
}

function lookAt(cameraPosition: number[], target: number[], up: number[]): Float32Array {
  const zAxis = normalize([
    cameraPosition[0] - target[0],
    cameraPosition[1] - target[1],
    cameraPosition[2] - target[2],
  ]);
  const xAxis = normalize(cross(up, zAxis));
  const yAxis = cross(zAxis, xAxis);

  return new Float32Array([
    xAxis[0],
    yAxis[0],
    zAxis[0],
    0,
    xAxis[1],
    yAxis[1],
    zAxis[1],
    0,
    xAxis[2],
    yAxis[2],
    zAxis[2],
    0,
    -dot(xAxis, cameraPosition),
    -dot(yAxis, cameraPosition),
    -dot(zAxis, cameraPosition),
    1,
  ]);
}

function normalize(v: number[]): number[] {
  const length = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / length, v[1] / length, v[2] / length];
}

function cross(a: number[], b: number[]): number[] {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

function dot(a: number[], b: number[]): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

let rotationAngle = 0;

function resizeCanvasToDisplaySize(canvas: HTMLCanvasElement) {
  const width = canvas.clientWidth * window.devicePixelRatio;
  const height = canvas.clientHeight * window.devicePixelRatio;
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    gl!.viewport(0, 0, width, height);
  }
}

function drawScene() {
  if (!gl) return;
  rotationAngle += 0.01;
  resizeCanvasToDisplaySize(canvas);

  const aspect = canvas.width / canvas.height;
  const projectionMatrix = perspective(degToRad(45), aspect, 0.1, 100);
  const cameraMatrix = lookAt([2, 2, 4], [0, 0, 0], [0, 1, 0]);

  const modelMatrix = multiplyMatrices(yRotation(rotationAngle), xRotation(rotationAngle * 0.7));
  const viewMatrix = cameraMatrix;
  const viewProjectionMatrix = multiplyMatrices(projectionMatrix, viewMatrix);
  const mvpMatrix = multiplyMatrices(viewProjectionMatrix, modelMatrix);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.uniformMatrix4fv(uMVP, false, mvpMatrix);
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
  requestAnimationFrame(drawScene);
}

drawScene();

export default {};
