document.addEventListener('DOMContentLoaded', () => {
    const folderButton = document.getElementById('folderButton');
    const introScreen = document.getElementById('introScreen');
    const mainPage = document.getElementById('mainPage');
    const fadeOverlay = document.getElementById('fadeOverlay');
    const pageTabs = document.querySelectorAll('.page-tab');
    const stickers = document.querySelectorAll('.sticker');
    const scatteredAssets = document.querySelectorAll('.scattered-asset');

    let isTransitioning = false; // Flag for page flipping
    let modelSceneInitialized = false; // NEW FLAG: Prevents 3D scene from initializing immediately

    // Function to generate confetti (YOUR ORIGINAL CODE)
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

    // Event listener for the intro button click (YOUR ORIGINAL CODE)
    folderButton.addEventListener('click', () => {
        folderButton.classList.add('scattered');

        // Populate scattered assets and run animation
        fetch("static/img/scatter_folder.svg")
            .then(r => r.text())
            .then(svg => {
                scatteredAssets.forEach(asset => {
                    const randomX = (Math.random() - 0.5) * 500;
                    const randomY = (Math.random() - 0.5) * 500;
                    const randomR = Math.random() * 360;
                    asset.style.setProperty('--x', `${randomX}px`);
                    asset.style.setProperty('--y', `${randomY}px`);
                    asset.style.setProperty('--r', `${randomR}deg`);
                    asset.style.animationDelay = `${Math.random() * 0.5}s`;

                    const color = `hsl(${Math.floor(Math.random() * 360)},70%,50%)`;
                    const colored = svg.replace(/fill="[^"]*"/g, `fill="${color}"`);
                    asset.src = "data:image/svg+xml;base64," + btoa(colored);
                });
            });

        createConfetti();

        setTimeout(() => { fadeOverlay.classList.add('visible'); }, 500);

        setTimeout(() => {
            introScreen.style.display = 'none';
            mainPage.style.display = 'block';
            mainPage.classList.add('active');
            fadeOverlay.classList.remove('visible');

            // REMOVED: setup3DScene() call here. It will run on the first tab click.
        }, 2000);
    });

    // --- Page Flip Navigation Logic (FIXED) ---
    pageTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            if (isTransitioning) return;
            isTransitioning = true;

            const targetId = tab.getAttribute('data-target');
            const targetPage = document.getElementById(targetId);
            const activePage = document.querySelector('.folder-page.active');
            const activeTab = document.querySelector('.page-tab.active');

            if (targetPage && !targetPage.classList.contains('active')) {
                // 1. Deactivate old page (triggers flip-out)
                if (activePage) {
                    activePage.classList.remove('active');
                }

                // 2. Deactivate old tab and activate new tab
                if (activeTab) {
                    activeTab.classList.remove('active');
                }
                tab.classList.add('active');

                // 3. Set new page to active (triggers flip-in)
                setTimeout(() => {
                    targetPage.classList.add('active');

                    // NEW CHECK: Initialize 3D scene if we switch to the 'models' tab for the first time
                    if (targetId === 'models' && !modelSceneInitialized) {
                        setup3DScene();
                        modelSceneInitialized = true;
                    }

                    // Re-enable clicks after the transition duration (0.8s from CSS)
                    setTimeout(() => {
                        isTransitioning = false;
                    }, 800);
                }, 100);
            } else {
                isTransitioning = false;
            }
        });
    });

    // Event listeners for the interactive stickers (YOUR ORIGINAL CODE)
    stickers.forEach(sticker => {
        sticker.addEventListener('click', () => {
            sticker.classList.add('popped');
            setTimeout(() => {
                sticker.classList.remove('popped');
            }, 300);
        });
    });

    // --- Content Interaction Logic (From NEW Code) ---
    document.addEventListener('click', function(e) {
        if (e.target.closest('.document-card')) {
            const card = e.target.closest('.document-card');
            const itemName = card.querySelector('strong').textContent.trim();
            alert(`Opening project details for: ${itemName}`);
        }
    });


    // --- 3D Model Viewer Logic (Deferred) ---
    let camera, scene, renderer, cube, model;
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    function setup3DScene() {
        const canvas = document.getElementById('model-canvas');
        if (!canvas) return; // Exit if canvas is not found
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

        // Placeholder cube (will be removed if model loads)
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({ color: 0xef4444 });
        cube = new THREE.Mesh(geometry, material);

        // Load the GLB model (replace 'your_model.glb' with the actual path to your 3D model)
        loadGLBModel('static/img/your_model.glb');

        // Animation loop
        function animate() {
            requestAnimationFrame(animate);
            if (model) {
                // Continuous subtle rotation
                model.rotation.y += 0.005;
            } else if (cube) {
                // Keep the cube rotating until the model is loaded
                cube.rotation.y += 0.005;
            }
            renderer.render(scene, camera);
        }

        // Mouse Controls for manual rotation
        function onMouseDown(e) {
            isDragging = true;
            previousMousePosition.x = e.clientX;
            previousMousePosition.y = e.clientY;
        }

        function onMouseUp(e) { isDragging = false; }

        function onMouseMove(e) {
            if (!isDragging) return;
            const deltaX = e.clientX - previousMousePosition.x;
            const deltaY = e.clientY - previousMousePosition.y;

            const rotationSpeed = 0.01;

            if (model) {
                model.rotation.y += deltaX * rotationSpeed;
                model.rotation.x += deltaY * rotationSpeed;
            } else if (cube) {
                cube.rotation.y += deltaX * rotationSpeed;
                cube.rotation.x += deltaY * rotationSpeed;
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
                // Remove the placeholder cube if it exists
                if (cube && scene) {
                    scene.remove(cube);
                }
                model = gltf.scene;
                scene.add(model);
                console.log('3D Model loaded successfully.');
            },
            (xhr) => {
                // Progress callback
                console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
            },
            (error) => {
                console.error('An error occurred loading the 3D model:', error);
                // Fallback: Add the placeholder cube if the model fails to load
                if (scene && cube) {
                    scene.add(cube);
                }
            }
        );
    }
});