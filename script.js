// ========================================
// VARIABLES GLOBALES
// ========================================

let scene, camera, renderer;
let hearts = [];
let starField;
let clock = new THREE.Clock();

// ========================================
// INICIALIZACIÓN PRINCIPAL
// ========================================

window.addEventListener('load', function() {
    // Inicializar AOS
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 1200,
            easing: 'ease-out-cubic',
            once: false,
            mirror: true
        });
    }

    // Inicializar Particles.js
    initParticles();

    // Inicializar Three.js
    initThreeJS();

    // Inicializar efectos de escritura
    initTypedEffects();

    // Inicializar contador
    animateCounter();

    // Inicializar interacciones
    initInteractions();

    // Crear estrellas fugaces
    createShootingStars();

    // Notificación de bienvenida
    setTimeout(() => {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: '✨ Bienvenida a tu universo ✨',
                text: 'Cada estrella aquí brilla por ti...',
                icon: 'info',
                timer: 3000,
                showConfirmButton: false,
                background: 'rgba(26, 0, 51, 0.98)',
                color: '#ffb3d9',
                backdrop: 'rgba(0, 0, 0, 0.4)'
            });
        }
    }, 1000);

    // Animación de entrada
    if (typeof gsap !== 'undefined') {
        gsap.from('body', {
            opacity: 0,
            duration: 1,
            ease: 'power2.out'
        });
    }
});

// ========================================
// PARTICLES.JS
// ========================================

function initParticles() {
    if (typeof particlesJS === 'undefined') return;

    particlesJS('particles-js', {
        particles: {
            number: {
                value: 150,
                density: {
                    enable: true,
                    value_area: 800
                }
            },
            color: {
                value: ['#ff69b4', '#ff1493', '#8a2be2', '#ffd700']
            },
            shape: {
                type: 'circle'
            },
            opacity: {
                value: 0.6,
                random: true,
                anim: {
                    enable: true,
                    speed: 1,
                    opacity_min: 0.1,
                    sync: false
                }
            },
            size: {
                value: 4,
                random: true,
                anim: {
                    enable: true,
                    speed: 2,
                    size_min: 0.1,
                    sync: false
                }
            },
            line_linked: {
                enable: true,
                distance: 150,
                color: '#ff69b4',
                opacity: 0.3,
                width: 1
            },
            move: {
                enable: true,
                speed: 1.5,
                direction: 'none',
                random: true,
                straight: false,
                out_mode: 'out',
                bounce: false,
                attract: {
                    enable: true,
                    rotateX: 600,
                    rotateY: 1200
                }
            }
        },
        interactivity: {
            detect_on: 'canvas',
            events: {
                onhover: {
                    enable: true,
                    mode: 'grab'
                },
                onclick: {
                    enable: true,
                    mode: 'push'
                },
                resize: true
            },
            modes: {
                grab: {
                    distance: 200,
                    line_linked: {
                        opacity: 0.8
                    }
                },
                push: {
                    particles_nb: 4
                }
            }
        },
        retina_detect: true
    });
}

// ========================================
// THREE.JS - ESCENA 3D
// ========================================

function initThreeJS() {
    if (typeof THREE === 'undefined') return;

    // Crear escena
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0015, 0.03);

    // Configurar cámara
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 20;

    // Configurar renderer
    const canvas = document.getElementById('universeCanvas');
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Crear luces
    createLights();

    // Crear corazones 3D
    createHearts3D();

    // Crear campo de estrellas
    createStarField3D();

    // Iniciar animación
    animateThree();

    // Evento de resize
    window.addEventListener('resize', onWindowResize);
}

function createLights() {
    const ambientLight = new THREE.AmbientLight(0xffd1dc, 0.4);
    scene.add(ambientLight);

    const light1 = new THREE.PointLight(0xff69b4, 2, 50);
    light1.position.set(15, 15, 15);
    scene.add(light1);

    const light2 = new THREE.PointLight(0x8a2be2, 1.5, 50);
    light2.position.set(-15, -15, 15);
    scene.add(light2);

    const light3 = new THREE.PointLight(0xffd700, 1, 40);
    light3.position.set(0, 20, -10);
    scene.add(light3);
}

