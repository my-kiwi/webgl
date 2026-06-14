// 1. Récupère l'élément canvas du DOM et le cast en HTMLCanvasElement
const canvas = document.getElementById('triangle-canvas') as HTMLCanvasElement;
// 2. Récupère le contexte WebGL du canvas. Si non supporté, gl sera null.
const gl = canvas.getContext('webgl');

// 3. Vérifie si WebGL est disponible dans le navigateur
if (!gl) {
  // 4. Affiche une alerte si WebGL n'est pas supporté
  alert('WebGL non supporté dans votre navigateur !');
  // 5. Lance une erreur pour arrêter l'exécution
  throw new Error('WebGL non supporté');
}

// 6. Définition du code source du Vertex Shader (en GLSL)
//    Ce shader traite chaque sommet (vertex) des formes à dessiner.
const vertexShaderSource = `
    // 7. Déclare un attribut 'aPosition' de type vec2 (2 floats : x, y)
    attribute vec2 aPosition;
    void main() {
        // 8. gl_Position est une variable spéciale qui définit la position finale du sommet
        //    vec4(aPosition, 0.0, 1.0) : convertit vec2 en vec4 (x, y, z=0, w=1)
        gl_Position = vec4(aPosition, 0.0, 1.0);
    }
`;

// 9. Définition du code source du Fragment Shader (en GLSL)
//    Ce shader traite chaque pixel (fragment) pour définir sa couleur.
const fragmentShaderSource = `
    // 10. Déclare la précision des floats (mediump = précision moyenne)
    precision mediump float;
    void main() {
        // 11. gl_FragColor est une variable spéciale qui définit la couleur du pixel
        //     vec4(1.0, 0.0, 0.0, 1.0) = rouge opaque (R, G, B, A)
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
`;

// 12. Fonction utilitaire pour compiler un shader
//     Prend en entrée : le contexte WebGL, le code source du shader, et son type (VERTEX_SHADER ou FRAGMENT_SHADER)
function compileShader(gl: WebGLRenderingContext, source: string, type: number): WebGLShader {
  // 13. Crée un objet shader de type spécifié
  const shader = gl.createShader(type)!;
  // 14. Associe le code source au shader
  gl.shaderSource(shader, source);
  // 15. Compile le shader
  gl.compileShader(shader);
  // 16. Vérifie si la compilation a réussi
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    // 17. Affiche les erreurs de compilation dans la console
    console.error('Erreur de compilation du shader:', gl.getShaderInfoLog(shader));
    // 18. Supprime le shader en cas d'erreur
    gl.deleteShader(shader);
    // 19. Lance une erreur pour arrêter l'exécution
    throw new Error('Erreur de compilation du shader');
  }
  // 20. Retourne le shader compilé
  return shader;
}

// 21. Compile le Vertex Shader
const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
// 22. Compile le Fragment Shader
const fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);

// 23. Crée un programme WebGL (contient les shaders liés)
const program = gl.createProgram()!;
// 24. Attache le Vertex Shader au programme
gl.attachShader(program, vertexShader);
// 25. Attache le Fragment Shader au programme
gl.attachShader(program, fragmentShader);
// 26. Lie les shaders entre eux dans le programme
gl.linkProgram(program);
// 27. Vérifie si le linkage a réussi
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  // 28. Affiche les erreurs de linkage dans la console
  console.error('Erreur de linkage du programme:', gl.getProgramInfoLog(program));
  // 29. Lance une erreur pour arrêter l'exécution
  throw new Error('Erreur de linkage du programme');
}
// 30. Active le programme pour l'utiliser
gl.useProgram(program);

// 31. Définition des coordonnées des sommets du triangle (x, y)
//     Chaque paire représente un sommet en coordonnées normalisées (-1 à 1)
const vertices = new Float32Array([
  0.0,
  0.5, // Sommet du haut (x=0, y=0.5)
  -0.5,
  -0.5, // Sommet en bas à gauche (x=-0.5, y=-0.5)
  0.5,
  -0.5, // Sommet en bas à droite (x=0.5, y=-0.5)
]);

// 32. Crée un buffer pour stocker les données des sommets
const vertexBuffer = gl.createBuffer()!;
// 33. Lie le buffer au contexte WebGL (ARRAY_BUFFER = buffer pour les attributs de sommets)
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
// 34. Remplit le buffer avec les données des sommets (STATIC_DRAW = données ne changeront pas)
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

// 35. Récupère l'index de l'attribut 'aPosition' dans le programme
const aPosition = gl.getAttribLocation(program, 'aPosition');
// 36. Active l'attribut 'aPosition' pour qu'il soit utilisé
gl.enableVertexAttribArray(aPosition);
// 37. Configure comment lire les données du buffer pour l'attribut 'aPosition'
//     - 2 : nombre de composantes par sommet (x, y)
//     - gl.FLOAT : type des données
//     - false : pas de normalisation
//     - 0 : stride (espace entre chaque sommet, 0 = serré)
//     - 0 : offset (début des données dans le buffer)
gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

// 38. Définit la couleur de fond (noir opaque)
gl.clearColor(0.0, 0.0, 0.0, 1.0);
// 39. Efface le canvas avec la couleur de fond
gl.clear(gl.COLOR_BUFFER_BIT);
// 40. Dessine les sommets sous forme de triangle (TRIANGLES)
//     - 0 : index de départ dans le buffer
//     - 3 : nombre de sommets à dessiner
gl.drawArrays(gl.TRIANGLES, 0, 3);

export default {};
