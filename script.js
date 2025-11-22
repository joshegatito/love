// ========================================
// CONFIGURACIÓN DE LA ESCENA THREE.JS
// ========================================

// Variables globales de Three.js
let scene, camera, renderer;
let mainHeart, floatingHearts = [];
let starField, constellation;
let particles, particleSystem;
let clock = new THREE.Clock();

// Configuración de animaciones
let heartBeatTime = 0;
let cameraTime = 0;

// ========================================
// INICIALIZACIÓN
// ========================================

function init() {
    // Crear la escena
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0015, 0.05);

    // Configurar la cámara
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 15;

    // Configurar el renderer
    const canvas = document.getElementById('universeCanvas');
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Crear elementos 3D
    createLights();
    createMainHeart();
    createFloatingHearts();
    createStarField();
    createConstellation();
    createParticles();

    // Iniciar animación
    animate();

    // Eventos de ventana
    window.addEventListener('resize', onWindowResize);

    // Iniciar interacciones del DOM
    initDOMInteractions();
}

// ========================================
// ILUMINACIÓN
// ========================================

function createLights() {
    // Luz ambiental suave
    const ambientLight = new THREE.AmbientLight(0xffd1dc, 0.3);
    scene.add(ambientLight);

    // Luz puntual cálida (rosa)
    const warmLight = new THREE.PointLight(0xff69b4, 1.5, 50);
    warmLight.position.set(10, 10, 10);
    scene.add(warmLight);

    // Luz puntual fría (violeta)
    const coolLight = new THREE.PointLight(0x8a2be2, 1.2, 50);
    coolLight.position.set(-10, -10, 10);
    scene.add(coolLight);

    // Luz direccional suave
    const directionalLight = new THREE.DirectionalLight(0xffb3d9, 0.5);
    directionalLight.position.set(0, 5, 5);
    scene.add(directionalLight);
}

// ========================================
// CORAZÓN 3D PRINCIPAL
// ========================================

function createMainHeart() {
    const heartShape = createHeartShape();
    const geometry = new THREE.ExtrudeGeometry(heartShape, {
        depth: 1.5,
        bevelEnabled: true,
        bevelThickness: 0.3,
        bevelSize: 0.2,
        bevelSegments: 5
    });

    // Material con brillo y reflexión
    const material = new THREE.MeshPhongMaterial({
        color: 0xff1493,
        emissive: 0xff69b4,
        emissiveIntensity: 0.5,
        shininess: 100,
        specular: 0xffffff
    });

    mainHeart = new THREE.Mesh(geometry, material);
    mainHeart.position.set(0, 0, 0);
    mainHeart.scale.set(0.15, 0.15, 0.15);

    // Centrar el corazón
    geometry.center();

    scene.add(mainHeart);

    // Añadir glow (aura) alrededor del corazón principal
    createHeartGlow(mainHeart);
}

// Función para crear la forma de corazón
function createHeartShape() {
    const shape = new THREE.Shape();
    const x = 0, y = 0;

    shape.moveTo(x + 5, y + 5);
    shape.bezierCurveTo(x + 5, y + 5, x + 4, y, x, y);
    shape.bezierCurveTo(x - 6, y, x - 6, y + 7, x - 6, y + 7);
    shape.bezierCurveTo(x - 6, y + 11, x - 3, y + 15.4, x + 5, y + 19);
    shape.bezierCurveTo(x + 12, y + 15.4, x + 16, y + 11, x + 16, y + 7);
    shape.bezierCurveTo(x + 16, y + 7, x + 16, y, x + 10, y);
    shape.bezierCurveTo(x + 7, y, x + 5, y + 5, x + 5, y + 5);

    return shape;
}

// Crear efecto de aura/glow alrededor del corazón
function createHeartGlow(heart) {
    const glowGeometry = heart.geometry.clone();
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xff69b4,
        transparent: true,
        opacity: 0.3,
        side: THREE.BackSide
    });

    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.scale.set(1.2, 1.2, 1.2);
    heart.add(glow);

    // Animar el glow
    function animateGlow() {
        const scale = 1.2 + Math.sin(Date.now() * 0.003) * 0.15;
        glow.scale.set(scale, scale, scale);
        glowMaterial.opacity = 0.2 + Math.sin(Date.now() * 0.003) * 0.15;
    }

    heart.userData.animateGlow = animateGlow;
}

