/* 
 * HiredUp - Main Application Logic 
 * Handles Navigation, Auth State Simulation, and Global Interactions
 */

// Apply saved theme IMMEDIATELY to prevent flash of wrong colours
(function() {
    const t = localStorage.getItem('hiredUpTheme') || 'dark';
    document.documentElement.setAttribute('data-theme', t);
})();

document.addEventListener('DOMContentLoaded', () => {
    console.log('HiredUp: System Online');
    initScrollEffects();
    initRoleToggle(); // For index.html
    initAuthToggle(); // For auth.html
    initThemeToggle(); // Global Theme Switcher
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

    if (!tabs.length) return;

    // Default state: login tab is active — hide role selector and signup fields
    roleSelector?.classList.add('hidden');
    signupFields?.classList.add('hidden');
    recruiterFields?.classList.add('hidden');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const target = tab.getAttribute('data-target');
            if (target === 'login') {
                authTitle.textContent = 'Welcome Back';
                authDesc.textContent = 'Enter your credentials to access the platform.';
                submitBtn.textContent = 'Log In';
                roleSelector?.classList.add('hidden');
                signupFields?.classList.add('hidden');
                recruiterFields?.classList.add('hidden');
            } else {
                authTitle.textContent = 'Create Account';
                authDesc.textContent = 'Join the future of hiring today.';
                submitBtn.textContent = 'Sign Up';
                roleSelector?.classList.remove('hidden');
                signupFields?.classList.remove('hidden');

                // Show recruiter fields only if recruiter is selected
                const selectedRole = document.querySelector('.role-option.selected')?.getAttribute('data-role');
                if (selectedRole === 'recruiter') {
                    recruiterFields?.classList.remove('hidden');
                } else {
                    recruiterFields?.classList.add('hidden');
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
                if (role === 'recruiter' && submitBtn?.textContent === 'Sign Up') {
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

    // Backend expects UPPERCASE roles: RECRUITER / CANDIDATE
    let role = "CANDIDATE";
    const selectedRole = document.querySelector(".role-option.selected");
    if (selectedRole) {
        role = selectedRole.getAttribute('data-role') === 'recruiter' ? 'RECRUITER' : 'CANDIDATE';
    }

    if (isSignup && role === 'RECRUITER') {
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

        const endpoint = isSignup ? "/auth/register" : "/auth/login";
        const res = await fetch(`http://localhost:5000/api${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || data.message || "Auth Failed");

        showToast(isSignup ? "Account created successfully!" : "Welcome back!", "success");
        
        // Persist session
        localStorage.setItem("hiredUpUser", JSON.stringify(data.user));
        if (data.accessToken)  localStorage.setItem("hiredUpToken", data.accessToken);
        if (data.refreshToken) localStorage.setItem("hiredUpRefreshToken", data.refreshToken);
        localStorage.setItem("userSkills", JSON.stringify(data.user.skills || []));

        // Role-based redirection (Case-insensitive)
        const userRole = String(data.user.role).toUpperCase();
        const redirectUrl = (userRole === "RECRUITER") ? "recruiter.html" : "profile.html";
        
        setTimeout(() => { window.location.href = redirectUrl; }, 1000);

    } catch (err) {
        showToast(err.message || "Server connection failed", "error");
    } finally {
        hideLoader();
    }
}

// --- Navigation Guards ---
function checkAuth(target) {
    if (target && target.includes(':5173')) {
        const token = localStorage.getItem('hiredUpToken');
        const separator = target.includes('?') ? '&' : '?';
        window.location.href = token ? `${target}${separator}token=${token}` : target;
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
            res = await fetch('http://localhost:5000/api/auth/candidates');
        } catch (e) {
            res = await fetch('http://localhost:5000/api/auth/candidates');
        }

        if (!res.ok) throw new Error('Failed to fetch');
        const candidates = await res.json();

        if (candidates.length > 0) {
            section.classList.remove('hidden');
            // Show last 4 candidates with diverse expertise
            ticker.innerHTML = candidates.reverse().slice(0, 4).map((c, idx) => {
                const expertise = (c.expertise || 'Full Stack, AI, Dev').split(',')[0].toUpperCase();
                const color = idx % 2 === 0 ? 'var(--accent)' : '#a855f7';
                return `
                <div class="glass-card" style="padding: 1.5rem; width: 220px; transition: 0.3s; border-color: ${color}33;">
                    <div style="width: 40px; height: 40px; background: ${color}1a; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 800; color: ${color}; margin-bottom: 1rem;">
                        ${c.fullname.charAt(0).toUpperCase()}
                    </div>
                    <div style="font-weight: 800; font-size: 0.9rem; color: var(--text-main);">${c.fullname.split(' ')[0].toUpperCase()}</div>
                    <div style="font-size: 0.65rem; opacity: 0.5; font-family: 'JetBrains Mono', monospace; margin-top: 0.25rem; color: ${color};">${expertise}</div>
                    <div class="flex items-center gap-2 mt-4">
                        <div style="width: 6px; height: 6px; background: ${color}; border-radius: 50%; box-shadow: 0 0 10px ${color};"></div>
                        <span style="font-size: 0.6rem; font-weight: 800; letter-spacing: 1px; color: ${color}; opacity: 0.8;">VERIFIED_TALENT</span>
                    </div>
                </div>
                `;
            }).join('');
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
    localStorage.removeItem("hiredUpToken");
    localStorage.removeItem("hiredUpRefreshToken");
    localStorage.removeItem("userSkills");
    window.location.href = "index.html";
};

// --- Theme Toggle ---
function initThemeToggle() {
    const savedTheme = localStorage.getItem('hiredUpTheme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    const btn = document.createElement('button');
    btn.className = 'theme-toggle-btn';
    btn.innerHTML = savedTheme === 'light' ? '🌙' : '☀️';
    btn.title = 'Toggle Theme (Dark/Light)';
    document.body.appendChild(btn);

    const updateThemeIcon = (theme) => {
        btn.innerHTML = theme === 'light' ? '🌙' : '☀️';
    };

    btn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('hiredUpTheme', newTheme);
        updateThemeIcon(newTheme);
        
        // Sync with navbar toggles if they exist
        const navBtns = document.querySelectorAll('#nav-theme-toggle');
        navBtns.forEach(nb => nb.innerHTML = newTheme === 'light' ? '🌙' : '☀️');
    });

    // Handle external sync (like from navbar)
    window.addEventListener('storage', (e) => {
        if (e.key === 'hiredUpTheme') {
            updateThemeIcon(e.newValue);
        }
    });
}

// --- Fullscreen Toggle ---
function initFullscreenToggle() {
    const btn = document.createElement('button');
    btn.className = 'fullscreen-toggle-btn';
    btn.innerHTML = '🔲';
    btn.title = 'Toggle Fullscreen';
    document.body.appendChild(btn);

    const updateIcon = () => {
        if (document.fullscreenElement) {
            btn.innerHTML = '内'; // Exit icon
            btn.title = 'Exit Fullscreen';
        } else {
            btn.innerHTML = '🔲'; // Enter icon
            btn.title = 'Enter Fullscreen';
        }
    };

    btn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                showToast(`Error attempting to enable fullscreen: ${err.message}`, 'error');
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    });

    document.addEventListener('fullscreenchange', updateIcon);
}

// Call toggle initializations directly (after DOM is ready)
document.addEventListener('DOMContentLoaded', () => {
    initFullscreenToggle();
});

document.addEventListener('DOMContentLoaded', fetchRecentTalent);
