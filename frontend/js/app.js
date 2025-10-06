const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Fetches all businesses from the API and displays them on the list page.
 */
async function loadBusinesses() {
    const grid = document.getElementById('business-grid');
    if (!grid) return;

    try {
        const response = await fetch(`${API_BASE_URL}/businesses`);
        const businesses = await response.json();

        grid.innerHTML = ''; // Clear the loading spinner

        businesses.forEach(business => {
            const card = document.createElement('div');
            card.className = 'col-md-4 mb-4';
            card.innerHTML = `
                <div class="card h-100">
                    <img src="${business.image}" class="card-img-top" alt="${business.name}" style="height: 200px; object-fit: cover;">
                    <div class="card-body">
                        <h5 class="card-title">${business.name}</h5>
                        <p class="card-text text-muted">${business.category}</p>
                        <p class="card-text">${'★'.repeat(business.rating)}${'☆'.repeat(5 - business.rating)}</p>
                        <a href="business-detail.html?id=${business.id}" class="btn btn-outline-primary">View Details</a>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    } catch (error) {
        grid.innerHTML = '<p class="text-danger">Failed to load businesses. Please try again later.</p>';
        console.error('Error fetching businesses:', error);
    }
}

/**
 * Fetches details for a single business and displays them on the detail page.
 */
async function loadBusinessDetails() {
    const contentArea = document.getElementById('business-detail-content');
    if (!contentArea) return;

    // Get the business ID from the URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const businessId = urlParams.get('id');

    if (!businessId) {
        contentArea.innerHTML = '<p class="text-danger">No business ID provided.</p>';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/businesses/${businessId}`);
        const business = await response.json();
        
        if (business.error) {
             contentArea.innerHTML = `<p class="text-danger">${business.error}</p>`;
             return;
        }

        contentArea.innerHTML = `
            <div class="business-banner mb-4" style="background-image: url('${business.image}');">
                <h1 class="display-4">${business.name}</h1>
            </div>
            <div class="row">
                <div class="col-md-8">
                    <h2>About Us</h2>
                    <p>${business.description}</p>
                    <hr>
                    <h3>Services</h3>
                    <ul class="list-group">
                        ${business.services.map(service => `<li class="list-group-item d-flex justify-content-between align-items-center">
                            ${service.name}
                            <span class="badge bg-primary rounded-pill">$${service.price}</span>
                        </li>`).join('')}
                    </ul>
                </div>
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Contact & Location</h5>
                            <p><strong>Category:</strong> ${business.category}</p>
                            <p><strong>Address:</strong> ${business.address}</p>
                            <p><strong>Rating:</strong> ${'★'.repeat(business.rating)}${'☆'.repeat(5 - business.rating)}</p>
                            <a href="#" class="btn btn-primary w-100">Book an Appointment</a>
                        </div>
                    </div>
                </div>
            </div>
        `;

    } catch (error) {
        contentArea.innerHTML = '<p class="text-danger">Failed to load business details.</p>';
        console.error('Error fetching business details:', error);
    }
}

// --- NEW --- User Registration Logic ---

// Find the registration form on the page
const registerForm = document.getElementById('register-form');

// Add an event listener only if the form exists on the current page
if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Stop the form from reloading the page

        // Get the values from the form fields
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            // Send the data to our backend registration endpoint
            const response = await fetch(`${API_BASE_URL}/users/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                // If the server responded with an error, show it to the user
                throw new Error(data.msg || 'Registration failed');
            }

            // If registration is successful, save the token and redirect
            localStorage.setItem('token', data.token);
            alert('Registration successful! Redirecting to your dashboard.');
            window.location.href = 'dashboard.html'; // Redirect to the dashboard

        } catch (error) {
            // Show any errors in an alert box
            alert(error.message);
        }
    });
}

// --- User Login Logic ---
const loginForm = document.getElementById('login-form');

if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch(`${API_BASE_URL}/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.msg || 'Login failed');
            }

            // If login is successful, save token and redirect
            localStorage.setItem('token', data.token);
            alert('Login successful! Redirecting to your dashboard.');
            window.location.href = 'dashboard.html';

        } catch (error) {
            alert(error.message);
        }
    });
}

// --- User Logout Logic ---
const logoutButton = document.getElementById('logout-button');

if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        // Remove the token from localStorage
        localStorage.removeItem('token');
        
        // Alert the user and redirect to homepage
        alert('You have been logged out.');
        window.location.href = 'index.html';
    });
}


// --- Admin Panel Logic ---

// Function to load and display businesses in the admin table

