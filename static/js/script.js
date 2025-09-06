document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for navigation links
    document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Example of a simple dynamic content or animation (can be expanded)
    const heroSection = document.getElementById('hero');
    if (heroSection) {
        heroSection.style.opacity = 0;
        let opacity = 0;
        let fadeInInterval = setInterval(() => {
            if (opacity < 1) {
                opacity += 0.05;
                heroSection.style.opacity = opacity;
            } else {
                clearInterval(fadeInInterval);
            }
        }, 50);
    }

    // You can add more JavaScript here, e.g., for form validation,
    // dynamic project loading (if using an API),
    // interactive elements, etc.
});