document.addEventListener("DOMContentLoaded", function() {
    const spriteContainer = document.getElementById('sprite-container');
    const spriteImage = document.getElementById('sprite-image');

    if (!spriteContainer || !spriteImage) {
        console.error("Error: Could not find sprite-container or sprite-image. Check your HTML IDs.");
        return;
    }

// Paths to your animated GIFs
const animations = {
    idle: "/static/sprites/thegreat2.PNG",
    walk: "/static/sprites/thegreat2.PNG",
    jump: "/static/sprites/thegreat2.PNG"
};
    // State variables
    let currentPosition = 0;
    let direction = 1; // 1 for right, -1 for left
    const speed = 1;
    const maxJumpHeight = 80; // How high the sprite jumps (in pixels)
    let isMoving = true;
    let isJumping = false;

    // Set initial animation
    spriteImage.src = animations.walk;

    // --- Core Movement Loop ---
    function animateMovement() {
        const containerWidth = window.innerWidth;
        const spriteWidth = spriteContainer.offsetWidth;
        const maxPosition = containerWidth - spriteWidth;

        if (isJumping) {
            return; // Don't move horizontally while jumping
        }

        currentPosition += speed * direction;

        if (currentPosition >= maxPosition) {
            direction = -1;
            spriteImage.style.transform = 'scaleX(-1)';
            spriteImage.src = animations.walk;
        } else if (currentPosition <= 0) {
            direction = 1;
            spriteImage.style.transform = 'scaleX(1)';
            spriteImage.src = animations.walk;
        }

        spriteContainer.style.left = `${currentPosition}px`;
    }

    // This interval controls the horizontal walking animation
    setInterval(animateMovement, 10);

    // --- Interaction: Jump on Click ---
    spriteContainer.addEventListener('click', function(event) {
        if (isJumping) {
            return;
        }
        isJumping = true;
        spriteImage.src = animations.jump; // Switch to jump GIF

        // Jump up
        spriteContainer.style.transition = 'bottom 0.3s ease-out';
        spriteContainer.style.bottom = `${maxJumpHeight}px`;

        // Come back down after a delay
        setTimeout(() => {
            spriteContainer.style.transition = 'bottom 0.4s ease-in';
            spriteContainer.style.bottom = '0px';

            // Reset after the jump is complete
            setTimeout(() => {
                isJumping = false;
                spriteImage.src = animations.walk; // Switch back to walking
            }, 400); // This delay should match the `bottom` transition time
        }, 300); // This delay controls how long it stays at the top of the jump
    });

    // --- Interaction: Climb text on double-click ---
    spriteContainer.addEventListener('dblclick', function(event) {
        // Find the nearest text element
        const elements = document.querySelectorAll('h1, h2, h3, p, a, li');
        let closestElement = null;
        let minDistance = Infinity;

        const spriteRect = spriteContainer.getBoundingClientRect();

        elements.forEach(el => {
            const elRect = el.getBoundingClientRect();
            const distance = Math.abs(elRect.left - spriteRect.left);

            if (distance < minDistance) {
                minDistance = distance;
                closestElement = el;
            }
        });

        if (closestElement) {
            const elRect = closestElement.getBoundingClientRect();
            const targetLeft = elRect.left;
            const targetBottom = window.innerHeight - elRect.bottom + 10; // +10 to sit just above the text

            // "Climb" animation by smoothly moving to the target
            spriteContainer.style.transition = 'left 1s ease-in-out, bottom 1s ease-in-out';
            spriteContainer.style.left = `${targetLeft}px`;
            spriteContainer.style.bottom = `${targetBottom}px`;

            // Stop walking and use the idle animation when on the text
            spriteImage.src = animations.idle;
            isMoving = false;

            // After a few seconds, drop back to the bottom
            setTimeout(() => {
                spriteContainer.style.transition = 'bottom 1s ease-in-out';
                spriteContainer.style.bottom = '0px';
                isMoving = true;
                spriteImage.src = animations.walk;
            }, 5000);
        }
    });

    // Reset transition after climbing to prevent it from affecting the jump
    spriteContainer.addEventListener('transitionend', function() {
        spriteContainer.style.transition = 'none';
    });

});