async function loadAdminBusinesses() {
    const tbody = document.getElementById('business-list-tbody');
    if (!tbody) return; // Only run if we are on the admin page

    try {
        const response = await fetch(`${API_BASE_URL}/businesses`);
        const businesses = await response.json();

        tbody.innerHTML = ''; // Clear existing rows

        if (businesses.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center">No businesses found.</td></tr>';
            return;
        }

      businesses.forEach(business => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${business.name}</td>
                <td>${business.category}</td>
                <td>
                    <button class="btn btn-sm btn-secondary edit-btn" data-id="${business.id}">Edit</button>
                    <button class="btn btn-sm btn-danger delete-btn" data-id="${business.id}">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading businesses for admin panel:', error);
        tbody.innerHTML = '<tr><td colspan="3" class="text-center text-danger">Failed to load data.</td></tr>';
    }
}

// Call the function when the admin page loads
if (document.getElementById('business-list-tbody')) {
    loadAdminBusinesses();
}

// --- Admin Panel: Add Business Form Logic ---
const addBusinessForm = document.getElementById('add-business-form');

if (addBusinessForm) {
    addBusinessForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default form submission

        // Get the values from the form inputs
        const name = document.getElementById('name').value;
        const category = document.getElementById('category').value;
        const address = document.getElementById('address').value;

        const businessData = { name, category, address };

        try {
            const response = await fetch(`${API_BASE_URL}/businesses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(businessData)
            });

            if (!response.ok) {
                throw new Error('Failed to create business');
            }
            
            alert('Business added successfully!');
            addBusinessForm.reset(); // Clear the form fields
            loadAdminBusinesses(); // Reload the business list to show the new one

        } catch (error) {
            console.error('Error adding business:', error);
            alert('Error: Could not add business.');
        }
    });
}


// --- Admin Panel: Delete Business Logic ---
const businessTableBody = document.getElementById('business-list-tbody');

if (businessTableBody) {
    businessTableBody.addEventListener('click', async (event) => {
        // Check if a delete button was clicked
        if (event.target.classList.contains('delete-btn')) {
            const businessId = event.target.dataset.id; // Get the id from the data-id attribute

            // Confirm before deleting
            if (confirm(`Are you sure you want to delete business #${businessId}?`)) {
                try {
                    const response = await fetch(`${API_BASE_URL}/businesses/${businessId}`, {
                        method: 'DELETE',
                    });

                    if (!response.ok) {
                        throw new Error('Failed to delete business');
                    }
                    
                    alert('Business deleted successfully!');
                    loadAdminBusinesses(); // Reload the list to show the change

                } catch (error) {
                    console.error('Error deleting business:', error);
                    alert('Error: Could not delete business.');
                }
            }
        }
    });
}


// --- Admin Panel: Edit Business Logic ---
const editBusinessModal = document.getElementById('editBusinessModal');
const editBusinessForm = document.getElementById('edit-business-form');
let editModal; // Variable to hold the modal instance

if (editBusinessModal) {
    editModal = new bootstrap.Modal(editBusinessModal);
}

// Listen for clicks in the table to handle EDIT
if (businessTableBody) {
    businessTableBody.addEventListener('click', async (event) => {
        if (event.target.classList.contains('edit-btn')) {
            const businessId = event.target.dataset.id;
            
            // Fetch the specific business's data from the API
            const response = await fetch(`${API_BASE_URL}/businesses/${businessId}`);
            const business = await response.json();
            
            // Populate the modal form with the fetched data
            document.getElementById('edit-business-id').value = business.id;
            document.getElementById('edit-name').value = business.name;
            document.getElementById('edit-category').value = business.category;
            document.getElementById('edit-address').value = business.address;
            document.getElementById('edit-phone').value = business.phone;
            document.getElementById('edit-image').value = business.image;
            document.getElementById('edit-description').value = business.description;

            // Show the modal
            editModal.show();
        }
    });
}

// Listen for the submission of the edit form
if (editBusinessForm) {
    editBusinessForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        // Get the updated data from the form
        const id = document.getElementById('edit-business-id').value;
        const updatedData = {
            name: document.getElementById('edit-name').value,
            category: document.getElementById('edit-category').value,
            address: document.getElementById('edit-address').value,
            phone: document.getElementById('edit-phone').value,
            image: document.getElementById('edit-image').value,
            description: document.getElementById('edit-description').value,
        };

        // Send the PUT request to the API
        try {
            const response = await fetch(`${API_BASE_URL}/businesses/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });

            if (!response.ok) {
                throw new Error('Failed to update business');
            }
            
            alert('Business updated successfully!');
            editModal.hide(); // Hide the modal
            loadAdminBusinesses(); // Refresh the business list

        } catch (error) {
            console.error('Error updating business:', error);
            alert('Error: Could not update business.');
        }
    });
}


