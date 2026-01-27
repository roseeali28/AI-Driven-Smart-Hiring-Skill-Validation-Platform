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

/* --- Auth Logic --- */
let currentMode = 'login';
let currentRole = 'candidate';

function initAuthToggle() {
    const tabs = document.querySelectorAll('.auth-tab');
    const roleSelector = document.getElementById('role-selector-container');
    const signupFields = document.getElementById('signup-fields');
    const submitBtn = document.getElementById('submit-btn');
    const title = document.getElementById('auth-title');
    const desc = document.getElementById('auth-desc');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update UI State
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            currentMode = tab.dataset.target;

            if (currentMode === 'signup') {
                roleSelector.classList.remove('hidden');
                signupFields.classList.remove('hidden');
                submitBtn.textContent = 'Create Account';
                title.textContent = 'Join HireSphere';
                desc.textContent = 'Start your journey to the perfect career.';
            } else {
                roleSelector.classList.add('hidden');
                signupFields.classList.add('hidden');
                submitBtn.textContent = 'Log In';
                title.textContent = 'Welcome Back';
                desc.textContent = 'Enter your credentials to access the platform.';
            }
        });
    });

    // Role Selection
    const roleOptions = document.querySelectorAll('.role-option');
    roleOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            roleOptions.forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            currentRole = opt.dataset.role;
        });
    });
}

function handleAuth(event) {
    event.preventDefault();
    const btn = document.getElementById('submit-btn');
    const originalText = btn.textContent;

    // Simulate API Call
    btn.textContent = 'Processing...';
    btn.style.opacity = '0.7';

    setTimeout(() => {
        // Mock Redirect Logic

        // Use the currentRole if signing up, otherwise we might default to candidate 
        // OR in a real app, the backend tells us the role. 
        // For this mock, we'll assume the user is logging in as what they selected or default.

        // If login mode, let's just default to Candidate for now 
        // unless we want a way to distinguish (e.g. email contains 'admin').

        const email = document.getElementById('email').value;
        let redirect = 'dashboard-candidate.html';

        if (email.includes('admin') || currentRole === 'recruiter') {
            redirect = 'dashboard-recruiter.html';
        }

        // Save state
        localStorage.setItem('userRole', currentRole);
        localStorage.setItem('userEmail', email);

        window.location.href = redirect;
    }, 1500);
}

/* --- Flow Toggle Logic --- */
document.addEventListener('DOMContentLoaded', () => {
    const flowToggles = document.querySelectorAll('.role-toggle');
    const flows = document.querySelectorAll('.flow-display');

    if (flowToggles.length > 0) {
        flowToggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                // Remove active class from all toggles
                flowToggles.forEach(t => {
                    t.classList.remove('active');
                    t.style.background = 'transparent';
                    t.style.color = '#94a3b8'; // muted
                });

                // Add active class to clicked toggle
                toggle.classList.add('active');
                toggle.style.background = 'var(--primary)';
                toggle.style.color = '#fff';

                // Hide all flows
                flows.forEach(f => f.classList.add('hidden'));

                // Show target flow
                const targetId = `flow-${toggle.dataset.flow}`;
                const targetFlow = document.getElementById(targetId);
                if (targetFlow) {
                    targetFlow.classList.remove('hidden');
                    // Reset animations (optional simple hack)
                    targetFlow.style.animation = 'none';
                    targetFlow.offsetHeight; /* trigger reflow */
                    targetFlow.style.animation = null;
                }
            });
        });
    }
});
