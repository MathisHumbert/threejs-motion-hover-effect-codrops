uniform vec2 uOffset;

varying vec2 vUv;

vec3 deformationCurve(vec3 position, vec2 uv, vec2 offset) {
  position.x += (sin(uv.y * PI) * offset.x);
  position.y += (sin(uv.x * PI) * offset.y);
  return position;
}

void main(){
  vec3 newPosition = deformationCurve(position, uv, uOffset);

  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}