// ========================================
// CORAZONES FLOTANTES
// ========================================

function createFloatingHearts() {
    const heartShape = createHeartShape();

    for (let i = 0; i < 8; i++) {
        const geometry = new THREE.ExtrudeGeometry(heartShape, {
            depth: 0.8,
            bevelEnabled: true,
            bevelThickness: 0.2,
            bevelSize: 0.1,
            bevelSegments: 3
        });

        const hue = Math.random() * 0.1 + 0.9; // Tonos rosa-rojizo
        const color = new THREE.Color().setHSL(hue, 0.8, 0.6);

        const material = new THREE.MeshPhongMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.3,
            shininess: 80,
            transparent: true,
            opacity: 0.7
        });

        const heart = new THREE.Mesh(geometry, material);
        geometry.center();

        // Posición aleatoria
        heart.position.set(
            (Math.random() - 0.5) * 30,
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20 - 5
        );

        // Escala aleatoria
        const scale = Math.random() * 0.05 + 0.04;
        heart.scale.set(scale, scale, scale);

        // Rotación inicial aleatoria
        heart.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );

        // Datos para animación
        heart.userData = {
            rotationSpeed: {
                x: (Math.random() - 0.5) * 0.02,
                y: (Math.random() - 0.5) * 0.02,
                z: (Math.random() - 0.5) * 0.02
            },
            floatSpeed: Math.random() * 0.5 + 0.3,
            floatOffset: Math.random() * Math.PI * 2,
            isHovered: false
        };

        scene.add(heart);
        floatingHearts.push(heart);
    }
}

// ========================================
// CAMPO DE ESTRELLAS
// ========================================

function createStarField() {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 3000;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
        // Posiciones aleatorias
        positions[i] = (Math.random() - 0.5) * 200;
        positions[i + 1] = (Math.random() - 0.5) * 200;
        positions[i + 2] = (Math.random() - 0.5) * 200;

        // Colores (tonos rosa-violeta-blanco)
        const colorChoice = Math.random();
        if (colorChoice < 0.4) {
            // Rosa
            colors[i] = 1;
            colors[i + 1] = 0.7 + Math.random() * 0.3;
            colors[i + 2] = 0.85 + Math.random() * 0.15;
        } else if (colorChoice < 0.7) {
            // Violeta
            colors[i] = 0.7 + Math.random() * 0.3;
            colors[i + 1] = 0.5 + Math.random() * 0.3;
            colors[i + 2] = 1;
        } else {
            // Blanco
            colors[i] = 1;
            colors[i + 1] = 1;
            colors[i + 2] = 1;
        }
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const starMaterial = new THREE.PointsMaterial({
        size: 0.3,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
    });

    starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);
}

// ========================================
// CONSTELACIÓN (LÍNEAS CONECTADAS)
// ========================================

function createConstellation() {
    const points = [];
    const constellationPoints = 15;

    // Crear puntos de constelación
    for (let i = 0; i < constellationPoints; i++) {
        const point = new THREE.Vector3(
            (Math.random() - 0.5) * 25,
            (Math.random() - 0.5) * 15,
            (Math.random() - 0.5) * 10 - 10
        );
        points.push(point);
    }

    // Crear esferas brillantes en cada punto
    points.forEach(point => {
        const geometry = new THREE.SphereGeometry(0.15, 16, 16);
        const material = new THREE.MeshBasicMaterial({
            color: 0xffd700,
            transparent: true,
            opacity: 0.9
        });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.copy(point);
        scene.add(sphere);
    });

    // Conectar puntos cercanos con líneas
    const lineGeometry = new THREE.BufferGeometry();
    const linePositions = [];

    for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
            const distance = points[i].distanceTo(points[j]);
            if (distance < 8) {
                linePositions.push(points[i].x, points[i].y, points[i].z);
                linePositions.push(points[j].x, points[j].y, points[j].z);
            }
        }
    }

    lineGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePositions), 3));

    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0xffb3d9,
        transparent: true,
        opacity: 0.3
    });

    constellation = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(constellation);
}

