let currentUser = null;

function getUsers() {
    return JSON.parse(localStorage.getItem("users")) || {};
}

function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}

function showLoginPopup() {
    document.getElementById('registerOverlay').style.display = 'none';
    document.getElementById('loginOverlay').style.display = 'flex';
}

function showPasswordResetPopup() {
  document.getElementById('passwordReseOverlay').style.display = 'flex';
  document.getElementById('emailInputState').style.display = 'block';
  document.getElementById('successState').style.display = 'none';
  document.getElementById('resetEmail').value = '';
  document.getElementById('emailError').style.display = 'none';
}

function hideResetPopup() {
  document.getElementById('passwordReseOverlay').style.display = 'none';
}

function startPasswordReset() {
  const email = document.getElementById('resetEmail').value;
  const errorElement = document.getElementById('emailError');
  
  if (!email || !email.includes('@') || !email.includes('.')) {
      errorElement.style.display = 'block';
      return;
  }
  
  errorElement.style.display = 'none';
  
  document.getElementById('emailInputState').style.display = 'none';
  document.getElementById('successState').style.display = 'block';
  document.getElementById('confirmedEmail').textContent = email;
  
  console.log('Password reset requested for:', email);
}

function showRegisterPopup() {
    document.getElementById('loginOverlay').style.display = 'none';
    document.getElementById('registerOverlay').style.display = 'flex';
}

function hidePopups() {
    document.getElementById('loginOverlay').style.display = 'none';
    document.getElementById('registerOverlay').style.display = 'none';
}

function updateRegistrationFields() {
    const role = document.getElementById('newRole').value;
    const dynamicFields = document.getElementById('dynamicFields');
    dynamicFields.innerHTML = ''; // Clear previous fields

    if (role === "Teacher" || role === "Parent" || role === "Admin") {
        dynamicFields.innerHTML = `
            <input type="email" id="newEmail" placeholder="Enter Email">
            <input type="tel" id="newPhone" placeholder="Enter Phone Number">
        `;
    } else if (role === "Student") {
        dynamicFields.innerHTML = `
            <input type="text" id="newAdmissionNumber" placeholder="Enter Admission Number">
            <input type="date" id="newDOB" placeholder="Enter Date of Birth">
        `;
    }
}

function register() {
    const newUsername = document.getElementById('newUsername').value.trim();
    const newPassword = document.getElementById('newPassword').value;
    const newRole = document.getElementById('newRole').value;

    if (!newUsername || !newPassword || !newRole) {
        alert("Please fill in all required fields.");
        return;
    }

    let userData = {
        role: newRole,
        password: newPassword,
        username: newUsername,
        fullName: newUsername,
        joinDate: new Date().toISOString()
    };

    if (newRole === "Teacher" || newRole === "Parent" || newRole === "Admin") {
        const email = document.getElementById('newEmail').value.trim();
        const phone = document.getElementById('newPhone').value.trim();
        
        if (!email || !phone) {
            alert("Please fill in all fields for your role.");
            return;
        }
        
        userData.email = email;
        userData.phone = phone;
    } 
    else if (newRole === "Student") {
        const admissionNumber = document.getElementById('newAdmissionNumber').value.trim();
        const dob = document.getElementById('newDOB').value;
        
        if (!admissionNumber || !dob) {
            alert("Please fill in all fields for your role.");
            return;
        }
        
        userData.admissionNumber = admissionNumber;
        userData.DOB = dob;
    }

    let users = getUsers();
    if (users[newUsername]) {
        alert("Username already exists!");
        return;
    }

    users[newUsername] = userData;
    saveUsers(users);
    
    alert("Registration successful! Please login.");
    hidePopups();
    showLoginPopup();
}

function toggleAuthButtons() {
    const loginBtn = document.getElementById("loginBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const sidebar = document.getElementById("sidebar");
    const hero = document.getElementById("hero");
    const homeLink = document.getElementById("homeLink");
    const aboutLink = document.getElementById("aboutLink");
    const analyticsLink = document.getElementById("analyticsLink");
    const contactLink = document.getElementById("contactLink");
    const contentArea = document.querySelector(".content-area");
    const headerControls = document.querySelector(".header-controls");

    currentUser = JSON.parse(localStorage.getItem("user"));

    if (currentUser) {
        loginBtn.style.display = "none";
        logoutBtn.style.display = "inline-block";
        sidebar.style.display = "flex";
        hero.style.display = "none";
        homeLink.style.display = "none";
        aboutLink.style.display = "none";
        analyticsLink.style.display = "none";
        contactLink.style.display = "none";
        contentArea.style.display = "block";
        if (headerControls) headerControls.style.display = "flex";
    } else {
        loginBtn.style.display = "inline-block";
        logoutBtn.style.display = "none";
        sidebar.style.display = "none";
        hero.style.display = "block";
        homeLink.style.display = "block";
        aboutLink.style.display = "block";
        analyticsLink.style.display = "block";
        contactLink.style.display = "block";
        contentArea.style.display = "block";
        if (headerControls) headerControls.style.display = "none";
    }
}

function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    const users = getUsers();

    if (users[username] && users[username].password === password && users[username].role === role) {
        currentUser = {
            name: username,
            role: role,
            email: users[username].email || `${username.toLowerCase()}@example.com`,
            fullName: users[username].fullName || username
        };
        localStorage.setItem("user", JSON.stringify(currentUser));
        alert("Login successful!");
        hidePopups();
        toggleAuthButtons();
        setupDashboard();
        location.reload();
    } else {
        alert("Invalid credentials! Please check your username, password, or role.");
    }
}

function logout() {
    localStorage.removeItem("user");
    currentUser = null;
    alert("Logged out successfully 🖐");
    toggleAuthButtons();
    location.reload();
}

function setupDashboard() {
    if (!currentUser) return;

   
    document.getElementById('sidebarUsername').textContent = currentUser.name;
    document.getElementById('sidebarRole').textContent = currentUser.role;

    document.getElementById('profileName').textContent = currentUser.name;
    document.getElementById('profileRole').textContent = currentUser.role;
    document.getElementById('profileEmail').textContent = currentUser.email || `${currentUser.name.toLowerCase()}@example.com`;
    document.getElementById('profileFullName').textContent = currentUser.fullName || currentUser.name;

    toggleRoleSpecificElements();

    loadDashboardContent();

    initializeCharts();
}

function toggleRoleSpecificElements() {
    const allRoleElements = document.querySelectorAll('.student-only, .teacher-only, .parent-only, .admin-only');
    allRoleElements.forEach(elem => elem.style.display = 'none');

    if (currentUser) {
        const roleClass = `${currentUser.role.toLowerCase()}-only`;
        const roleElements = document.querySelectorAll(`.${roleClass}`);
        roleElements.forEach(elem => elem.style.display = 'block');
    }
}