function createHearts3D() {
    const heartShape = new THREE.Shape();
    const x = 0, y = 0;

    heartShape.moveTo(x + 5, y + 5);
    heartShape.bezierCurveTo(x + 5, y + 5, x + 4, y, x, y);
    heartShape.bezierCurveTo(x - 6, y, x - 6, y + 7, x - 6, y + 7);
    heartShape.bezierCurveTo(x - 6, y + 11, x - 3, y + 15.4, x + 5, y + 19);
    heartShape.bezierCurveTo(x + 12, y + 15.4, x + 16, y + 11, x + 16, y + 7);
    heartShape.bezierCurveTo(x + 16, y + 7, x + 16, y, x + 10, y);
    heartShape.bezierCurveTo(x + 7, y, x + 5, y + 5, x + 5, y + 5);

    for (let i = 0; i < 12; i++) {
        const geometry = new THREE.ExtrudeGeometry(heartShape, {
            depth: 1.2,
            bevelEnabled: true,
            bevelThickness: 0.3,
            bevelSize: 0.2,
            bevelSegments: 5
        });

        const hue = Math.random() * 0.1 + 0.9;
        const color = new THREE.Color().setHSL(hue, 0.8, 0.6);

        const material = new THREE.MeshPhongMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.4,
            shininess: 100,
            transparent: true,
            opacity: 0.8
        });

        const heart = new THREE.Mesh(geometry, material);
        geometry.center();

        heart.position.set(
            (Math.random() - 0.5) * 40,
            (Math.random() - 0.5) * 30,
            (Math.random() - 0.5) * 30 - 10
        );

        const scale = Math.random() * 0.06 + 0.04;
        heart.scale.set(scale, scale, scale);

        heart.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );

        heart.userData = {
            rotationSpeed: {
                x: (Math.random() - 0.5) * 0.02,
                y: (Math.random() - 0.5) * 0.02,
                z: (Math.random() - 0.5) * 0.02
            },
            floatSpeed: Math.random() * 0.5 + 0.3,
            floatOffset: Math.random() * Math.PI * 2,
            baseScale: scale
        };

        scene.add(heart);
        hearts.push(heart);
    }
}

function createStarField3D() {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 4000;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
        const i3 = i * 3;

        positions[i3] = (Math.random() - 0.5) * 250;
        positions[i3 + 1] = (Math.random() - 0.5) * 250;
        positions[i3 + 2] = (Math.random() - 0.5) * 250;

        const colorChoice = Math.random();
        if (colorChoice < 0.3) {
            colors[i3] = 1;
            colors[i3 + 1] = 0.41;
            colors[i3 + 2] = 0.71;
        } else if (colorChoice < 0.6) {
            colors[i3] = 0.54;
            colors[i3 + 1] = 0.17;
            colors[i3 + 2] = 0.89;
        } else {
            colors[i3] = 1;
            colors[i3 + 1] = 0.84 + Math.random() * 0.16;
            colors[i3 + 2] = 0.5 + Math.random() * 0.5;
        }
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const starMaterial = new THREE.PointsMaterial({
        size: 0.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending
    });

    starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);
}

function animateThree() {
    requestAnimationFrame(animateThree);

    const elapsedTime = clock.getElapsedTime();

    hearts.forEach((heart, index) => {
        heart.rotation.x += heart.userData.rotationSpeed.x;
        heart.rotation.y += heart.userData.rotationSpeed.y;
        heart.rotation.z += heart.userData.rotationSpeed.z;

        heart.position.y += Math.sin(elapsedTime * heart.userData.floatSpeed + heart.userData.floatOffset) * 0.015;

        const pulse = 1 + Math.sin(elapsedTime * 2 + index) * 0.1;
        const scale = heart.userData.baseScale * pulse;
        heart.scale.set(scale, scale, scale);
    });

    if (starField) {
        starField.rotation.y += 0.0003;
        starField.rotation.x += 0.0001;
    }

    camera.position.x = Math.sin(elapsedTime * 0.3) * 2;
    camera.position.y = Math.cos(elapsedTime * 0.2) * 1;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ========================================
// TYPED.JS - EFECTOS DE ESCRITURA
// ========================================

function initTypedEffects() {
    if (typeof Typed === 'undefined') return;

    // Subtítulo con efecto typing
    new Typed('#typedSubtitle', {
        strings: [
            'Cada latido mío viaja hacia ti, entre estrellas hechas de sueños...',
            'Tu nombre es mi oración favorita...',
            'En el infinito de las posibilidades, te elegí a ti...'
        ],
        typeSpeed: 60,
        backSpeed: 30,
        backDelay: 3000,
        loop: true,
        showCursor: true,
        cursorChar: '|'
    });

    // Poema con efecto typing
    setTimeout(() => {
        new Typed('#typedPoem', {
            strings: ['En el silencio de la noche, tu nombre es mi constelación...'],
            typeSpeed: 80,
            showCursor: false,
            onComplete: function() {
                document.getElementById('typedPoem').style.textShadow = '0 0 20px rgba(255, 182, 193, 0.8)';
            }
        });
    }, 3000);
}

// ========================================
// CONTADOR DE AMOR
// ========================================

function animateCounter() {
    const counterElement = document.getElementById('daysCounter');
    const targetNumber = 365;

    if (typeof gsap !== 'undefined') {
        gsap.to(counterElement, {
            innerHTML: targetNumber,
            duration: 3,
            ease: 'power2.out',
            snap: { innerHTML: 1 },
            delay: 2,
            onUpdate: function() {
                counterElement.innerHTML = Math.ceil(counterElement.innerHTML);
            }
        });
    } else {
        // Fallback sin GSAP
        let current = 0;
        const increment = targetNumber / 100;
        const timer = setInterval(() => {
            current += increment;
            if (current >= targetNumber) {
                current = targetNumber;
                clearInterval(timer);
            }
            counterElement.innerHTML = Math.ceil(current);
        }, 30);
    }
}

// ========================================
// INTERACCIONES DEL DOM
// ========================================

function initInteractions() {
    // Bootstrap Modals
    const secretMessageModal = new bootstrap.Modal(document.getElementById('secretMessageModal'));
    const galleryModal = new bootstrap.Modal(document.getElementById('galleryModal'));

    // Botón "Toca mi corazón"
    document.getElementById('heartButton').addEventListener('click', function() {
        secretMessageModal.show();

        if (typeof gsap !== 'undefined') {
            gsap.from('.message-text-modal', {
                opacity: 0,
                y: 50,
                duration: 1,
                delay: 0.3,
                ease: 'back.out(1.7)'
            });
        }
    });

    // Botón de galería
    document.getElementById('galleryButton').addEventListener('click', function() {
        galleryModal.show();
    });

    // Control de música
    const musicToggle = document.getElementById('musicToggle');
    const musicIcon = document.getElementById('musicIcon');
    const ambientMusic = document.getElementById('ambientMusic');
    let isPlaying = false;

    musicToggle.addEventListener('click', function() {
        if (isPlaying) {
            ambientMusic.pause();
            musicIcon.className = 'fas fa-music';
            musicToggle.classList.remove('active');
        } else {
            ambientMusic.play().catch(e => {
                console.log('No hay música configurada');
            });
            musicIcon.className = 'fas fa-volume-high';
            musicToggle.classList.add('active');
        }
        isPlaying = !isPlaying;
    });

    // Botón de pantalla completa
    document.getElementById('fullscreenBtn').addEventListener('click', function() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            this.querySelector('i').className = 'fas fa-compress';
        } else {
            document.exitFullscreen();
            this.querySelector('i').className = 'fas fa-expand';
        }
    });

    // Botón de cambiar efectos
    let effectsMode = 1;
    document.getElementById('effectsBtn').addEventListener('click', function() {
        effectsMode++;
        if (effectsMode > 3) effectsMode = 1;

        if (typeof pJSDom !== 'undefined' && pJSDom[0]) {
            if (effectsMode === 1) {
                pJSDom[0].pJS.particles.move.speed = 1.5;
                pJSDom[0].pJS.particles.number.value = 150;
            } else if (effectsMode === 2) {
                pJSDom[0].pJS.particles.move.speed = 3;
                pJSDom[0].pJS.particles.number.value = 250;
            } else {
                pJSDom[0].pJS.particles.move.speed = 0.8;
                pJSDom[0].pJS.particles.number.value = 80;
            }
        }

        const modes = ['Romántico', 'Intenso', 'Suave'];
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: `Modo ${modes[effectsMode - 1]}`,
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
                background: 'rgba(26, 0, 51, 0.95)',
                color: '#ffb3d9'
            });
        }
    });

    // Efecto parallax con GSAP
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        gsap.to('.main-title', {
            scrollTrigger: {
                trigger: '.main-title',
                start: 'top top',
                end: 'bottom top',
                scrub: true
            },
            y: 200,
            opacity: 0.5,
            scale: 0.8
        });
    }
}

