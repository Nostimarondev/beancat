const ffmpeg = require('ffmpeg-static');
const { execSync } = require('child_process');

console.log('Empezando la optimización del video...');
try {
  // -g 1 fuerza un keyframe en cada frame
  // -pix_fmt yuv420p y -profile:v main aseguran compatibilidad web 8-bit (el original era 10-bit)
  execSync(`"${ffmpeg}" -y -i public/vidback.mp4 -g 1 -c:v libx264 -pix_fmt yuv420p -profile:v main -preset fast public/vidback_smooth.mp4`, {stdio: 'inherit'});
  console.log('¡Conversión exitosa!');
} catch (err) {
  console.error('Hubo un error al convertir el video:', err);
}