function loadDashboardContent() {
    let dashboardContent = "";

    if (currentUser.role === "Teacher") {
        dashboardContent = `
            <h2>Teacher Dashboard</h2>
            <section class="cards">
                <div class="card">
                    <h3>Total Students</h3>
                    <strong>120</strong>
                </div>
                <div class="card">
                    <h3>Average Score</h3>
                    <strong>82%</strong>
                </div>
                <div class="card">
                    <h3>Classes</h3>
                    <strong>5</strong>
                </div>
                <div class="card">
                    <h3>Subjects</h3>
                    <strong>3</strong>
                </div>
            </section>
            <section class="chart-container">
                <h3>Class Performance Overview</h3>
                <canvas id="performanceChart"></canvas>
            </section>
            <section class="recent-activities">
                <h3>Recent Activities</h3>
                <div class="activity-list">
                    <div class="activity-item">
                        <div class="activity-icon"><i class="fas fa-file-alt"></i></div>
                        <div class="activity-content">
                            <h4>Science Project Submitted</h4>
                            <p>Alice Johnson submitted the Science project</p>
                            <span class="activity-time">2 hours ago</span>
                        </div>
                    </div>
                    <div class="activity-item">
                        <div class="activity-icon"><i class="fas fa-check-circle"></i></div>
                        <div class="activity-content">
                            <h4>Math Test Graded</h4>
                            <p>You graded Math test for Class 10A</p>
                            <span class="activity-time">Yesterday</span>
                        </div>
                    </div>
                </div>
            </section>`;
    } else if (currentUser.role === "Student") {
        dashboardContent = `
            <h2>Student Dashboard</h2>
            <section class="cards">
                <div class="card">
                    <h3>Current Grade</h3>
                    <strong>A-</strong>
                </div>
                <div class="card">
                    <h3>Attendance</h3>
                    <strong>95%</strong>
                </div>
                <div class="card">
                    <h3>Assignments</h3>
                    <strong>4</strong>
                    <p>2 pending</p>
                </div>
                <div class="card">
                    <h3>Next Exam</h3>
                    <strong>May 20</strong>
                    <p>Mathematics</p>
                </div>
            </section>
            <section class="upcoming-deadlines">
                <h3>UPCOMING DEADLINES</h3>
                <div class="timeline">
                    <div class="timeline-item">
                        <div class="timeline-date">May 15</div>
                        <div class="timeline-content">
                            <h4>Mathematics Assignment</h4>
                            <p>Complete exercises on quadratic equations</p>
                        </div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-date">May 18</div>
                        <div class="timeline-content">
                            <h4>History Report</h4>
                            <p>Submit research paper on World War II</p>
                        </div>
                    </div>
                </div>
            </section>
            <section class="chart-container">
                <h3>Performance by Subject</h3>
                <canvas id="subjectPerformanceChart"></canvas>
            </section>`;
    } else if (currentUser.role === "Parent") {
        dashboardContent = `
            <h2 class=dash>Parent Dashboard</h2>
            <section class="cards">
                <div class="card">
                    <h3>Child's Name</h3>
                    <strong>John Doe</strong>
                </div>
                <div class="card">
                    <h3>Current Grade</h3>
                    <strong>A-</strong>
                </div>
                <div class="card">
                    <h3>Attendance</h3>
                    <strong>95%</strong>
                </div>
                <div class="card">
                    <h3>Next PTA Meeting</h3>
                    <strong>May 15</strong>
                </div>
            </section>
            <section class="chart-container">
                <h3>Academic Progress</h3>
                <canvas id="progressChart"></canvas>
            </section>
            <section class="recent-updates">
                <h3>Recent Updates</h3>
                <div class="updates-list">
                    <div class="update-item">
                        <div class="update-icon"><i class="fas fa-trophy"></i></div>
                        <div class="update-content">
                            <h4>Science Competition</h4>
                            <p>John won second place in the science competition</p>
                            <span class="update-time">3 days ago</span>
                        </div>
                    </div>
                    <div class="update-item">
                        <div class="update-icon"><i class="fas fa-chart-line"></i></div>
                        <div class="update-content">
                            <h4>Math Test Result</h4>
                            <p>John scored 92% in the recent Math test</p>
                            <span class="update-time">1 week ago</span>
                        </div>
                    </div>
                </div>
            </section>`;
    } else if (currentUser.role === "Admin") {
        dashboardContent = `
            <h2>Admin Dashboard</h2>
            <section class="cards">
                <div class="card">
                    <h3>Total Users</h3>
                    <strong>350</strong>
                </div>
                <div class="card">
                    <h3>Teachers</h3>
                    <strong>25</strong>
                </div>
                <div class="card">
                    <h3>Students</h3>
                    <strong>250</strong>
                </div>
                <div class="card">
                    <h3>Parents</h3>
                    <strong>75</strong>
                </div>
            </section>
            <section class="chart-container">
                <h3>System Usage</h3>
                <canvas id="usageChart"></canvas>
            </section>
            <section class="system-status">
                <h3>System Status</h3>
                <div class="status-grid">
                    <div class="status-card">
                        <div class="status-icon healthy"><i class="fas fa-server"></i></div>
                        <div class="status-info">
                            <h4>Server Status</h4>
                            <p>Healthy</p>
                        </div>
                    </div>
                    <div class="status-card">
                        <div class="status-icon healthy"><i class="fas fa-database"></i></div>
                        <div class="status-info">
                            <h4>Database</h4>
                            <p>Operational</p>
                        </div>
                    </div>
                    <div class="status-card">
                        <div class="status-icon warning"><i class="fas fa-memory"></i></div>
                        <div class="status-info">
                            <h4>Memory Usage</h4>
                            <p>78% (Warning)</p>
                        </div>
                    </div>
                    <div class="status-card">
                        <div class="status-icon healthy"><i class="fas fa-shield-alt"></i></div>
                        <div class="status-info">
                            <h4>Security</h4>
                            <p>No Threats</p>
                        </div>
                    </div>
                </div>
            </section>`;
    }

    document.getElementById("dashboard").innerHTML = dashboardContent;
}