// ========================================
// ESTRELLAS FUGACES
// ========================================

function createShootingStars() {
    const container = document.querySelector('.shooting-stars');

    function createStar() {
        const star = document.createElement('div');
        star.style.position = 'absolute';
        star.style.width = '3px';
        star.style.height = '3px';
        star.style.background = 'linear-gradient(to right, transparent, #fff, transparent)';
        star.style.boxShadow = '0 0 15px 3px rgba(255, 182, 193, 0.9)';
        star.style.borderRadius = '50%';
        star.style.top = Math.random() * 40 + '%';
        star.style.left = Math.random() * 100 + '%';
        star.style.animation = 'shootingStar 2.5s linear forwards';

        const trail = document.createElement('div');
        trail.style.position = 'absolute';
        trail.style.width = '100px';
        trail.style.height = '2px';
        trail.style.background = 'linear-gradient(to right, rgba(255, 182, 193, 0.8), transparent)';
        trail.style.transformOrigin = 'left center';
        trail.style.transform = 'rotate(-45deg)';
        star.appendChild(trail);

        container.appendChild(star);

        setTimeout(() => {
            star.remove();
        }, 2500);
    }

    function scheduleNextStar() {
        const delay = Math.random() * 3000 + 3000;
        setTimeout(() => {
            createStar();
            scheduleNextStar();
        }, delay);
    }

    scheduleNextStar();
}

// ========================================
// EFECTOS DE CURSOR
// ========================================

document.addEventListener('mousemove', function(e) {
    if (Math.random() > 0.97) {
        const heart = document.createElement('div');
        heart.innerHTML = '❤️';
        heart.style.position = 'fixed';
        heart.style.left = e.clientX + 'px';
        heart.style.top = e.clientY + 'px';
        heart.style.fontSize = '10px';
        heart.style.pointerEvents = 'none';
        heart.style.zIndex = '9999';
        heart.style.opacity = '0.7';
        heart.style.transition = 'all 1s ease';
        document.body.appendChild(heart);

        setTimeout(() => {
            heart.style.transform = 'translateY(-50px) scale(1.5)';
            heart.style.opacity = '0';
        }, 10);

        setTimeout(() => {
            heart.remove();
        }, 1000);
    }
});