// ========================================
// PARTÍCULAS (POLVO ESTELAR)
// ========================================

function createParticles() {
    const particleCount = 500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];

    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 50;
        positions[i + 1] = (Math.random() - 0.5) * 50;
        positions[i + 2] = (Math.random() - 0.5) * 30;

        velocities.push({
            x: (Math.random() - 0.5) * 0.02,
            y: (Math.random() - 0.5) * 0.02,
            z: (Math.random() - 0.5) * 0.02
        });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        color: 0xffb3d9,
        size: 0.15,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });

    particleSystem = new THREE.Points(geometry, material);
    particleSystem.userData.velocities = velocities;
    scene.add(particleSystem);
}

// ========================================
// ANIMACIÓN PRINCIPAL
// ========================================

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    // Rotación suave del corazón principal
    if (mainHeart) {
        mainHeart.rotation.y += 0.005;
        mainHeart.rotation.x = Math.sin(elapsedTime * 0.5) * 0.1;

        // Efecto de latido (heartbeat)
        heartBeatTime += delta;
        if (heartBeatTime > 1.5) {
            const beatScale = 1 + Math.sin(elapsedTime * 10) * 0.08;
            mainHeart.scale.set(beatScale * 0.15, beatScale * 0.15, beatScale * 0.15);

            // Intensificar emisivo durante el latido
            mainHeart.material.emissiveIntensity = 0.5 + Math.sin(elapsedTime * 10) * 0.3;

            if (heartBeatTime > 1.8) {
                heartBeatTime = 0;
            }
        } else {
            mainHeart.scale.set(0.15, 0.15, 0.15);
            mainHeart.material.emissiveIntensity = 0.5;
        }

        // Animar glow
        if (mainHeart.userData.animateGlow) {
            mainHeart.userData.animateGlow();
        }
    }

    // Animar corazones flotantes
    floatingHearts.forEach(heart => {
        heart.rotation.x += heart.userData.rotationSpeed.x;
        heart.rotation.y += heart.userData.rotationSpeed.y;
        heart.rotation.z += heart.userData.rotationSpeed.z;

        // Movimiento flotante
        heart.position.y += Math.sin(elapsedTime * heart.userData.floatSpeed + heart.userData.floatOffset) * 0.01;

        // Efecto hover (latido suave)
        if (heart.userData.isHovered) {
            const hoverScale = heart.scale.x / 0.05;
            const targetScale = 1 + Math.sin(elapsedTime * 5) * 0.2;
            heart.scale.multiplyScalar(0.95 + targetScale * 0.05);
        }
    });

    // Rotación lenta del campo de estrellas
    if (starField) {
        starField.rotation.y += 0.0002;
    }

    // Rotación de constelación
    if (constellation) {
        constellation.rotation.y += 0.0003;
    }

    // Animar partículas
    if (particleSystem) {
        const positions = particleSystem.geometry.attributes.position.array;
        const velocities = particleSystem.userData.velocities;

        for (let i = 0; i < positions.length; i += 3) {
            positions[i] += velocities[i / 3].x;
            positions[i + 1] += velocities[i / 3].y;
            positions[i + 2] += velocities[i / 3].z;

            // Mantener partículas dentro de límites
            if (Math.abs(positions[i]) > 25) velocities[i / 3].x *= -1;
            if (Math.abs(positions[i + 1]) > 25) velocities[i / 3].y *= -1;
            if (Math.abs(positions[i + 2]) > 15) velocities[i / 3].z *= -1;
        }

        particleSystem.geometry.attributes.position.needsUpdate = true;
    }

    // Movimiento de cámara (breathing effect)
    cameraTime += delta * 0.3;
    camera.position.x = Math.sin(cameraTime) * 0.5;
    camera.position.y = Math.cos(cameraTime * 0.8) * 0.3;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
}

