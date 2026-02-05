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
}

// --- Auth.html Login/Signup Toggle ---
function initAuthToggle() {
    const tabs = document.querySelectorAll('.auth-tab');
    const authTitle = document.getElementById('auth-title');
    const authDesc = document.getElementById('auth-desc');
    const submitBtn = document.getElementById('submit-btn');
    const signupFields = document.getElementById('signup-fields');
    const roleSelector = document.getElementById('role-selector-container');
    const authForm = document.getElementById('auth-form');

    if (!tabs.length) return;

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // UI Toggle
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const target = tab.getAttribute('data-target');
            if (target === 'login') {
                authTitle.textContent = 'Welcome Back';
                authDesc.textContent = 'Enter your credentials to access the platform.';
                submitBtn.textContent = 'Log In';
                signupFields.classList.add('hidden');
                roleSelector.classList.add('hidden');
            } else {
                authTitle.textContent = 'Create Account';
                authDesc.textContent = 'Join the future of hiring today.';
                submitBtn.textContent = 'Sign Up';
                signupFields.classList.remove('hidden');
                roleSelector.classList.remove('hidden');
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
            });
        });
    }
}


// --- Global Actions ---
function buyPlan(plan) {
    alert(`Redirecting to payment gateway for ${plan.toUpperCase()} plan...`);
    // Logic to redirect or open modal would go here
}

async function handleAuth(event) {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const fullname = document.getElementById("fullname")?.value;
  const submitBtn = document.getElementById("submit-btn");
  const isSignup = submitBtn.textContent === "Sign Up";

  let role = "Candidate";
  const selectedRole = document.querySelector(".role-option.selected");
  if (selectedRole) {
    role = selectedRole.querySelector("div:last-child").textContent;
  }

  const url = isSignup
    ? "http://localhost:5000/api/auth/signup"
    : "http://localhost:5000/api/auth/login";

  const body = isSignup
    ? { fullname, email, password, role }
    : { email, password };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

    localStorage.setItem("hiredUpUser", JSON.stringify(data.user));
    window.location.href = "profile.html";

  } catch (err) {
    alert("Server error");
  }
}