function initializeCharts() {
    if (!currentUser) return;

    const chartConfigs = {
        "Teacher": [
            {
                id: 'performanceChart',
                type: 'bar',
                data: {
                    labels: ['Math', 'Science', 'English', 'History', 'ICT', 'PE'],
                    datasets: [{
                        label: 'Class Average (%)',
                        data: [85, 78, 92, 75, 88, 80],
                        backgroundColor: '#4CAF50'
                    }]
                },
                options: {
                    responsive: true,
                    scales: { y: { beginAtZero: true, max: 100 } }
                }
            },
            {
                id: 'classPerformanceChart',
                type: 'pie',
                data: {
                    labels: ['A', 'B', 'C', 'D', 'F'],
                    datasets: [{
                        data: [30, 40, 20, 8, 2],
                        backgroundColor: ['#4CAF50', '#8BC34A', '#FFC107', '#FF9800', '#F44336']
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: 'right' },
                        title: { display: true, text: 'Grade Distribution' }
                    }
                }
            }
        ],
        "Student": [
            {
                id: 'subjectPerformanceChart',
                type: 'radar',
                data: {
                    labels: ['Math', 'Science', 'English', 'History', 'ICT', 'PE'],
                    datasets: [
                        {
                            label: 'Your Score',
                            data: [85, 90, 75, 80, 95, 85],
                            backgroundColor: 'rgba(76, 175, 80, 0.2)',
                            borderColor: '#4CAF50',
                            pointBackgroundColor: '#4CAF50'
                        },
                        {
                            label: 'Class Average',
                            data: [75, 82, 70, 65, 80, 75],
                            backgroundColor: 'rgba(33, 150, 243, 0.2)',
                            borderColor: '#2196F3',
                            pointBackgroundColor: '#2196F3'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    scales: { r: { min: 0, max: 100 } }
                }
            },
            {
                id: 'gradesChart',
                type: 'line',
                data: {
                    labels: ['Term 1', 'Mid-Term', 'Term 2', 'Final'],
                    datasets: [
                        {
                            label: 'Mathematics',
                            data: [78, 82, 85, 88],
                            borderColor: '#4CAF50',
                            tension: 0.1
                        },
                        {
                            label: 'Science',
                            data: [85, 90, 92, 94],
                            borderColor: '#2196F3',
                            tension: 0.1
                        },
                        {
                            label: 'English',
                            data: [70, 75, 78, 84],
                            borderColor: '#9C27B0',
                            tension: 0.1
                        },
                        {
                            label: 'History',
                            data: [65, 70, 72, 75],
                            borderColor: '#FF9800',
                            tension: 0.1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    scales: { y: { beginAtZero: true, max: 100 } }
                }
            }
        ],
        "Parent": [
            {
                id: 'progressChart',
                type: 'line',
                data: {
                    labels: ['Term 1', 'Mid-Term', 'Term 2', 'Final'],
                    datasets: [{
                        label: 'Overall Performance (%)',
                        data: [75, 80, 83, 85],
                        backgroundColor: 'rgba(76, 175, 80, 0.2)',
                        borderColor: '#4CAF50',
                        tension: 0.1,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    scales: { y: { beginAtZero: true, max: 100 } }
                }
            },
            {
                id: 'childPerformanceChart1',
                type: 'doughnut',
                data: {
                    labels: ['Math', 'Science', 'English', 'Others'],
                    datasets: [{
                        data: [85, 92, 78, 82],
                        backgroundColor: ['#4CAF50', '#2196F3', '#9C27B0', '#FF9800']
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { position: 'bottom' } }
                }
            }
        ],
        "Admin": [
            {
                id: 'usageChart',
                type: 'bar',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Active Users',
                        data: [250, 270, 310, 340, 350, 330],
                        backgroundColor: '#4CAF50'
                    }]
                },
                options: { responsive: true }
            }
        ]
    };

    const roleCharts = chartConfigs[currentUser.role] || [];
    roleCharts.forEach(config => {
        const ctx = document.getElementById(config.id)?.getContext('2d');
        if (ctx) {
            new Chart(ctx, {
                type: config.type,
                data: config.data,
                options: config.options
            });
        }
    });
}

document.addEventListener("DOMContentLoaded", function() {
    toggleAuthButtons();

    if (currentUser) {
        setupDashboard();
    }

    setupSidebarNavigation();

    setupFeatureAnimation();

    setupClassFilter();

    const navLinks = {
        'homeLink': { section: 'hero', title: 'Home' },
        'aboutLink': { section: 'about', title: 'About Us' },
        'analyticsLink': { section: 'analytics', title: 'Analytics' },
        'contactLink': { section: 'contact', title: 'Contact Us' }
    };

    function resetNavLinks() {
        Object.keys(navLinks).forEach(linkId => {
            document.getElementById(linkId).classList.remove('active');
        });
    }

    Object.keys(navLinks).forEach(linkId => {
        const link = document.getElementById(linkId);
        link.addEventListener('click', function() {
            resetNavLinks();
            this.classList.add('active');

            document.getElementById('hero').style.display = 'none';

            if (currentUser) {
                document.querySelector('.content-area').style.display = 'block';
            }

            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });

            if (linkId === 'homeLink') {
                if (currentUser) {
                    const menuItems = document.querySelectorAll('.menu-item');
                    menuItems.forEach(mi => mi.classList.remove('active'));
                    document.querySelector('.menu-item[data-section="dashboard"]').classList.add('active');
                    document.getElementById('dashboardSection').classList.add('active');
                } else {
                    document.getElementById('hero').style.display = 'block';
                    document.querySelectorAll('.content-section').forEach(section => {
                        section.classList.remove('active');
                    });
                }
            } else {
                const sectionId = navLinks[linkId].section + 'Section';
                const section = document.getElementById(sectionId);
                if (section) {
                    section.classList.add('active');

                    if (!currentUser) {
                        document.querySelector('.content-area').style.display = 'block';
                    }
                }
            }
        });
    });
});
document.getElementById('learnMoreLink').addEventListener('click', function(e) {
    e.preventDefault();
    
    document.getElementById('analyticsLink').click();
});

document.getElementById('requestdemoLink').addEventListener('click', function(e) {
    e.preventDefault();
    
    document.getElementById('contactLink').click();
    
});

function setupSidebarNavigation() {
    const menuItems = document.querySelectorAll('.menu-item');

    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            menuItems.forEach(mi => mi.classList.remove('active'));

            this.classList.add('active');

            const contentSections = document.querySelectorAll('.content-section');
            contentSections.forEach(section => section.classList.remove('active'));

            const sectionId = this.getAttribute('data-section') + 'Section';
            document.getElementById(sectionId).classList.add('active');
        });
    });
}
function setupFeatureAnimation() {
    function initializeFeatureCarousel() {
        const featuresContainer = document.querySelector('.features-container');
        if (!featuresContainer) return;

        featuresContainer.innerHTML = '';

        const carousel = document.createElement('div');
        carousel.className = 'feature-carousel';

        const features = [
            {
                title: "Personalized Learning",
                text: "Tailored educational insights to track and improve student performance.",
                icon: "https://img.icons8.com/?size=100&id=67231&format=png&color=1A1A1A"
            },
            {
                title: "Real-Time Analytics",
                text: "Monitor academic progress with detailed reports and analytics.",
                icon: "https://cdn-icons-png.flaticon.com/512/1925/1925044.png"
            },
            {
                title: "Seamless Communication",
                text: "Bridge the gap between teachers, students, and parents for better learning outcomes.",
                icon: "https://cdn-icons-png.flaticon.com/512/6323/6323417.png"
            },
            {
                title: "Goal Tracking",
                text: "Set and achieve academic milestones with structured guidance.",
                icon: "https://cdn-icons-png.flaticon.com/512/4728/4728631.png"
            },
            {
                title: "Secure Platform",
                text: "Your data is safe, ensuring a reliable and protected learning environment.",
                icon: "https://cdn-icons-png.flaticon.com/512/2889/2889676.png"
            }
        ];

        const allFeatures = [...features, ...features, ...features];

        allFeatures.forEach(feature => {
            const featureElement = document.createElement('div');
            featureElement.className = 'feature';
            featureElement.innerHTML = `
                <img src="${feature.icon}" alt="${feature.title}">
                <h3>${feature.title}</h3>
                <p>${feature.text}</p>
            `;
            carousel.appendChild(featureElement);
        });

        featuresContainer.appendChild(carousel);

        carousel.style.transform = 'translateX(0)';

        return {
            carousel,
            featuresCount: features.length,
            featureWidth: 270 // Width + margin
        };
    }

    const carouselData = initializeFeatureCarousel();
    if (!carouselData) return;

    const { carousel, featuresCount, featureWidth } = carouselData;

    const animationDuration = featuresCount * 10; // 10 seconds per feature

    carousel.style.animation = `scrollFeatures ${animationDuration}s linear infinite`;

    carousel.addEventListener('animationiteration', () => {
        carousel.style.transform = 'translateX(0)';
    });
}


function showEditProfilePopup() {
    const editOverlay = document.getElementById('editProfileOverlay');
    const fullNameInput = document.getElementById('editFullName');
    const emailInput = document.getElementById('editEmail');
    const dobInput = document.getElementById('editDob');
    const contactInput = document.getElementById('editContact');
    const addressInput = document.getElementById('editAddress');

    fullNameInput.value = currentUser.fullName || currentUser.name;
    emailInput.value = currentUser.email || `${currentUser.name.toLowerCase()}@example.com`;
    dobInput.value = currentUser.dob || 'January 1, 2000';
    contactInput.value = currentUser.contact || '+123-456-7890';
    addressInput.value = currentUser.address || '123 School St, Education City';

    editOverlay.style.display = 'flex';
}

