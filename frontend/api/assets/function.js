/* 
 * HireSphere - Main Application Logic 
 * Handles Navigation, Auth State Simulation, and Global Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('HireSphere: System Online');
    initScrollEffects();
});

function initScrollEffects() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-fade-in').forEach(el => {
        observer.observe(el);
    });
}
