/**
 * Licium FX Plugin
 * 
 * Este plugin proporciona directivas personalizadas para añadir efectos visuales
 * premium a las tarjetas e imágenes del proyecto, en sintonía con la estética "Noir / Imperial".
 */

export default {
    install(app) {
        /**
         * v-tilt
         * Añade un efecto 3D suave al mover el ratón sobre un elemento (ideal para tarjetas).
         */
        app.directive('tilt', {
            mounted(el, binding) {
                const maxTilt = binding.value?.max || 15; // Inclinación máxima en grados
                const scale = binding.value?.scale || 1.02; // Escala al hacer hover

                el.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                el.style.transformOrigin = 'center center';
                // Requiere perspectiva en el elemento padre o en sí mismo
                el.style.transformStyle = 'preserve-3d';

                let bounds;

                const onMouseEnter = () => {
                    bounds = el.getBoundingClientRect();
                    el.style.transition = 'transform 0.1s ease-out';
                };

                const onMouseMove = (e) => {
                    if (!bounds) bounds = el.getBoundingClientRect();
                    const mouseX = e.clientX - bounds.left;
                    const mouseY = e.clientY - bounds.top;

                    const multiplierX = (mouseX / bounds.width - 0.5) * 2;
                    const multiplierY = (mouseY / bounds.height - 0.5) * 2;

                    const tiltX = maxTilt * multiplierY * -1;
                    const tiltY = maxTilt * multiplierX;

                    el.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(${scale}, ${scale}, ${scale})`;
                };

                const onMouseLeave = () => {
                    el.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                    el.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
                };

                el.addEventListener('mouseenter', onMouseEnter);
                el.addEventListener('mousemove', onMouseMove);
                el.addEventListener('mouseleave', onMouseLeave);

                // Guardamos las referencias para limpiar después
                el._tiltHandlers = { onMouseEnter, onMouseMove, onMouseLeave };
            },
            unmounted(el) {
                if (el._tiltHandlers) {
                    el.removeEventListener('mouseenter', el._tiltHandlers.onMouseEnter);
                    el.removeEventListener('mousemove', el._tiltHandlers.onMouseMove);
                    el.removeEventListener('mouseleave', el._tiltHandlers.onMouseLeave);
                }
            }
        });

        /**
         * v-img-zoom
         * Efecto de lente de aumento (lupa) al pasar el ratón por una imagen.
         */
        app.directive('img-zoom', {
            mounted(el, binding) {
                const zoomFactor = binding.value?.zoom || 2;
                
                // Aseguramos que el contenedor tenga position relative y overflow hidden si es posible
                el.style.position = 'relative';
                el.style.overflow = 'hidden';

                // Buscar la imagen dentro del contenedor
                const img = el.tagName === 'IMG' ? el : el.querySelector('img');
                if (!img) return;

                img.style.transition = 'transform 0.3s ease, transform-origin 0.3s ease';

                const onMouseMove = (e) => {
                    const bounds = el.getBoundingClientRect();
                    const x = e.clientX - bounds.left;
                    const y = e.clientY - bounds.top;

                    // Calcular el porcentaje de posición
                    const xPercent = (x / bounds.width) * 100;
                    const yPercent = (y / bounds.height) * 100;

                    img.style.transformOrigin = `${xPercent}% ${yPercent}%`;
                    img.style.transform = `scale(${zoomFactor})`;
                };

                const onMouseLeave = () => {
                    img.style.transform = 'scale(1)';
                    setTimeout(() => {
                        if (img.style.transform === 'scale(1)') {
                            img.style.transformOrigin = 'center center';
                        }
                    }, 300);
                };

                el.addEventListener('mousemove', onMouseMove);
                el.addEventListener('mouseleave', onMouseLeave);

                el._zoomHandlers = { onMouseMove, onMouseLeave };
            },
            unmounted(el) {
                if (el._zoomHandlers) {
                    el.removeEventListener('mousemove', el._zoomHandlers.onMouseMove);
                    el.removeEventListener('mouseleave', el._zoomHandlers.onMouseLeave);
                }
            }
        });
    }
};