function saveProfileChanges() {
    const fullName = document.getElementById('editFullName').value.trim();
    const email = document.getElementById('editEmail').value.trim();
    const dob = document.getElementById('editDob').value.trim();
    const contact = document.getElementById('editContact').value.trim();
    const address = document.getElementById('editAddress').value.trim();

    if (!fullName || !email) {
        alert('Name and Email are required!');
        return;
    }

    currentUser.fullName = fullName;
    currentUser.email = email;
    currentUser.dob = dob;
    currentUser.contact = contact;
    currentUser.address = address;

    localStorage.setItem('user', JSON.stringify(currentUser));

    let users = getUsers();
    if (users[currentUser.name]) {
        users[currentUser.name].fullName = fullName;
        users[currentUser.name].email = email;
        users[currentUser.name].dob = dob;
        users[currentUser.name].contact = contact;
        users[currentUser.name].address = address;
        saveUsers(users);
    }

    document.getElementById('profileName').textContent = currentUser.name;
    document.getElementById('profileEmail').textContent = email;
    document.getElementById('profileFullName').textContent = fullName;
    document.getElementById('profileDob').textContent = dob;
    document.getElementById('profileContact').textContent = contact;
    document.getElementById('profileAddress').textContent = address;

    hideEditPopups();

    alert('Profile updated successfully!');
}

function showChangePasswordPopup() {
    document.getElementById('changePasswordOverlay').style.display = 'flex';
}

function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    const users = getUsers();

    if (!users[currentUser.name] || users[currentUser.name].password !== currentPassword) {
        alert('Current password is incorrect!');
        return;
    }

    if (newPassword !== confirmPassword) {
        alert('New password and confirm password do not match!');
        return;
    }

    if (!newPassword.trim()) {
        alert('New password cannot be empty!');
        return;
    }

    users[currentUser.name].password = newPassword;
    saveUsers(users);

    hideEditPopups();

    alert('Password changed successfully!');
}

function hideEditPopups() {
    document.getElementById('editProfileOverlay').style.display = 'none';
    document.getElementById('changePasswordOverlay').style.display = 'none';
}

function setupClassFilter() {
    const filterBtn = document.querySelector('.class-filter button');
    const classFilter = document.getElementById('classFilter');

    if (filterBtn && classFilter) {
        filterBtn.addEventListener('click', function() {
            const selectedClass = classFilter.value;
            filterStudentsByClass(selectedClass);
        });
    }
}

