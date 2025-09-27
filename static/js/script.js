document.addEventListener('DOMContentLoaded', () => {
    const folderButton = document.getElementById('folderButton');
    const introScreen = document.getElementById('introScreen');
    const mainPage = document.getElementById('mainPage');
    const fadeOverlay = document.getElementById('fadeOverlay');
    const nextPageBtn = document.getElementById('nextPageBtn');
    const pageTabs = document.querySelectorAll('.page-tab');
    const stickers = document.querySelectorAll('.sticker');
    const scatteredAssets = document.querySelectorAll('.scattered-asset');

    // Function to generate confetti and add it to the page
    const createConfetti = () => {
        const confettiCount = 80;
        const colors = ['#fca5a5', '#fcd34d', '#bef264', '#93c5fd', '#a78bfa', '#f87171'];
        const body = document.body;

        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');
            confetti.style.width = `${Math.random() * 8 + 4}px`;
            confetti.style.height = `${Math.random() * 12 + 4}px`;
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = `${Math.random() * 100}vw`;
            confetti.style.animation = `pop-confetti 1.5s ease-out forwards`;
            confetti.style.setProperty('--x', `${(Math.random() - 0.5) * 500}px`);
            confetti.style.setProperty('--y', `${(Math.random() - 0.5) * 500}px`);
            confetti.style.setProperty('--r', `${Math.random() * 360}deg`);
            confetti.style.animationDelay = `${Math.random() * 0.5}s`;
            body.appendChild(confetti);
        }
    };

    // Event listener for the intro button click
    folderButton.addEventListener('click', () => {
        folderButton.classList.add('scattered');

        // Fetch the base scatter_folder.svg once
        fetch("static/img/scatter_folder.svg")
            .then(r => r.text())
            .then(svg => {
                scatteredAssets.forEach(asset => {
                    // Randomize position and rotation
                    const randomX = (Math.random() - 0.5) * 500;
                    const randomY = (Math.random() - 0.5) * 500;
                    const randomR = Math.random() * 360;
                    asset.style.setProperty('--x', `${randomX}px`);
                    asset.style.setProperty('--y', `${randomY}px`);
                    asset.style.setProperty('--r', `${randomR}deg`);
                    asset.style.animationDelay = `${Math.random() * 0.5}s`;

                    // Randomize fill color
                    const color = `hsl(${Math.floor(Math.random() * 360)},70%,50%)`;
                    const colored = svg.replace(/fill="[^"]*"/g, `fill="${color}"`);
                    asset.src = "data:image/svg+xml;base64," + btoa(colored);
                });
            });

        createConfetti();

        setTimeout(() => {
            fadeOverlay.classList.add('visible');
        }, 500);

        setTimeout(() => {
            introScreen.style.display = 'none';
            mainPage.style.display = 'block';
            mainPage.classList.add('active');
            fadeOverlay.classList.remove('visible');
        }, 2000);
    });

    // Event listener for the "Next Page" button
    nextPageBtn.addEventListener('click', () => {
        const targetId = nextPageBtn.getAttribute('data-target');
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth' });
        }
    });

    // Event listener for the page tabs
    pageTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.getAttribute('data-target');
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Event listeners for the interactive stickers
    stickers.forEach(sticker => {
        sticker.addEventListener('click', () => {
            sticker.classList.add('popped');
            setTimeout(() => {
                sticker.classList.remove('popped');
            }, 300); // Duration of the pop animation
        });
    });

    // --- 3D Model Viewer Logic ---
    let camera, scene, renderer, cube, model, controls;
    let isDragging = false;
    let previousMousePosition = {
        x: 0,
        y: 0
    };

    function setup3DScene() {
        const canvas = document.getElementById('model-canvas');
        const container = canvas.parentElement;

        // Scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf3f4f6);

        // Camera
        camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        camera.position.z = 2.5;

        // Renderer
        renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
        renderer.setSize(container.clientWidth, container.clientHeight);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(0, 1, 1);
        scene.add(directionalLight);

        // Add a placeholder cube
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({ color: 0xef4444 });
        cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        // Load the GLB model from your static folder
        loadGLBModel('static/img/your_model.glb');

        // Animation loop
        function animate() {
            requestAnimationFrame(animate);
            if (cube) {
                cube.rotation.x += 0.005;
                cube.rotation.y += 0.005;
            }
            if (model) {
                model.rotation.y += 0.005;
            }
            renderer.render(scene, camera);
        }

        // Mouse Controls
        function onMouseDown(e) {
            isDragging = true;
            previousMousePosition.x = e.clientX;
            previousMousePosition.y = e.clientY;
        }

        function onMouseUp(e) {
            isDragging = false;
        }

        function onMouseMove(e) {
            if (!isDragging) return;

            const deltaX = e.clientX - previousMousePosition.x;
            const deltaY = e.clientY - previousMousePosition.y;

            const rotationSpeed = 0.01;

            if (cube) {
                cube.rotation.y += deltaX * rotationSpeed;
                cube.rotation.x += deltaY * rotationSpeed;
            }
            if (model) {
                model.rotation.y += deltaX * rotationSpeed;
                model.rotation.x += deltaY * rotationSpeed;
            }

            previousMousePosition.x = e.clientX;
            previousMousePosition.y = e.clientY;
        }

        canvas.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mouseup', onMouseUp);
        canvas.addEventListener('mousemove', onMouseMove);

        // Handle window resize
        function onWindowResize() {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        }
        window.addEventListener('resize', onWindowResize);

        // Start the animation
        animate();
    }

    // Function to load a GLTF model
    function loadGLBModel(filePath) {
        const loader = new THREE.GLTFLoader();
        loader.load(
            filePath,
            (gltf) => {
                console.log('Model loaded successfully:', gltf);
                if (cube) {
                    scene.remove(cube); // Remove the placeholder cube
                }
                model = gltf.scene;
                scene.add(model);
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            (error) => {
                console.error('An error happened loading the model:', error);
            }
        );
    }

    // Call the setup function when the 3D models page is loaded
    document.getElementById('3d-models').addEventListener('DOMContentLoaded', setup3DScene);

    // Fallback if DOMContentLoaded is not triggered on section
    // Check if the 3D models tab is the initial active tab and set up the scene
    if (window.location.hash.substring(1) === '3d-models') {
        setup3DScene();
    }
});