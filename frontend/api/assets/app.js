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
            const res = await fetch(`http://localhost:3000${endpoint}`, {
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

// Fetch and display recent talent on landing page
async function fetchRecentTalent() {
    const section = document.getElementById('recent-talent-section');
    const ticker = document.getElementById('talent-ticker');
    if (!section || !ticker) return;

    try {
        let res;
        try {
            res = await fetch('http://localhost:3000/api/auth/candidates');
        } catch (e) {
            res = await fetch('http://127.0.0.1:3000/api/auth/candidates');
        }

        if (!res.ok) throw new Error('Failed to fetch');
        const candidates = await res.json();

        if (candidates.length > 0) {
            section.classList.remove('hidden');
            // Show last 4 candidates
            ticker.innerHTML = candidates.reverse().slice(0, 4).map((c, idx) => `
                <div class="glass-card" style="padding: 1.5rem; width: 220px; transition: 0.3s; border-color: rgba(0, 245, 212, 0.1);">
                    <div style="width: 40px; height: 40px; background: rgba(0, 245, 212, 0.1); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 800; color: var(--accent); margin-bottom: 1rem;">
                        ${c.fullname.charAt(0).toUpperCase()}
                    </div>
                    <div style="font-weight: 800; font-size: 0.9rem;">${c.fullname.split(' ')[0].toUpperCase()}</div>
                    <div style="font-size: 0.7rem; opacity: 0.4; font-family: monospace; margin-top: 0.25rem;">${c.expertise || 'DEVELOPER'}</div>
                    <div class="flex items-center gap-2 mt-4">
                        <div style="width: 6px; height: 6px; background: var(--accent); border-radius: 50%; box-shadow: 0 0 10px var(--accent);"></div>
                        <span style="font-size: 0.6rem; font-weight: 800; letter-spacing: 1px; color: var(--accent);">NEW_INFILTRATION</span>
                    </div>
                </div>
            `).join('');
        }
    } catch (err) {
        console.error('Error fetching recent talent:', err);
    }
}

// --- Learning Aptitude Demo ---
function runAptitudeDemo() {
    const demoUi = document.getElementById('aptitude-demo-ui');
    const demoLogs = document.getElementById('demo-logs');
    const button = document.querySelector('#aptitude-feature-card button');

    if (!demoUi || !demoLogs || !button) return;

    if (demoUi.classList.contains('hidden')) {
        demoUi.classList.remove('hidden');
        button.textContent = 'Reset Engine';

        const logs = [
            "> Analyzing user research patterns...",
            "> Detected: Tab change (Browser: Chrome)",
            "> Duration: 42s (Search session)",
            "> Detected: Implementation burst started",
            "> Efficiency Score: 92% (High Adaptation)",
            "> Copy-Paste Check: 0 external matches",
            "> FINAL SCORE: [94/100] - Exceptional Potential"
        ];

        let i = 0;
        demoLogs.innerHTML = "";
        const interval = setInterval(() => {
            if (i >= logs.length) {
                clearInterval(interval);
                return;
            }
            const logEntry = document.createElement('div');
            logEntry.style.marginBottom = '4px';
            logEntry.textContent = logs[i];
            demoLogs.appendChild(logEntry);
            demoLogs.scrollTop = demoLogs.scrollHeight;
            i++;
        }, 800);
    } else {
        demoUi.classList.add('hidden');
        button.textContent = 'Run Engine Demo';
    }
}

// Global exposure
window.runAptitudeDemo = runAptitudeDemo;
window.checkAuth = checkAuth;
window.linkPage = linkPage;
window.logout = () => {
    localStorage.removeItem("hiredUpUser");
    window.location.href = "index.html";
};

document.addEventListener('DOMContentLoaded', fetchRecentTalent);