function filterStudentsByClass(selectedClass) {
    const studentCards = document.querySelectorAll('.student-card');
    const studentsGrid = document.querySelector('.students-grid');
    let visibleCount = 0;

    studentCards.forEach(card => {
        const studentClass = card.querySelector('p:nth-child(3)').textContent.split(': ')[1];
        const visible = selectedClass === 'all' || studentClass === selectedClass;
        card.style.display = visible ? 'block' : 'none';
        if (visible) visibleCount++;
    });

    let noResultsMessage = document.getElementById('noResultsMessage');
    if (visibleCount === 0 && studentsGrid) {
        if (!noResultsMessage) {
            noResultsMessage = document.createElement('p');
            noResultsMessage.id = 'noResultsMessage';
            noResultsMessage.textContent = `No students found in ${selectedClass}`;
            noResultsMessage.style.cssText = 'text-align: center; width: 100%; margin: 2rem 0; color: var(--text-gray);';
            studentsGrid.appendChild(noResultsMessage);
        }
    } else if (noResultsMessage) {
        noResultsMessage.remove();
    }

    const displayName = selectedClass === 'all' ? 'All Classes' : selectedClass;

    const filterBtn = document.querySelector('.class-filter button');
    filterBtn.innerHTML = `Filter <span class="filter-status">${displayName}</span>`;
}
document.addEventListener('DOMContentLoaded', function() {
    const studentsGrid = document.getElementById('studentsGrid');
    if (studentsGrid) {
        studentsGrid.addEventListener('click', function(e) {
            const viewProfileBtn = e.target.closest('.student-actions .btn-primary');
            const sendMessageBtn = e.target.closest('.student-actions .btn-secondary');
            
            if (viewProfileBtn) {
                const studentCard = viewProfileBtn.closest('.student-card');
                const studentData = {
                    name: studentCard.querySelector('h3').textContent,
                    class: studentCard.querySelector('p').textContent.replace('Class: ', ''),
                    performance: studentCard.querySelector('p:nth-of-type(2)').textContent.replace('Performance: ', ''),
                    avatar: studentCard.querySelector('.student-avatar i').className
                };
                showStudentProfileModal(studentData);
            }
            
            if (sendMessageBtn) {
                const studentName = sendMessageBtn.closest('.student-card').querySelector('h3').textContent;
                openMessageDialog(studentName);
            }
        });
    }

    const generateReportBtn = document.querySelector('.progress-filters .btn-primary');
    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', function() {
            const classFilter = document.getElementById('progressClassFilter').value;
            const studentFilter = document.getElementById('progressStudentFilter').value;
            simulateApiCall('/reports/generate', { classFilter, studentFilter })
                .then(() => {
                    alert(`Report generated for ${studentFilter === 'all' ? 'all students' : studentFilter} in class ${classFilter}`);
                });
        });
    }

    const viewDetailedProgressBtn = document.querySelector('.progress-tracking .btn-secondary');
    if (viewDetailedProgressBtn) {
        viewDetailedProgressBtn.addEventListener('click', function() {
            alert('Loading detailed progress data...');
        });
    }

    const createAssignmentBtn = document.getElementById('createAssignmentBtn');
    if (createAssignmentBtn) {
        createAssignmentBtn.addEventListener('click', showAssignmentCreationForm);
    }

    document.querySelectorAll('.assignment-management .btn-primary').forEach(btn => {
        btn.addEventListener('click', function() {
            const assignmentName = this.closest('.assignment-card').querySelector('h4').textContent;
            alert(`Showing submissions for ${assignmentName}`);
        });
    });

    document.querySelectorAll('.assignment-management .btn-secondary').forEach(btn => {
        btn.addEventListener('click', function() {
            const assignmentName = this.closest('.assignment-card').querySelector('h4').textContent;
            setTimeout(() => {
                alert(`Plagiarism check complete for ${assignmentName}`);
            }, 1500);
        });
    });

    const sendAnnouncementBtn = document.getElementById('sendAnnouncementBtn');
    if (sendAnnouncementBtn) {
        sendAnnouncementBtn.addEventListener('click', function() {
            const announcementText = prompt('Enter your announcement:');
            if (announcementText) {
                simulateApiCall('/announcements/create', { text: announcementText })
                    .then(() => alert('Announcement sent!'));
            }
        });
    }

    const openForumBtn = document.getElementById('openForumBtn');
    if (openForumBtn) {
        openForumBtn.addEventListener('click', function() {
            alert('Redirecting to classroom forum...');
        });
    }

    const uploadMaterialBtn = document.getElementById('uploadMaterialBtn');
    if (uploadMaterialBtn) {
        uploadMaterialBtn.addEventListener('click', handleFileUpload);
    }

    const scheduleClassBtn = document.getElementById('scheduleClassBtn');
    if (scheduleClassBtn) {
        scheduleClassBtn.addEventListener('click', function() {
            const className = prompt('Enter class name:');
            if (className) {
                const classTime = prompt('Enter date/time (YYYY-MM-DD HH:MM):');
                if (classTime) {
                    simulateApiCall('/classes/schedule', { name: className, time: classTime })
                        .then(() => alert(`Class "${className}" scheduled`));
                }
            }
        });
    }

    function showStudentProfileModal(student) {
        const modalHTML = `
            <div class="profile-modal">
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    <div class="modal-header">
                        <div class="student-avatar">
                            <i class="${student.avatar}"></i>
                        </div>
                        <h2>${student.name}</h2>
                        <p>${student.class}</p>
                    </div>
                    <div class="modal-body">
                        <div class="profile-section">
                            <h3>Academic Performance</h3>
                            <p><strong>Current Performance:</strong> <span class="${student.performance.toLowerCase()}">${student.performance}</span></p>
                            <div class="performance-chart">
                                <canvas id="studentPerformanceChart"></canvas>
                            </div>
                        </div>
                        <div class="profile-section">
                            <h3>Recent Grades</h3>
                            <table class="grades-table">
                                <thead>
                                    <tr>
                                        <th>Subject</th>
                                        <th>Assignment</th>
                                        <th>Grade</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Mathematics</td>
                                        <td>Algebra Test</td>
                                        <td>A</td>
                                    </tr>
                                    <tr>
                                        <td>Science</td>
                                        <td>Physics Lab</td>
                                        <td>B+</td>
                                    </tr>
                                    <tr>
                                        <td>English</td>
                                        <td>Essay</td>
                                        <td>A-</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="profile-actions">
                            <button class="btn-primary send-message-btn">Send Message</button>
                            <button class="btn-secondary view-full-profile-btn">View Full Profile</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        document.querySelector('.close-modal').addEventListener('click', function() {
            document.querySelector('.profile-modal').remove();
        });
        
        document.querySelector('.send-message-btn').addEventListener('click', function() {
            openMessageDialog(student.name);
        });
    }

    function openMessageDialog(recipient) {
        const message = prompt(`Message to ${recipient}:`);
        if (message) {
            simulateApiCall('/messages/send', { recipient, message })
                .then(() => alert('Message sent!'));
        }
    }

    function showAssignmentCreationForm() {
        const deadline = prompt('Enter deadline (YYYY-MM-DD):');
        if (deadline) {
            const name = prompt('Enter assignment name:');
            if (name) {
                simulateApiCall('/assignments/create', { name, deadline })
                    .then(() => alert(`Assignment "${name}" created`));
            }
        }
    }

    function handleFileUpload() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.multiple = true;
        fileInput.accept = '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.png,.mp4,.mp3';
        
        fileInput.addEventListener('change', function(e) {
            const files = e.target.files;
            if (files.length > 0) {
                const fileNames = Array.from(files).map(f => f.name).join(', ');
                alert(`Selected files: ${fileNames}`);
            }
        });
        
        fileInput.click();
    }

    function simulateApiCall(endpoint, data) {
        console.log(`API call to ${endpoint}`, data);
        return new Promise(resolve => setTimeout(() => resolve({ status: 'success' }), 1000));
    }
});
document.addEventListener('DOMContentLoaded', function() {
    const sampleData = {
        children: [
            {
                name: "John Doe",
                class: "10A",
                grade: "A-",
                attendance: "95%",
                teacher: "Ms. Johnson",
                subjects: [
                    { name: "Mathematics", grade: "A", teacher: "Ms. Johnson" },
                    { name: "Science", grade: "A", teacher: "Mr. Smith" },
                    { name: "English", grade: "B+", teacher: "Mrs. Williams" }
                ],
                assignments: [
                    { name: "Math Homework", subject: "Mathematics", due: "2023-05-15", status: "Completed" },
                    { name: "Science Project", subject: "Science", due: "2023-05-20", status: "Pending" }
                ],
                healthRecords: [
                    { type: "Vaccination", date: "2023-01-10", notes: "Flu vaccine" },
                    { type: "Checkup", date: "2023-03-15", notes: "Annual physical" }
                ],
                performanceData: {
                    math: { current: 92, average: 85 },
                    science: { current: 88, average: 82 },
                    english: { current: 84, average: 80 }
                }
            }
        ],
        schoolAnnouncements: [
            { title: "PTA Meeting", date: "2023-05-25", content: "Quarterly parent-teacher meeting" },
            { title: "Sports Day", date: "2023-06-10", content: "Annual school sports competition" }
        ]
    };

    setupChildActions();

    setupPerformanceTracking();

    setupAttendanceTracking();

    setupAssignmentTracking();

    setupHealthRecords();

    setupCommunication();

    setupPTAMeetings();

    function setupChildActions() {
        document.querySelectorAll('.child-actions .btn-primary').forEach(btn => {
            btn.addEventListener('click', function() {
                const childData = getChildData(this);
                showChildDetailsModal(childData);
            });
        });

        document.querySelectorAll('.child-actions .btn-secondary').forEach(btn => {
            btn.addEventListener('click', function() {
                const childData = getChildData(this);
                showContactTeacherModal(childData);
            });
        });
    }

    function setupPerformanceTracking() {
        document.querySelectorAll('.performance-card .btn-primary').forEach(btn => {
            if (btn.textContent.includes('View Detailed Report')) {
                btn.addEventListener('click', function() {
                    const childData = getCurrentChildData();
                    showPerformanceReport(childData);
                });
            }
        });

        document.querySelectorAll('.performance-card .btn-secondary').forEach(btn => {
            if (btn.textContent.includes('Compare with Class')) {
                btn.addEventListener('click', showClassComparison);
            }
        });
    }

    function setupAttendanceTracking() {
        document.querySelectorAll('.attendance-summary .btn-secondary').forEach(btn => {
            if (btn.textContent.includes('View Attendance')) {
                btn.addEventListener('click', showAttendanceRecords);
            }
        });
    }

    function setupAssignmentTracking() {
        document.querySelectorAll('.homework-tracker .btn-primary').forEach(btn => {
            if (btn.textContent.includes('View All Assignments')) {
                btn.addEventListener('click', showAllAssignments);
            }
        });
    }

    function setupHealthRecords() {
        document.querySelectorAll('.health-wellbeing .btn-secondary').forEach(btn => {
            if (btn.textContent.includes('View Health Records')) {
                btn.addEventListener('click', showHealthRecords);
            }
        });
    }

    function setupCommunication() {
        document.querySelectorAll('.communication-options .btn-primary').forEach(btn => {
            if (btn.textContent.includes('Message Teacher')) {
                btn.addEventListener('click', openTeacherMessageForm);
            }
        });

        document.querySelectorAll('.communication-options .btn-secondary').forEach(btn => {
            if (btn.textContent.includes('View Announcements')) {
                btn.addEventListener('click', showSchoolAnnouncements);
            }
            if (btn.textContent.includes('Request Meeting')) {
                btn.addEventListener('click', requestParentTeacherMeeting);
            }
        });
    }

    function setupPTAMeetings() {
        document.querySelectorAll('.meeting-actions .btn-primary').forEach(btn => {
            if (btn.textContent.includes('Confirm Attendance')) {
                btn.addEventListener('click', function() {
                    const meetingTitle = this.closest('.meeting-card').querySelector('h4').textContent;
                    confirmPTAAttendance(meetingTitle);
                });
            }
        });

        document.querySelectorAll('.meeting-actions .btn-secondary').forEach(btn => {
            if (btn.textContent.includes('Set Reminder')) {
                btn.addEventListener('click', function() {
                    const meetingTitle = this.closest('.meeting-card').querySelector('h4').textContent;
                    setMeetingReminder(meetingTitle);
                });
            }
        });

        document.querySelectorAll('.meetings-table .btn-secondary').forEach(btn => {
            if (btn.textContent.includes('View Notes')) {
                btn.addEventListener('click', function() {
                    const meetingDate = this.closest('tr').querySelector('td').textContent;
                    viewMeetingNotes(meetingDate);
                });
            }
        });
    }

    function getChildData(element) {
        const childName = element.closest('.child-card').querySelector('.child-info h3').textContent;
        return sampleData.children.find(c => c.name === childName);
    }

    function getCurrentChildData() {
        const childName = document.querySelector('.child-card h3').textContent;
        return sampleData.children.find(c => c.name === childName);
    }

    function showChildDetailsModal(childData) {
        const modalHTML = createChildDetailsHTML(childData);
        showModal(modalHTML, 'child-details-modal');
    }

    function showContactTeacherModal(childData) {
        const modalHTML = createContactTeacherHTML(childData);
        const modal = showModal(modalHTML, 'contact-teacher-modal');
        
        modal.querySelector('.send-message-btn').addEventListener('click', function() {
            const teacher = modal.querySelector('#teacherSelect').value;
            const message = modal.querySelector('#teacherMessage').value;
            const priority = modal.querySelector('#messagePriority').value;
            
            if (!message.trim()) {
                alert('Please enter a message');
                return;
            }
            
            console.log(`Message to ${teacher}:`, { message, priority });
            alert(`Message sent to ${teacher}!`);
            modal.remove();
        });
    }

    function showPerformanceReport(childData) {
        const modalHTML = `
        <div class="performance-modal">
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>${childData.name}'s Performance Report</h2>
                <div class="performance-charts">
                    ${Object.entries(childData.performanceData).map(([subject, data]) => `
                    <div class="chart-container">
                        <h3>${subject.charAt(0).toUpperCase() + subject.slice(1)}</h3>
                        <p>Student: ${data.current}%</p>
                        <p>Class Average: ${data.average}%</p>
                        <div class="progress-bar">
                            <div class="student-progress" style="width: ${data.current}%"></div>
                            <div class="average-progress" style="width: ${data.average}%"></div>
                        </div>
                    </div>
                    `).join('')}
                </div>
            </div>
        </div>
        `;
        showModal(modalHTML, 'performance-modal');
    }

    function showModal(html, className) {
        const modal = document.createElement('div');
        modal.className = className;
        modal.innerHTML = html;
        document.body.appendChild(modal);
        
        modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
        if (modal.querySelector('.cancel-btn')) {
            modal.querySelector('.cancel-btn').addEventListener('click', () => modal.remove());
        }
        
        return modal;
    }

    function createChildDetailsHTML(childData) {
        return `
        <div class="child-details-modal">
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>${childData.name}'s Details</h2>
                
                <div class="detail-section">
                    <h3>Basic Information</h3>
                    <p><strong>Class:</strong> ${childData.class}</p>
                    <p><strong>Overall Grade:</strong> ${childData.grade}</p>
                    <p><strong>Attendance:</strong> ${childData.attendance}</p>
                </div>
                
                <div class="detail-section">
                    <h3>Subjects and Teachers</h3>
                    ${createTableHTML(
                        ['Subject', 'Teacher', 'Grade'],
                        childData.subjects.map(s => [s.name, s.teacher, s.grade]),
                        'subjects-table'
                    )}
                </div>
                
                <div class="detail-section">
                    <h3>Current Assignments</h3>
                    ${createTableHTML(
                        ['Assignment', 'Subject', 'Due Date', 'Status'],
                        childData.assignments.map(a => [a.name, a.subject, a.due, a.status]),
                        'assignments-table',
                        row => row[3].toLowerCase()
                    )}
                </div>
                
                <div class="detail-section">
                    <h3>Health Records</h3>
                    ${createTableHTML(
                        ['Type', 'Date', 'Notes'],
                        childData.healthRecords.map(h => [h.type, h.date, h.notes]),
                        'health-table'
                    )}
                </div>
            </div>
        </div>
        `;
    }

    function createContactTeacherHTML(childData) {
        return `
        <div class="contact-teacher-modal">
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>Contact Teacher</h2>
                <p>Contacting regarding: <strong>${childData.name}</strong> (${childData.class})</p>
                
                <div class="form-group">
                    <label>Select Teacher:</label>
                    <select id="teacherSelect" class="form-control">
                        ${childData.subjects.map(subj => `
                            <option value="${subj.teacher}">${subj.teacher} (${subj.name})</option>
                        `).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Your Message:</label>
                    <textarea id="teacherMessage" class="form-control" rows="5" 
                        placeholder="Enter your message to the teacher..."></textarea>
                </div>
                
                <div class="form-group">
                    <label>Priority:</label>
                    <select id="messagePriority" class="form-control">
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                    </select>
                </div>
                
                <button class="btn-primary send-message-btn">Send Message</button>
                <button class="btn-secondary cancel-btn">Cancel</button>
            </div>
        </div>
        `;
    }

    function createTableHTML(headers, rows, tableClass, rowClassFn = () => '') {
        return `
        <table class="${tableClass}">
            <thead>
                <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
            </thead>
            <tbody>
                ${rows.map(row => `
                <tr class="${rowClassFn(row)}">
                    ${row.map(cell => `<td>${cell}</td>`).join('')}
                </tr>
                `).join('')}
            </tbody>
        </table>
        `;
    }

    function showClassComparison() {
        const childData = getCurrentChildData();
        showPerformanceReport(childData); 
    }

    function showAttendanceRecords() {
        const childData = getCurrentChildData();
        alert(`Showing attendance records for ${childData.name}: ${childData.attendance} attendance rate`);
    }

    function showAllAssignments() {
        const childData = getCurrentChildData();
        const assignmentsHTML = childData.assignments.map(a => 
            `${a.name} (${a.subject}) - Due: ${a.due} - Status: ${a.status}`
        ).join('\n');
        alert(`All assignments:\n${assignmentsHTML}`);
    }

    function showHealthRecords() {
        const childData = getCurrentChildData();
        const recordsHTML = childData.healthRecords.map(r => 
            `${r.type} on ${r.date}: ${r.notes}`
        ).join('\n');
        alert(`Health records:\n${recordsHTML}`);
    }

    function openTeacherMessageForm() {
        const childData = getCurrentChildData();
        showContactTeacherModal(childData);
    }

    function showSchoolAnnouncements() {
        const announcementsHTML = sampleData.schoolAnnouncements.map(a => 
            `${a.title} on ${a.date}: ${a.content}`
        ).join('\n\n');
        alert(`School announcements:\n\n${announcementsHTML}`);
    }

    function requestParentTeacherMeeting() {
        const reason = prompt("Enter reason for meeting request:");
        if (reason) {
            const preferredDate = prompt("Preferred date (YYYY-MM-DD):");
            if (preferredDate) {
                alert(`Meeting requested for ${preferredDate}\nReason: ${reason}`);
            }
        }
    }

    function confirmPTAAttendance(meetingTitle) {
        if (confirm(`Confirm attendance for "${meetingTitle}"?`)) {
            alert("Attendance confirmed!");
        }
    }

    function setMeetingReminder(meetingTitle) {
        alert(`Reminder set for "${meetingTitle}"`);
    }

    function viewMeetingNotes(meetingDate) {
        alert(`Showing notes from meeting on ${meetingDate}`);
    }
});
document.addEventListener('DOMContentLoaded', function() {
    const studentData = {
        name: "Alice Johnson",
        class: "10A",
        assignments: [
            {
                id: 1,
                title: "Mathematics Assignment",
                description: "Complete exercises on quadratic equations",
                dueDate: "2023-05-15",
                status: "pending",
                teacher: "Ms. Smith",
                submission: null,
                feedback: null
            },
            {
                id: 2,
                title: "Science Project",
                description: "Research and presentation on renewable energy sources",
                dueDate: "2023-05-10",
                status: "submitted",
                teacher: "Mr. Brown",
                submission: {
                    date: "2023-05-08",
                    file: "science_project.pdf"
                },
                feedback: {
                    grade: "A-",
                    comments: "Excellent research but could improve presentation"
                }
            }
        ],
        resources: [
            {
                type: "Course Materials",
                items: [
                    { name: "Mathematics Notes - Chapter 1", format: "pdf" },
                    { name: "Science Video - Physics", format: "mp4" }
                ]
            },
            {
                type: "Past Papers",
                items: [
                    { name: "Mathematics - 2022 Exam", format: "pdf" },
                    { name: "Science - 2022 Exam", format: "pdf" }
                ]
            }
        ],
        attendance: {
            present: 95,
            absent: 5,
            late: 2,
            history: [
                { date: "2023-05-01", status: "Present" },
                { date: "2023-05-02", status: "Late" },
                { date: "2023-05-03", status: "Present" }
            ]
        }
    };

    setupAssignmentButtons();

    setupAcademicDashboard();

    setupStudyResources();

    setupAttendance();

    setupCommunication();

    function setupAssignmentButtons() {
        document.querySelectorAll('.assignment-actions .btn-primary').forEach(btn => {
            if (btn.textContent.includes('Submit')) {
                btn.addEventListener('click', function() {
                    const assignmentId = parseInt(this.closest('.assignment-card').dataset.id);
                    const assignment = studentData.assignments.find(a => a.id === assignmentId);
                    submitAssignment(assignment);
                });
            }
        });

        document.querySelectorAll('.assignment-actions .btn-secondary').forEach(btn => {
            if (btn.textContent.includes('View Details')) {
                btn.addEventListener('click', function() {
                    const assignmentId = parseInt(this.closest('.assignment-card').dataset.id);
                    const assignment = studentData.assignments.find(a => a.id === assignmentId);
                    viewAssignmentDetails(assignment);
                });
            }
        });

        document.querySelectorAll('.assignment-actions .btn-secondary').forEach(btn => {
            if (btn.textContent.includes('View Feedback')) {
                btn.addEventListener('click', function() {
                    const assignmentId = parseInt(this.closest('.assignment-card').dataset.id);
                    const assignment = studentData.assignments.find(a => a.id === assignmentId);
                    viewAssignmentFeedback(assignment);
                });
            }
        });
    }

    function setupAcademicDashboard() {
        document.querySelector('.submit-assignment .btn-primary').addEventListener('click', function() {
            const fileInput = document.getElementById('assignmentFile');
            if (fileInput.files.length > 0) {
                uploadAssignment(fileInput.files[0]);
            } else {
                alert('Please select a file to upload');
            }
        });

        document.querySelector('.resubmission-request .btn-resubmit').addEventListener('click', function() {
            const reason = document.getElementById('resubmissionReason').value;
            if (reason.trim() === '') {
                alert('Please explain why you need a re-evaluation');
                return;
            }
            requestResubmission(reason);
        });
    }

    function setupStudyResources() {
        document.querySelectorAll('.resource-card .btn-primary').forEach(btn => {
            if (btn.textContent.includes('Download All')) {
                btn.addEventListener('click', function() {
                    const resourceType = this.closest('.resource-card').querySelector('h4').textContent;
                    downloadAllResources(resourceType);
                });
            }
        });

        document.querySelectorAll('.resource-card .btn-primary').forEach(btn => {
            if (btn.textContent.includes('Download')) {
                btn.addEventListener('click', function() {
                    const resourceName = this.closest('li').textContent.split(' - ')[0];
                    downloadResource(resourceName);
                });
            }
        });

        document.querySelectorAll('.resource-card .btn-primary').forEach(btn => {
            if (btn.textContent.includes('Start Quiz')) {
                btn.addEventListener('click', function() {
                    startQuiz();
                });
            }
        });
    }

    function setupAttendance() {
        document.querySelector('.attendance-overview .btn-secondary').addEventListener('click', function() {
            viewAttendanceHistory();
        });
    }

    function setupCommunication() {
        document.querySelectorAll('.communication-options .btn-primary').forEach(btn => {
            if (btn.textContent.includes('Chat with Teacher')) {
                btn.addEventListener('click', function() {
                    startTeacherChat();
                });
            }
        });

        document.querySelectorAll('.communication-options .btn-secondary').forEach(btn => {
            if (btn.textContent.includes('Classroom Forum')) {
                btn.addEventListener('click', function() {
                    openClassroomForum();
                });
            }
        });

        document.querySelectorAll('.communication-options .btn-secondary').forEach(btn => {
            if (btn.textContent.includes('Request Help')) {
                btn.addEventListener('click', function() {
                    requestHelp();
                });
            }
        });
    }

    function submitAssignment(assignment) {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.pdf,.doc,.docx,.ppt,.pptx,.zip';
        
        fileInput.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                const file = e.target.files[0];
                assignment.submission = {
                    date: new Date().toISOString().split('T')[0],
                    file: file.name
                };
                assignment.status = "submitted";
                
                alert(`Assignment "${assignment.title}" submitted successfully!`);
            }
        });
        
        fileInput.click();
    }

    function viewAssignmentDetails(assignment) {
        const modalHTML = `
        <div class="assignment-modal">
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>${assignment.title}</h2>
                <p><strong>Description:</strong> ${assignment.description}</p>
                <p><strong>Due Date:</strong> ${assignment.dueDate}</p>
                <p><strong>Status:</strong> <span class="${assignment.status}">${assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}</span></p>
                <p><strong>Teacher:</strong> ${assignment.teacher}</p>
                
                ${assignment.submission ? `
                <div class="submission-info">
                    <h3>Your Submission</h3>
                    <p><strong>Date Submitted:</strong> ${assignment.submission.date}</p>
                    <p><strong>File:</strong> ${assignment.submission.file}</p>
                </div>
                ` : ''}
                
                <button class="btn-primary close-btn">Close</button>
            </div>
        </div>
        `;
        
        showModal(modalHTML);
    }

    function viewAssignmentFeedback(assignment) {
        if (!assignment.feedback) {
            alert('No feedback available for this assignment yet');
            return;
        }
        
        const modalHTML = `
        <div class="feedback-modal">
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>Feedback for ${assignment.title}</h2>
                <p><strong>Grade:</strong> ${assignment.feedback.grade}</p>
                <p><strong>Comments:</strong></p>
                <div class="feedback-comments">${assignment.feedback.comments}</div>
                <button class="btn-primary close-btn">Close</button>
            </div>
        </div>
        `;
        
        showModal(modalHTML);
    }

    function uploadAssignment(file) {
        console.log('Uploading file:', file.name);
        alert(`File "${file.name}" uploaded successfully!`);
    }

    function requestResubmission(reason) {
        console.log('Resubmission request:', reason);
        alert('Resubmission request sent to teacher!');
        document.getElementById('resubmissionReason').value = '';
    }

    function downloadAllResources(resourceType) {
        const resources = studentData.resources.find(r => r.type === resourceType);
        if (resources) {
            alert(`Preparing download of all ${resourceType}...`);
            console.log('Downloading:', resources.items.map(i => i.name));
        }
    }

    function downloadResource(resourceName) {
        alert(`Downloading ${resourceName}...`);
        console.log('Downloading:', resourceName);
    }

    function startQuiz() {
        alert('Starting quiz... Good luck!');
    }

    function startTeacherChat() {
        const teacher = prompt("Which teacher would you like to chat with?");
        if (teacher) {
            alert(`Opening chat with ${teacher}...`);
        }
    }

    function openClassroomForum() {
        alert('Opening classroom forum...');
    }

    function requestHelp() {
        const topic = prompt("What do you need help with?");
        if (topic) {
            alert(`Help request sent for: ${topic}\nA teacher will respond soon.`);
        }
    }

    function showModal(html) {
        const modal = document.createElement('div');
        modal.innerHTML = html;
        document.body.appendChild(modal);
        
        modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
        if (modal.querySelector('.close-btn')) {
            modal.querySelector('.close-btn').addEventListener('click', () => modal.remove());
        }
    }
});

document.addEventListener('DOMContentLoaded', function() {
    initAdminInterface();
});

function initAdminInterface() {
    const userSearchInput = document.querySelector('.user-search input');
    const userSearchBtn = document.querySelector('.user-search button');
    const roleFilter = document.getElementById('roleFilter');
    const addUserBtn = document.querySelector('.user-management-controls button.btn-primary');
    const usersTable = document.querySelector('.users-table tbody');
    
    const addSubjectBtn = document.querySelector('.subject-controls button');
    const subjectsGrid = document.getElementById('subjectsGrid');
    
    const academicYearSelect = document.querySelector('#configSection select:first-child');
    const termSelect = document.querySelector('#configSection select:nth-child(2)');
    const saveAcademicSettingsBtn = document.querySelector('#configSection .config-card:first-child button');
    
    const gradeScaleInputs = document.querySelectorAll('.config-table input');
    const saveGradeScaleBtn = document.querySelector('#configSection .config-card:nth-child(2) button');

    const users = [
        { id: '001', name: 'John Smith', role: 'Teacher', email: 'john@example.com', status: 'Active', lastLogin: 'May 10, 2023', password: 'teacher123' },
        { id: '002', name: 'Alice Johnson', role: 'Student', email: 'alice@example.com', status: 'Active', lastLogin: 'May 11, 2023', password: 'student123' },
        { id: '003', name: 'Bob Williams', role: 'Parent', email: 'bob@example.com', status: 'Inactive', lastLogin: 'April 29, 2023', password: 'parent123' }
    ];

    const subjects = [
        { id: 'MATH001', name: 'Mathematics', icon: 'calculator', type: 'math', teachers: 5, classes: 10 },
        { id: 'SCI001', name: 'Science', icon: 'flask', type: 'science', teachers: 4, classes: 8 },
        { id: 'ENG001', name: 'English', icon: 'book', type: 'english', teachers: 3, classes: 6 }
    ];

    renderUsersTable(users);
    
    renderSubjectsGrid(subjects);

    userSearchBtn.addEventListener('click', function() {
        const searchTerm = userSearchInput.value.toLowerCase();
        const roleFilterValue = roleFilter.value;
        
        const filteredUsers = users.filter(user => {
            const matchesSearch = user.name.toLowerCase().includes(searchTerm) || 
                                user.email.toLowerCase().includes(searchTerm);
            const matchesRole = roleFilterValue === 'all' || 
                              user.role.toLowerCase() === roleFilterValue;
            
            return matchesSearch && matchesRole;
        });
        
        renderUsersTable(filteredUsers);
    });

    roleFilter.addEventListener('change', function() {
        userSearchBtn.click(); 
    });

    addUserBtn.addEventListener('click', function() {
        alert('Add New User functionality would open a form here');
    });

    addSubjectBtn.addEventListener('click', function() {
        alert('Add New Subject functionality would open a form here');
    });

    saveAcademicSettingsBtn.addEventListener('click', function() {
        const academicYear = academicYearSelect.value;
        const term = termSelect.value;
        
        console.log('Saving academic settings:', { academicYear, term });
        alert(`Academic settings saved:\nYear: ${academicYear}\nTerm: ${term}`);
    });

    saveGradeScaleBtn.addEventListener('click', function() {
        const gradeScale = [];
        const rows = document.querySelectorAll('.config-table tbody tr');
        
        rows.forEach(row => {
            const grade = row.querySelector('td:first-child').textContent;
            const min = row.querySelector('td:nth-child(2) input').value;
            const max = row.querySelector('td:nth-child(3) input').value;
            
            gradeScale.push({ grade, min, max });
        });
        
        console.log('Saving grade scale:', gradeScale);
        alert('Grade scale saved successfully!');
    });

    function renderUsersTable(usersToRender) {
        usersTable.innerHTML = '';
        
        usersToRender.forEach(user => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.role}</td>
                <td>${user.email}</td>
                <td><span class="badge ${user.status === 'Active' ? 'active' : 'inactive'}">${user.status}</span></td>
                <td>${user.lastLogin}</td>
                <td>
                    <button class="btn-sm btn-primary" onclick="editUser('${user.id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn-sm btn-secondary" onclick="viewUserPassword('${user.id}')"><i class="fas fa-lock"></i></button>
                    <button class="btn-sm btn-danger" onclick="deleteUser('${user.id}')"><i class="fas fa-trash"></i></button>
                </td>
            `;
            
            usersTable.appendChild(row);
        });
    }

    function renderSubjectsGrid(subjectsToRender) {
        subjectsGrid.innerHTML = '';
        
        subjectsToRender.forEach(subject => {
            const card = document.createElement('div');
            card.className = 'subject-card';
            
            card.innerHTML = `
                <div class="subject-icon ${subject.type}">
                    <i class="fas fa-${subject.icon}"></i>
                </div>
                <h3>${subject.name}</h3>
                <p>Teachers: ${subject.teachers}</p>
                <p>Classes: ${subject.classes}</p>
                <div class="subject-actions">
                    <button class="btn-sm btn-primary" onclick="editSubject('${subject.id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn-sm btn-danger" onclick="deleteSubject('${subject.id}')"><i class="fas fa-trash"></i></button>
                </div>
            `;
            
            subjectsGrid.appendChild(card);
        });
    }
}

function editUser(userId) {
    const user = users.find(u => u.id === userId);
    if (user) {
        alert(`Edit user: ${user.name}\nThis would open an edit form with user details.`);
    }
}

function viewUserPassword(userId) {
    const user = users.find(u => u.id === userId);
    if (user) {
        alert(`Password for ${user.name}:\n${user.password}\n\nNote: In a real application, passwords should be hashed and not visible to admins.`);
    }
}

function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        const index = users.findIndex(u => u.id === userId);
        if (index !== -1) {
            users.splice(index, 1);
            renderUsersTable(users);
            alert('User deleted successfully!');
        }
    }
}

function editSubject(subjectId) {
    const subject = subjects.find(s => s.id === subjectId);
    if (subject) {
        alert(`Edit subject: ${subject.name}\nThis would open an edit form with subject details.`);
    }
}

function deleteSubject(subjectId) {
    if (confirm('Are you sure you want to delete this subject?')) {
        const index = subjects.findIndex(s => s.id === subjectId);
        if (index !== -1) {
            subjects.splice(index, 1);
            renderSubjectsGrid(subjects);
            alert('Subject deleted successfully!');
        }
    }
}