// ========================================
// RESPONSIVE
// ========================================

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ========================================
// INTERACCIONES DEL DOM
// ========================================

function initDOMInteractions() {
    // Efecto typing para el poema
    const poemText = document.getElementById('poemText');
    const poem = 'En el silencio de la noche, tu nombre es mi constelación...';
    let charIndex = 0;

    function typePoem() {
        if (charIndex < poem.length) {
            poemText.textContent += poem.charAt(charIndex);
            charIndex++;
            setTimeout(typePoem, 80);
        } else {
            poemText.classList.add('typing-complete');
        }
    }

    // Iniciar typing después de 2.5 segundos
    setTimeout(typePoem, 2500);

    // Botón del corazón
    const heartButton = document.getElementById('heartButton');
    const secretMessage = document.getElementById('secretMessage');
    const closeButton = document.getElementById('closeButton');

    heartButton.addEventListener('click', () => {
        secretMessage.classList.add('show');
    });

    closeButton.addEventListener('click', () => {
        secretMessage.classList.remove('show');
        setTimeout(() => {
            secretMessage.style.display = 'none';
        }, 500);
    });

    // Cerrar modal al hacer clic fuera del contenido
    secretMessage.addEventListener('click', (e) => {
        if (e.target === secretMessage) {
            closeButton.click();
        }
    });

    // Control de música
    const musicToggle = document.getElementById('musicToggle');
    const musicIcon = document.getElementById('musicIcon');
    const ambientMusic = document.getElementById('ambientMusic');
    let isPlaying = false;

    musicToggle.addEventListener('click', () => {
        if (isPlaying) {
            ambientMusic.pause();
            musicIcon.textContent = '🔇';
            musicToggle.classList.remove('playing');
        } else {
            ambientMusic.play().catch(e => {
                console.log('No se pudo reproducir la música:', e);
            });
            musicIcon.textContent = '🔊';
            musicToggle.classList.add('playing');
        }
        isPlaying = !isPlaying;
    });

    // Crear estrellas fugaces periódicamente
    createShootingStars();
}

// ========================================
// ESTRELLAS FUGACES
// ========================================

function createShootingStars() {
    const container = document.querySelector('.shooting-stars');

    function createStar() {
        const star = document.createElement('div');
        star.style.position = 'absolute';
        star.style.width = '2px';
        star.style.height = '2px';
        star.style.background = 'linear-gradient(to right, transparent, #fff, transparent)';
        star.style.boxShadow = '0 0 10px 2px rgba(255, 182, 193, 0.8)';
        star.style.borderRadius = '50%';
        star.style.top = Math.random() * 50 + '%';
        star.style.left = Math.random() * 100 + '%';
        star.style.animation = 'shootingStar 2s linear forwards';

        container.appendChild(star);

        setTimeout(() => {
            star.remove();
        }, 2000);
    }

    // Crear estrella fugaz cada 4-8 segundos
    function scheduleNextStar() {
        const delay = Math.random() * 4000 + 4000;
        setTimeout(() => {
            createStar();
            scheduleNextStar();
        }, delay);
    }

    scheduleNextStar();
}

// ========================================
// RAYCASTING PARA INTERACCIÓN CON CORAZONES
// ========================================

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('mousemove', (event) => {
    // Calcular posición del mouse normalizada
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Actualizar raycaster
    raycaster.setFromCamera(mouse, camera);

    // Detectar intersecciones con corazones flotantes
    const intersects = raycaster.intersectObjects(floatingHearts);

    // Resetear todos los corazones
    floatingHearts.forEach(heart => {
        heart.userData.isHovered = false;
    });

    // Marcar corazones con hover
    if (intersects.length > 0) {
        intersects[0].object.userData.isHovered = true;
        document.body.style.cursor = 'pointer';
    } else {
        document.body.style.cursor = 'default';
    }
});

// ========================================
// INICIAR LA APLICACIÓN
// ========================================

// Esperar a que el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
