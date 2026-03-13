/* 
 * HiredUp - Main Application Logic 
 * Handles Navigation, Auth State Simulation, and Global Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('HiredUp: System Online');
    initScrollEffects();
    initRoleToggle(); // For index.html
    initAuthToggle(); // For auth.html
});

// --- Animation Effects ---
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

// --- Index.html Role Toggle ---
function initRoleToggle() {
    const toggles = document.querySelectorAll('.role-toggle');
    const flowCandidate = document.getElementById('flow-candidate');
    const flowRecruiter = document.getElementById('flow-recruiter');

    if (!toggles.length || !flowCandidate || !flowRecruiter) return;

    toggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            // Remove active class from all
            toggles.forEach(t => {
                t.classList.remove('active');
                t.style.background = 'transparent';
                t.style.color = 'var(--text-muted)';
            });

            // Add active to clicked
            toggle.classList.add('active');
            toggle.style.background = 'var(--primary)';
            toggle.style.color = 'var(--text-main)';

            const flow = toggle.getAttribute('data-flow');
            if (flow === 'candidate') {
                flowCandidate.classList.remove('hidden');
                flowRecruiter.classList.add('hidden');
            } else {
                flowCandidate.classList.add('hidden');
                flowRecruiter.classList.remove('hidden');
            }
        });
    });

    // Initialize state based on active class in HTML
    const activeToggle = document.querySelector('.role-toggle.active');
    if (activeToggle && activeToggle.getAttribute('data-flow') === 'recruiter') {
        flowCandidate.classList.add('hidden');
        flowRecruiter.classList.remove('hidden');
    }
}

// --- Auth.html Login/Signup Toggle ---
function initAuthToggle() {
    const tabs = document.querySelectorAll('.auth-tab');
    const authTitle = document.getElementById('auth-title');
    const authDesc = document.getElementById('auth-desc');
    const submitBtn = document.getElementById('submit-btn');
    const signupFields = document.getElementById('signup-fields');
    const recruiterFields = document.getElementById('recruiter-fields');
    const roleSelector = document.getElementById('role-selector-container');
    const authForm = document.getElementById('auth-form');

    if (!tabs.length) return;

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const target = tab.getAttribute('data-target');
            if (target === 'login') {
                authTitle.textContent = 'Welcome Back';
                authDesc.textContent = 'Enter your credentials to access the platform.';
                submitBtn.textContent = 'Log In';
                signupFields?.classList.add('hidden');
                recruiterFields?.classList.add('hidden');
            } else {
                authTitle.textContent = 'Create Account';
                authDesc.textContent = 'Join the future of hiring today.';
                submitBtn.textContent = 'Sign Up';
                signupFields?.classList.remove('hidden');

                // Show recruiter fields if recruiter is selected
                const selectedRole = document.querySelector(".role-option.selected")?.getAttribute('data-role');
                if (selectedRole === 'recruiter') {
                    recruiterFields?.classList.remove('hidden');
                }
            }
        });
    });

    // Role selection logic
    const roleOptions = document.querySelectorAll('.role-option');
    if (roleOptions.length) {
        roleOptions.forEach(opt => {
            opt.addEventListener('click', () => {
                roleOptions.forEach(r => r.classList.remove('selected'));
                opt.classList.add('selected');

                const role = opt.getAttribute('data-role');
                if (role === 'recruiter' && submitBtn.textContent === 'Sign Up') {
                    recruiterFields?.classList.remove('hidden');
                } else {
                    recruiterFields?.classList.add('hidden');
                }
            });
        });
    }
}


// --- Global UI Helpers ---
function showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
        <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function showLoader() {
    let loader = document.getElementById('global-loader');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'global-loader';
        loader.innerHTML = '<div class="spinner"></div>';
        document.body.appendChild(loader);
    }
    loader.classList.add('active');
}

function hideLoader() {
    const loader = document.getElementById('global-loader');
    if (loader) loader.classList.remove('active');
}

// --- Global Actions ---
function buyPlan(plan) {
    showToast(`Redirecting to payment gateway for ${plan.toUpperCase()} plan...`, 'info');
}

async function handleAuth(event) {
    event.preventDefault();
    console.log("🚀 handleAuth triggered");

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const fullname = document.getElementById("fullname")?.value;
    const companyName = document.getElementById("companyName")?.value;
    const designation = document.getElementById("designation")?.value;
    const submitBtn = document.getElementById("submit-btn");
    const isSignup = submitBtn.textContent === "Sign Up";

    let role = "Candidate";
    const selectedRole = document.querySelector(".role-option.selected");
    if (selectedRole) {
        role = selectedRole.getAttribute('data-role') === 'recruiter' ? 'Recruiter' : 'Candidate';
    }

    if (isSignup && role === 'Recruiter') {
        if (!companyName || !designation) {
            showToast("⚠️ Recruiter details (Company & Designation) are mandatory.", "error");
            return;
        }
    }

    showLoader();

    try {
        const body = isSignup
            ? { fullname, email, password, role, companyName, designation }
            : { email, password };

        if (!window.hiredUpApi) {
            // Fallback to fetch if utility not loaded
            const endpoint = isSignup ? "/api/auth/signup" : "/api/auth/login";
            const res = await fetch(`http://localhost:5000${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            showToast(isSignup ? "Account created successfully!" : "Welcome back!", "success");
            localStorage.setItem("hiredUpUser", JSON.stringify(data.user));
            setTimeout(() => { window.location.href = data.user.role === "Recruiter" ? "profile.html" : "profile.html"; }, 1000);
        } else {
            const endpoint = isSignup ? "/auth/signup" : "/auth/login";
            const data = await window.hiredUpApi.post(endpoint, body);
            showToast(isSignup ? "Account created successfully!" : "Welcome back!", "success");
            localStorage.setItem("hiredUpUser", JSON.stringify(data.user));
            setTimeout(() => { window.location.href = "profile.html"; }, 1000);
        }

    } catch (err) {
        showToast(err.message || "Server error", "error");
    } finally {
        hideLoader();
    }
}

// --- Navigation Guards ---
function checkAuth(target) {
    if (target && target.includes(':5173')) {
        window.location.href = target;
        return;
    }
    const user = JSON.parse(localStorage.getItem('hiredUpUser'));
    if (!user) {
        showToast('Please login to access this feature.', 'error');
        setTimeout(() => { window.location.href = 'auth.html'; }, 1000);
        return;
    }
    if (target) window.location.href = target;
}

function requireRole(role) {
    const user = JSON.parse(localStorage.getItem('hiredUpUser'));
    if (!user) {
        window.location.href = 'auth.html';
        return;
    }
    if (user.role !== role) {
        showToast(`Access Denied: This area is restricted to ${role}s only.`, 'error');
        setTimeout(() => { window.location.href = 'index.html'; }, 1500);
    }
}

// --- Legacy Navigation Helper (Restored) ---
function linkPage(url) {
    const user = JSON.parse(localStorage.getItem('hiredUpUser'));
    if (!user && url !== 'index.html' && url !== 'auth.html') {
        showToast('Please login to access this section.', 'error');
        setTimeout(() => { window.location.href = 'auth.html'; }, 1000);
        return;
    }
    window.location.href = url;
}

// Global exposure
window.checkAuth = checkAuth;
window.linkPage = linkPage;
window.logout = () => {
    localStorage.removeItem("hiredUpUser");
    window.location.href = "index.html";
};
