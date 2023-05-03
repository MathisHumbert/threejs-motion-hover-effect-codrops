uniform float uAlpha;
uniform sampler2D uTexture;
uniform vec2 uOffset;

varying vec2 vUv;

vec2 scaleUV(vec2 newUv, float scale){
  float center = 0.5;
  return ((newUv - center) * scale) + center;
}

void main(){
  vec2 customUv = vUv + (uOffset * 2.);
  customUv -= 0.5;
  customUv *= 0.8;
  customUv += 0.5;
  
  // customUv = scaleUV(customUv, 0.8)

  vec3 color = texture2D(uTexture, customUv).rgb;

  gl_FragColor = vec4(color, uAlpha);
}