const API_BASE_URL = "/api";

// --------------------
// Load Jobs
// --------------------

async function loadJobs() {

```
try {

    const response =
        await fetch(`${API_BASE_URL}/jobs`);

    const jobs =
        await response.json();

    const container =
        document.getElementById("jobsList");

    if (!container) return;

    container.innerHTML = "";

    if (jobs.length === 0) {

        container.innerHTML =
            "<p>No jobs available.</p>";

        return;

    }

    jobs.forEach(job => {

        const div =
            document.createElement("div");

        div.className =
            "job-card";

        div.innerHTML = `

            <h3>${job.title}</h3>

            <p>${job.description}</p>

            <p>
                <strong>Qualifications:</strong>
                ${job.qualifications}
            </p>

            <button onclick="applyJob('${job._id}')">
                Apply
            </button>

        `;

        container.appendChild(div);

    });

}

catch (error) {

    console.error(
        "Error loading jobs:",
        error
    );

}
```

}

// --------------------
// Apply Job
// --------------------

async function applyJob(jobId) {

```
try {

    const response =
        await fetch(`${API_BASE_URL}/apply`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                jobId: jobId,
                name: "Test User",
                email: "test@example.com"
            })

        });

    if (response.ok) {

        alert(
            "Application submitted successfully!"
        );

    }

    else {

        alert(
            "Failed to submit application."
        );

    }

}

catch (error) {

    console.error(
        "Error applying:",
        error
    );

}
```

}

// --------------------
// Load Applications
// --------------------

async function loadApplications() {

```
try {

    const response =
        await fetch(`${API_BASE_URL}/applications`);

    const applications =
        await response.json();

    const container =
        document.getElementById(
            "applicationsList"
        );

    if (!container) return;

    container.innerHTML = "";

    if (applications.length === 0) {

        container.innerHTML =
            "<p>No applications yet.</p>";

        return;

    }

    applications.forEach(app => {

        const div =
            document.createElement("div");

        div.className =
            "application-card";

        div.innerHTML = `

            <h3>${app.name}</h3>

            <p>Email: ${app.email}</p>

            <p>Job: ${app.jobTitle}</p>

        `;

        container.appendChild(div);

    });

}

catch (error) {

    console.error(
        "Error loading applications:",
        error
    );

}
```

}

// --------------------
// Auto Load Based on Page
// --------------------

window.onload = function () {

```
if (
    document.getElementById(
        "jobsList"
    )
) {

    loadJobs();

}

if (
    document.getElementById(
        "applicationsList"
    )
) {

    loadApplications();

}
```

};
