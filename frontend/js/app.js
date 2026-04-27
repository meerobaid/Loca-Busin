// Add this once at the top of your file to use everywhere!
function getCoverImage(imageField) {
    let cover = 'https://via.placeholder.com/300x200';
    if (!imageField) return cover;

    try {
        const parsed = JSON.parse(imageField);
        cover = Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : imageField;
    } catch (e) {
        cover = imageField;
    }

    return cover.startsWith('http') ? cover : `http://localhost:5000${cover.startsWith('/') ? '' : '/'}${cover}`;
}

const API_BASE_URL = 'http://localhost:5000/api';

function getLoggedInUserId() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
        // Decode the token payload (the middle part)
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.user.id;
    } catch (e) {
        return null;
    }
}


/**
 * Fetches all businesses from the API and displays them on the list page.
 */
async function loadBusinesses() {
    const grid = document.getElementById('business-grid');
    if (!grid) return;

    try {
        const response = await fetch(`${API_BASE_URL}/businesses`);
        const businesses = await response.json();

        grid.innerHTML = ''; 

        if (businesses.length === 0) {
            grid.innerHTML = '<p class="text-center">No businesses found.</p>';
            return;
        }

        businesses.forEach(business => {
            // --- NEW UNPACKER LOGIC ---
            let coverPath = 'https://via.placeholder.com/300x200'; // Default fallback
            
            if (business.image) {
                try {
                    // Try to parse the JSON array from the database
                    const imageArray = JSON.parse(business.image);
                    if (Array.isArray(imageArray) && imageArray.length > 0) {
                        coverPath = imageArray[0]; // Take the first image
                    } else {
                        coverPath = business.image; // Fallback if it's somehow not an array
                    }
                } catch (e) {
                    // If parsing fails, it's likely an old single-string entry
                    coverPath = business.image;
                }
            }

            // Clean the path to ensure it starts with / and build the full URL
            const cleanPath = coverPath.startsWith('/') ? coverPath : `/${coverPath}`;
            const finalImageUrl = coverPath.startsWith('http') 
                ? coverPath 
                : `http://localhost:5000${cleanPath}`;

            const card = document.createElement('div');
            card.className = 'col-md-4 mb-4';
            card.innerHTML = `
                <div class="card h-100 shadow-sm border-0">
                    <img src="${finalImageUrl}" class="card-img-top" alt="${business.name}" style="height: 200px; object-fit: cover;">
                    <div class="card-body">
                        <h5 class="card-title fw-bold">${business.name}</h5>
                        <p class="card-text text-muted mb-3">${business.category}</p>
                        <div class="d-grid">
                            <a href="business-detail.html?id=${business.id}" class="btn btn-primary">View Details</a>
                        </div>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    } catch (error) {
        grid.innerHTML = '<p class="text-danger text-center">Failed to load businesses. Please try again later.</p>';
        console.error('Error fetching businesses:', error);
    }
}

async function loadBusinessDetails() {
    const contentArea = document.getElementById('business-detail-content');
    if (!contentArea) return;

    const urlParams = new URLSearchParams(window.location.search);
    const businessId = urlParams.get('id');

    if (!businessId) {
        contentArea.innerHTML = '<p class="text-danger">No business ID provided.</p>';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/businesses/${businessId}`);
        const business = await response.json();

        if (!response.ok) {
            throw new Error(business.msg || 'Business not found');
        }

        // // This ensures we only track a visit if the business actually exists
        // trackUserVisit(businessId);

        const token = localStorage.getItem('token');

        // --- IMAGE ARRAY LOGIC ---
        let imageArray = [];
        let finalBannerUrl = 'https://via.placeholder.com/600x400';
        
        if (business.image) {
            try {
                const parsed = JSON.parse(business.image);
                imageArray = Array.isArray(parsed) ? parsed : [business.image];
            } catch (e) {
                imageArray = [business.image];
            }
        }

        // Set the main banner URL from the first image
        if (imageArray.length > 0) {
            const path = imageArray[0];
            const cleanPath = path.startsWith('/') ? path : `/${path}`;
            finalBannerUrl = path.startsWith('http') ? path : `http://localhost:5000${cleanPath}`;
        }

        // --- GENERATE GALLERY HTML ---
        let galleryHTML = '';
        if (imageArray.length > 1) {
            galleryHTML = '<div class="row mt-3 mb-4">';
            imageArray.forEach((img) => {
                const clean = img.startsWith('/') ? img : `/${img}`;
                const url = img.startsWith('http') ? img : `http://localhost:5000${clean}`;
                galleryHTML += `
                    <div class="col-3 col-md-2 mb-2">
                        <img src="${url}" class="img-thumbnail rounded shadow-sm" 
                             style="height: 70px; width: 100%; object-fit: cover; cursor: pointer;"
                             onclick="document.querySelector('.business-banner').style.backgroundImage = 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(&quot;${url}&quot;)'">
                    </div>`;
            });
            galleryHTML += '</div>';
        }

        const bookingFormHTML = `
             <h5 class="card-title">Book an Appointment</h5>
             <form id="booking-form" data-business-id="${business.id}">
                 <div class="mb-3">
                     <label for="booking-date" class="form-label">Select Date & Time</label>
                     <input type="datetime-local" class="form-control" id="booking-date" required>
                 </div>
                 <div class="mb-3">
                     <label for="quantity" class="form-label">Quantity</label>
                     <input type="number" class="form-control" id="quantity" value="1" min="1" required>
                 </div>
                 <button type="submit" class="btn btn-primary w-100">Confirm Booking</button>
             </form>
         `;

        const reviewFormHTML = `
             <hr>
             <h3 class="mt-4">Write a Review ✍️</h3>
             <form id="review-form">
                 <div class="mb-3">
                     <label for="rating" class="form-label">Rating</label>
                     <select class="form-select" id="rating" required>
                         <option value="">Choose a rating...</option>
                         <option value="5">5 Stars ⭐⭐⭐⭐⭐</option>
                         <option value="4">4 Stars ⭐⭐⭐⭐</option>
                         <option value="3">3 Stars ⭐⭐⭐</option>
                         <option value="2">2 Stars ⭐⭐</option>
                         <option value="1">1 Star ⭐</option>
                     </select>
                 </div>
                 <div class="mb-3">
                     <label for="comment" class="form-label">Comment</label>
                     <textarea class="form-control" id="comment" rows="3"></textarea>
                 </div>
                 <button type="submit" class="btn btn-primary">Submit Review</button>
             </form>
         `;

        contentArea.innerHTML = `
            <div class="business-banner mb-4 text-white d-flex align-items-end p-4 rounded shadow" 
                 style="background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${finalBannerUrl}'); 
                        background-size: cover; background-position: center; height: 350px; transition: 0.3s;"> 
                <h1 class="display-4 fw-bold">${business.name}</h1>
            </div>
            <div class="row">
                <div class="col-md-8">
                    <h2 class="fw-bold">About Us</h2>
                    <p class="lead">${business.description || 'No description provided.'}</p>
                    
                    ${galleryHTML} <h2 class="mt-5 fw-bold">Recent Reviews</h2>
                    <div id="reviews-list" class="mb-4"></div>

                    ${token ? reviewFormHTML : '<p class="mt-4 p-3 bg-light rounded text-center"><a href="login.html">Log in</a> to write a review.</p>'}
                </div>
                <div class="col-md-4">
                    <div class="card shadow-sm border-0">
                        <div class="card-body">
                            <h5 class="card-title fw-bold">Contact & Location</h5>
                            <hr>
                            <p class="mb-2"><strong>📁 Category:</strong> <span class="badge bg-info text-dark">${business.category}</span></p>
                            <p class="mb-2"><strong>📍 Address:</strong> ${business.address || 'Not available'}</p>
                            <p class="mb-3"><strong>📞 Phone:</strong> ${business.phone || 'Not available'}</p>
                            <hr>
                            ${token ? bookingFormHTML : '<a href="login.html" class="btn btn-primary w-100 py-2 fw-bold">Login to Book</a>'}
                        </div>
                    </div>
                </div>
            </div>
        `;

        loadReviews(businessId);

    } catch (error) {
        contentArea.innerHTML = `<p class="text-danger text-center">Failed to load business details.</p>`;
        console.error('Error fetching business details:', error);
    }
}

// Add the Helper Function
async function trackUserVisit(businessId) {
    // Check if user is logged in
    const token = localStorage.getItem('token'); 
    const userData = JSON.parse(localStorage.getItem('user')); 

    if (!token || !userData) return; 

    try {
        await fetch(`${API_BASE_URL}/api/activity/track`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // If your route is protected
            },
            body: JSON.stringify({ 
                user_id: userData.id, 
                business_id: businessId 
            })
        });
    } catch (error) {
        console.error("Tracking Error:", error);
    }
}


// ==========================================
// --- User Registration Logic ---
// ==========================================
const registerForm = document.getElementById('register-form');

if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Stop the form from reloading the page

        // Get the values from the form fields
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Find out which radio button they clicked (Customer vs Owner)
        const role = document.querySelector('input[name="role"]:checked').value;

        try {
            // Send the data (including the role!) to our backend
            const response = await fetch(`${API_BASE_URL}/users/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password, role }), 
            });

            const data = await response.json();

            if (!response.ok) {
                // If the server responded with an error, throw it
                throw new Error(data.msg || 'Registration failed');
            }

            // If registration is successful, alert and send to login page
            alert('Registration successful! Please log in with your new account.');
            window.location.href = 'login.html'; 

        } catch (error) {
            // Show any errors in an alert box
            alert(error.message);
        }
    });
}


// ==========================================
// --- User Login Logic ---
// ==========================================
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

            // If login is successful, save token
            localStorage.setItem('token', data.token);
            
            // This saves the ID, Role, and Name so the recommendation system can use them
            localStorage.setItem('user', JSON.stringify(data.user));
            alert('Login successful!');
            // The smart redirect "Traffic Cop"
            if (data.user.role === 'admin') {
                window.location.href = 'admin.html'; // Send Admins to Admin Panel
            } else if (data.user.role === 'owner') {
                window.location.href = 'owner-dashboard.html'; // Send Owners to their Dashboard
            } else {
                window.location.href = 'index.html'; // Send regular Customers to the home page
            }
            
        } catch (error) {
            alert(error.message);
        }
    });
}

// ==========================================
// --- User Logout Logic ---
// ==========================================
const logoutButton = document.getElementById('logout-button');

if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('token');
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


// --- Admin Panel: Load ALL Bookings ---
async function loadAllBookings() {
    const tbody = document.getElementById('all-bookings-tbody');
    if (!tbody) return; 

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch(`${API_BASE_URL}/bookings/all`, {
            method: 'GET',
            headers: { 'x-auth-token': token }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch all bookings. Check admin access.');
        }

        const bookings = await response.json();
        
        if (bookings.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No bookings found in the system.</td></tr>';
            return;
        }

        tbody.innerHTML = bookings.map(booking => `
            <tr>
                <td><strong>${booking.user_name}</strong></td>
                <td>${booking.user_email}</td>
                <td>${booking.business_name}</td>
                <td>${new Date(booking.booking_date).toLocaleString()}</td>
                <td>${booking.quantity || 1}</td>
                <td><span class="badge bg-success">${booking.status || 'Confirmed'}</span></td>
            </tr>
        `).join('');

    } catch (error) {
        console.error('Error loading all bookings:', error);
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Error: ${error.message}</td></tr>`;
    }
}


// Call the function when the admin page loads
if (document.getElementById('business-list-tbody')) {
    loadAdminBusinesses();
}

// --- Admin Panel: Add Business Form Logic ---

// --- Admin Panel: Add Business Form Logic (FINAL FIX) ---
const addBusinessForm = document.getElementById('add-business-form');

if (addBusinessForm) {
    addBusinessForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const token = localStorage.getItem('token'); 
        
        if (!token) {
            alert('Your session has expired. Please log in again.');
            return;
        }

        // 🌟 CRUCIAL CHANGE: Initialize FormData using the form element
        // This automatically includes ALL fields with a 'name' attribute, including the file.
        const formData = new FormData(addBusinessForm);
        
        // No Content-Type header is needed for FormData

        try {
            const response = await fetch(`${API_BASE_URL}/businesses`, {
                method: 'POST',
                headers: {
                    'x-auth-token': token // Only the token header is needed
                },
                body: formData // Send the FormData object
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.msg || 'Failed to create business.');
            }
            
            alert('Business added successfully!');
            addBusinessForm.reset();
            loadAdminBusinesses();

        } catch (error) {
            console.error('Error adding business:', error);
            alert(`Error: ${error.message}`);
        }
    });
}


// --- Admin Panel: Delete Business Logic ---
const businessTableBody = document.getElementById('business-list-tbody');
if (businessTableBody) {
    businessTableBody.addEventListener('click', async (event) => {
        if (event.target.classList.contains('delete-btn')) {
            const businessId = event.target.dataset.id;
            const token = localStorage.getItem('token'); // <-- Get the token

            if (!token) {
                alert('Your session has expired. Please log in again.');
                return;
            }

            if (confirm(`Are you sure you want to delete business #${businessId}?`)) {
                try {
                    const response = await fetch(`${API_BASE_URL}/businesses/${businessId}`, {
                        method: 'DELETE',
                        headers: {
                            'x-auth-token': token // <-- Add the token here
                        }
                    });

                    if (!response.ok) {
                        throw new Error('Failed to delete business. You may not be authorized.');
                    }
                    
                    alert('Business deleted successfully!');
                    loadAdminBusinesses();

                } catch (error) {
                    console.error('Error deleting business:', error);
                    alert(error.message);
                }
            }
        }
    });
}

// --- Admin Panel: Edit Business Logic ---
const editBusinessModal = document.getElementById('editBusinessModal');
const editBusinessForm = document.getElementById('edit-business-form');
let editModal;

if (editBusinessModal) {
    editModal = new bootstrap.Modal(editBusinessModal);
}

// Listen for clicks in the table to handle EDIT
if (businessTableBody) {
    businessTableBody.addEventListener('click', async (event) => {
        if (event.target.classList.contains('edit-btn')) {
            const businessId = event.target.dataset.id;
            
            const response = await fetch(`${API_BASE_URL}/businesses/${businessId}`);
            const business = await response.json();
            
            // --- SAFETY CHECK FOR ADMIN IDs ---
            const idEl = document.getElementById('edit-business-id');
            if (!idEl) return; // Exit if we are not on the Admin page [cite: 278]

            idEl.value = business.id;
            document.getElementById('edit-name').value = business.name;
            document.getElementById('edit-category').value = business.category;
            // Use optional chaining or checks to avoid null crashes
            if(document.getElementById('edit-address')) document.getElementById('edit-address').value = business.address || '';
            if(document.getElementById('edit-phone')) document.getElementById('edit-phone').value = business.phone || '';
            if(document.getElementById('edit-description')) document.getElementById('edit-description').value = business.description || '';

            editModal.show();
        }
    });
}

// Listen for the submission of the edit form
if (editBusinessForm) {
    editBusinessForm.addEventListener('submit', async (event) => {
        const adminIdInput = document.getElementById('edit-business-id');
        
        // --- THE CRITICAL FIX ---
        // If 'edit-business-id' is missing, this is the Owner Dashboard. 
        // Stop this Admin function so the Owner function can run instead! 
        if (!adminIdInput) return; 

        event.preventDefault();
        const token = localStorage.getItem('token'); 
        if (!token) {
            alert('Your session has expired.');
            return;
        }

        const id = adminIdInput.value;
        const updatedData = {
            name: document.getElementById('edit-name').value,
            category: document.getElementById('edit-category').value,
            description: document.getElementById('edit-description').value
            // Only add capacity if that ID exists in your Admin HTML
        };

        try {
            const response = await fetch(`${API_BASE_URL}/businesses/${id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-auth-token': token 
                },
                body: JSON.stringify(updatedData)
            });

            if (response.ok) {
                alert('Business updated successfully!');
                editModal.hide();
                if (typeof loadAdminBusinesses === 'function') loadAdminBusinesses();
            }
        } catch (error) {
            console.error('Error updating business:', error);
        }
    });
}

//New Code Added
// --- ADMIN PANEL: VIEW SWITCHER ---
function showAdminView(viewId) {
    // List all the possible views (div IDs) in your admin.html
    const adminViews = [
        'dashboard-stats-view', 
        'admin-content-area', 
        'all-bookings-view'
    ];

    // 1. Hide every view first
    adminViews.forEach(id => {
        const viewEl = document.getElementById(id);
        if (viewEl) {
            viewEl.style.display = 'none';
        }
    });

    // 2. Show the specific view we want
    const activeView = document.getElementById(viewId);
    if (activeView) {
        activeView.style.display = 'block';
        console.log(`Showing Admin View: ${viewId}`);
    } else {
        console.warn(`Warning: View ID "${viewId}" not found in HTML.`);
    }
}

// End OF NEW CODE

// --- Dynamic Navbar Logic ---
function renderNavbar() {
    const token = localStorage.getItem('token');
    const navbarLinks = document.getElementById('navbar-links');

    if (!navbarLinks) return;

    if (token) {
        // User is logged in
        navbarLinks.innerHTML = `
            <li class="nav-item"><a class="nav-link" href="dashboard.html">Dashboard</a></li>
            <li class="nav-item"><a class="nav-link" href="#" id="logout-link">Logout</a></li>
        `;
        // Add event listener for the new logout link
        const logoutLink = document.getElementById('logout-link');
        if (logoutLink) {
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('token');
                alert('You have been logged out.');
                window.location.href = 'index.html';
            });
        }
    } else {
        // User is logged out
        navbarLinks.innerHTML = `
            <li class="nav-item"><a class="nav-link" href="business-list.html">Browse Businesses</a></li>
            <li class="nav-item"><a class="nav-link" href="login.html">Login</a></li>
            <li class="nav-item"><a class="btn btn-primary ms-2" href="register.html">Sign Up</a></li>
        `;
    }
}


// --- Create Booking Logic ---
const detailContent = document.getElementById('business-detail-content');

if (detailContent) {
    // Use event delegation to listen for the form submission
    detailContent.addEventListener('submit', async (event) => {
        if (event.target.id === 'booking-form') {
            event.preventDefault();

            const token = localStorage.getItem('token');
            if (!token) {
                alert('You must be logged in to make a booking.');
                return;
            }

            const business_id = event.target.dataset.businessId;
            const booking_date = document.getElementById('booking-date').value;

            try {
                const response = await fetch(`${API_BASE_URL}/bookings`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': token
                    },
                    body: JSON.stringify({ business_id, booking_date })
                });

                if (!response.ok) {
                    throw new Error('Booking failed. Please try again.');
                }

                alert('Booking successful!');

            } catch (error) {
                console.error('Error creating booking:', error);
                alert(error.message);
            }
        }
    });
}

// --- Dashboard: Load User's Bookings ---
async function loadMyBookings() {
    const bookingsList = document.getElementById('my-bookings-list');
    if (!bookingsList) return; // Only run on the dashboard page

    const token = localStorage.getItem('token');
    if (!token) return; // Don't run if user is not logged in

    try {
        const response = await fetch(`${API_BASE_URL}/bookings/mybookings`, {
            method: 'GET',
            headers: {
                'x-auth-token': token
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch bookings');
        }

        const bookings = await response.json();

        if (bookings.length === 0) {
            bookingsList.innerHTML = '<p>You have not made any bookings yet.</p>';
            return;
        }

        // Create HTML for each booking
        bookingsList.innerHTML = bookings.map(booking => `
            <div class="card mb-3">
                <div class="card-body d-flex justify-content-between align-items-center">
                    <div>
                        <h5 class="card-title">${booking.business_name}</h5>
                        <p class="card-text mb-0">
                            <strong>Date:</strong> ${new Date(booking.booking_date).toLocaleString()}
                            <br>
                            <strong>Status:</strong> <span class="badge bg-success">${booking.status}</span>
                        </p>
                    </div>
                    <button class="btn btn-outline-danger cancel-booking-btn" data-id="${booking.booking_id}">Cancel</button>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading bookings:', error);
        bookingsList.innerHTML = '<p class="text-danger">Could not load your bookings.</p>';
    }
}
// Run this function when the DOM is loaded
document.addEventListener('DOMContentLoaded', loadMyBookings);


// --- Dashboard: Cancel Booking Logic ---
const myBookingsList = document.getElementById('my-bookings-list');

if (myBookingsList) {
    myBookingsList.addEventListener('click', async (event) => {
        if (event.target.classList.contains('cancel-booking-btn')) {
            const bookingId = event.target.dataset.id;
            const token = localStorage.getItem('token');

            if (confirm(`Are you sure you want to cancel this booking?`)) {
                try {
                    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
                        method: 'DELETE',
                        headers: {
                            'x-auth-token': token
                        }
                    });

                    if (!response.ok) {
                        throw new Error('Failed to cancel booking');
                    }
                    
                    alert('Booking cancelled successfully!');
                    loadMyBookings(); // Reload the booking list

                } catch (error) {
                    console.error('Error cancelling booking:', error);
                    alert('Error: Could not cancel booking.');
                }
            }
        }
    });
}


// --- Load Reviews for a Business ---
async function loadReviews(businessId) {
    const reviewsList = document.getElementById('reviews-list');
    if (!reviewsList) return;

    const loggedInUserId = getLoggedInUserId(); // Gets the current user's ID

    try {
        const response = await fetch(`${API_BASE_URL}/reviews/${businessId}`);
        const reviews = await response.json();

        if (reviews.length === 0) {
            reviewsList.innerHTML = '<p>No reviews yet. Be the first to write one!</p>';
            return;
        }

        reviewsList.innerHTML = reviews.map(review => {
            const isOwner = loggedInUserId === review.user_id;
            
            // This block creates the Edit and Delete buttons only if the user is the owner
            const ownerButtonsHTML = isOwner ? `
                <div>
                    <button class="btn btn-sm btn-outline-secondary edit-review-btn" 
                            data-id="${review.review_id}" 
                            data-rating="${review.rating}" 
                            data-comment="${review.comment || ''}">Edit</button>
                    <button class="btn btn-sm btn-outline-danger delete-review-btn" data-id="${review.review_id}">Delete</button>
                </div>
            ` : '';

            return `
                <div class="card mb-3">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <h6 class="card-title">${review.reviewer_name}</h6>
                            ${ownerButtonsHTML}
                        </div>
                        <p class="card-text">${'⭐'.repeat(review.rating)}</p>
                        <p class="card-text">${review.comment}</p>
                        <small class="text-muted">Posted on ${new Date(review.created_at).toLocaleDateString()}</small>
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Error loading reviews:', error);
        reviewsList.innerHTML = '<p class="text-danger">Could not load reviews.</p>';
    }
}

// --- Submit a New Review ---
if (detailContent) { // We can reuse the detailContent variable from the booking logic
    detailContent.addEventListener('submit', async (event) => {
        if (event.target.id === 'review-form') {
            event.preventDefault();
            
            const token = localStorage.getItem('token');
            const urlParams = new URLSearchParams(window.location.search);
            const business_id = urlParams.get('id');

            const rating = document.getElementById('rating').value;
            const comment = document.getElementById('comment').value;

            try {
                const response = await fetch(`${API_BASE_URL}/reviews`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': token
                    },
                    body: JSON.stringify({ business_id, rating, comment })
                });

                if (!response.ok) {
                    throw new Error('Failed to post review. You may have already reviewed this business.');
                }
                
                alert('Review submitted successfully!');
                document.getElementById('review-form').reset(); // Clear the form
                loadReviews(business_id); // Reload the reviews to show the new one

            } catch (error) {
                console.error('Error submitting review:', error);
                alert(error.message);
            }
        }
    });
}

// --- Delete a Review Logic ---
const detailContentForReviews = document.getElementById('business-detail-content');
if (detailContentForReviews) {
    detailContentForReviews.addEventListener('click', async (event) => {
        // Check if a button with the class 'delete-review-btn' was clicked
        if (event.target.classList.contains('delete-review-btn')) {
            const reviewId = event.target.dataset.id;
            const token = localStorage.getItem('token');

            if (!token) {
                alert('Your session has expired. Please log in again.');
                return;
            }

            if (confirm('Are you sure you want to delete this review?')) {
                try {
                    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
                        method: 'DELETE',
                        headers: { 'x-auth-token': token }
                    });

                    if (!response.ok) {
                        throw new Error('Failed to delete review. You may not be authorized.');
                    }

                    alert('Review deleted successfully!');
                    // Reload reviews for the current business
                    const urlParams = new URLSearchParams(window.location.search);
                    const businessId = urlParams.get('id');
                    loadReviews(businessId);

                } catch (error) {
                    console.error('Error deleting review:', error);
                    alert(error.message);
                }
            }
        }
    });
}


// --- Edit a Review Logic ---
const editReviewModalEl = document.getElementById('editReviewModal');
const editReviewForm = document.getElementById('edit-review-form');
let editReviewModal; 

if (editReviewModalEl) {
    editReviewModal = new bootstrap.Modal(editReviewModalEl);
}

// Use the main content ID for the click listener
const mainDetailContent = document.getElementById('business-detail-content'); 

if (mainDetailContent) { // Check that the main content div exists
    // Listen for clicks on the static parent element
    mainDetailContent.addEventListener('click', (event) => {
        if (event.target.classList.contains('edit-review-btn')) {
            const button = event.target;

            // Populate the modal form...
            document.getElementById('edit-review-id').value = button.dataset.id;
            document.getElementById('edit-rating').value = button.dataset.rating;
            document.getElementById('edit-comment').value = button.dataset.comment;

            if (editReviewModal) { 
                 editReviewModal.show(); 
            } else {
                 alert("Error: Modal initialization failed. Check Bootstrap JS.");
            }
        }
    });
}

// Listen for the submission of the edit form to save changes
if (editReviewForm) {
    editReviewForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const reviewId = document.getElementById('edit-review-id').value;
        const token = localStorage.getItem('token');
        
        const updatedReview = {
            rating: document.getElementById('edit-rating').value,
            comment: document.getElementById('edit-comment').value
        };

        try {
            const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-auth-token': token 
                },
                body: JSON.stringify(updatedReview)
            });

            if (!response.ok) {
                throw new Error('Failed to update review.');
            }
            
            alert('Review updated successfully!');
            editReviewModal.hide(); // Hide the modal
            
            // Reload the reviews to show the changes
            const urlParams = new URLSearchParams(window.location.search);
            const businessId = urlParams.get('id');
            loadReviews(businessId);

        } catch (error) {
            console.error('Error updating review:', error);
            alert(error.message);
        }
    });
}

// --- Admin Dashboard Stats Logic ---

async function loadAdminStats() {
    const statsContainer = document.getElementById('stats-container');
    if (!statsContainer) return;

    const token = localStorage.getItem('token');
    if (!token) return; // Must be logged in

    try {
        const response = await fetch(`${API_BASE_URL}/admin/stats`, {
            headers: {
                'x-auth-token': token
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch stats. Access denied.');
        }

        const stats = await response.json();

        statsContainer.innerHTML = `
            <div class="col-md-4 mb-3">
                <div class="card text-white bg-primary">
                    <div class="card-body">
                        <h5 class="card-title">${stats.totalUsers}</h5>
                        <p class="card-text">Total Users</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4 mb-3">
                <div class="card text-white bg-success">
                    <div class="card-body">
                        <h5 class="card-title">${stats.totalBusinesses}</h5>
                        <p class="card-text">Total Businesses</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4 mb-3">
                <div class="card text-white bg-warning">
                    <div class="card-body">
                        <h5 class="card-title">${stats.totalBookings}</h5>
                        <p class="card-text">Total Bookings</p>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading admin stats:', error);
        statsContainer.innerHTML = `<div class="col-md-12 text-danger">Error: ${error.message}</div>`;
    }
}

// Ensure stats load when admin page is loaded
if (document.getElementById('stats-container')) {
    loadAdminStats();
}

// --- Consolidated DOMContentLoaded Listener ---
document.addEventListener('DOMContentLoaded', () => {
    
    // Always render the navbar
    renderNavbar(); 

    // --- Logic for Business List Page ---
    const businessGrid = document.getElementById('business-grid');
   if (document.getElementById('business-grid')) {
    renderNavbar(); 
    loadBusinesses(); // Call loadBusinesses directly without search parameters
}

    // --- Logic for Dashboard Page ---
    if (document.getElementById('my-bookings-list')) {
        loadMyBookings();
    }

    // --- Logic for Admin Page ---
const adminContentArea = document.getElementById('admin-content-area');
if (adminContentArea) {
    // 1. Initialize Admin Modals
    const editBusinessModalEl = document.getElementById('editBusinessModal');
    if (editBusinessModalEl && typeof bootstrap !== 'undefined') {
        editModal = new bootstrap.Modal(editBusinessModalEl);
    }
    
    // 2. THE FIX: Only call showAdminView for a section you HAVE
    showAdminView('admin-content-area'); 
}

    // --- Logic for Business Detail Page ---
    if (document.getElementById('business-detail-content')) {
        // Initialize Edit Review Modal
        const editReviewModalEl = document.getElementById('editReviewModal');
        if (editReviewModalEl && typeof bootstrap !== 'undefined' && typeof bootstrap.Modal !== 'undefined') {
             editReviewModal = new bootstrap.Modal(editReviewModalEl); // Ensure editReviewModal is global
        }
        loadBusinessDetails();
    }
});

// --- ADMIN PANEL: SIDEBAR MENU LOGIC ---
const viewBookingsBtn = document.getElementById('view-bookings-btn');
const manageBusinessesBtn = document.getElementById('manage-businesses-btn');
const adminContentArea = document.getElementById('admin-content-area');
const allBookingsView = document.getElementById('all-bookings-view');

if (viewBookingsBtn && manageBusinessesBtn && adminContentArea && allBookingsView) {
    // 1. When "View All Bookings" is clicked
    viewBookingsBtn.addEventListener('click', (e) => {
        e.preventDefault(); // Stop page refresh
        
        // Hide Businesses, Show Bookings
        adminContentArea.style.display = 'none';
        allBookingsView.style.display = 'block';
        
        // Move the blue "active" highlight to the bookings button
        viewBookingsBtn.classList.add('active');
        manageBusinessesBtn.classList.remove('active');

        // Fetch the data from the backend!
        if (typeof loadAllBookings === 'function') {
            loadAllBookings(); 
        } else {
            console.error("loadAllBookings function is missing!");
        }
    });

    // 2. When "Manage Businesses" is clicked
    manageBusinessesBtn.addEventListener('click', (e) => {
        e.preventDefault(); // Stop page refresh
        
        // Hide Bookings, Show Businesses
        allBookingsView.style.display = 'none';
        adminContentArea.style.display = 'block';
        
        // Move the blue "active" highlight back
        manageBusinessesBtn.classList.add('active');
        viewBookingsBtn.classList.remove('active');

        // Fetch businesses data
        if (typeof loadAdminBusinesses === 'function') {
            loadAdminBusinesses();
        }
    });
}
// ==========================================
// --- OWNER DASHBOARD LOGIC ---
// ==========================================

// --- 1. LOAD USER'S BUSINESSES ---
async function loadOwnerBusinesses() {
    const tbody = document.getElementById('owner-business-list-tbody');
    if (!tbody) return;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/businesses/my-businesses`, {
            headers: { 'x-auth-token': token }
        });

        if (!response.ok) throw new Error('Failed to fetch businesses');
        const businesses = await response.json();

        tbody.innerHTML = ''; 
        
        if (businesses.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">You haven\'t added any businesses yet.</td></tr>';
            return;
        }

        businesses.forEach(bus => {
            let coverImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
            if (bus.image) {
                try {
                    const imageArray = JSON.parse(bus.image);
                    if (Array.isArray(imageArray) && imageArray.length > 0) {
                        coverImage = imageArray[0];
                    }
                } catch (e) {
                    coverImage = bus.image; 
                }
            }
            
            const fullImageUrl = coverImage.startsWith('http') ? coverImage : `http://localhost:5000${coverImage.startsWith('/') ? '' : '/'}${coverImage}`;

            tbody.innerHTML += `
                <tr>
                    <td><img src="${fullImageUrl}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;"></td>
                    <td class="fw-bold align-middle">${bus.name}</td>
                    <td class="align-middle">${bus.category}</td>
                    <td class="align-middle">${bus.capacity || 'N/A'}</td>
                    <td class="align-middle">
                        <div class="btn-group">
                            <button class="btn btn-sm btn-outline-primary" onclick="openEditModal(${bus.id})">Edit</button>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteOwnerBusiness(${bus.id})">Delete</button>
                        </div>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error(error);
        tbody.innerHTML = `<tr><td colspan="5" class="text-danger text-center">Error loading businesses.</td></tr>`;
    }
}

// --- 2. ADD NEW BUSINESS LOGIC ---
const ownerAddBusinessForm = document.getElementById('owner-add-business-form');
if (ownerAddBusinessForm) {
    ownerAddBusinessForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(ownerAddBusinessForm); 
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`${API_BASE_URL}/businesses`, {
                method: 'POST',
                headers: { 'x-auth-token': token },
                body: formData
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.msg || 'Failed to add business');

            alert('Business added successfully!');
            ownerAddBusinessForm.reset();
            loadOwnerBusinesses(); 

        } catch (error) {
            alert('Error: ' + error.message);
        }
    });
}

// --- 3. LOAD BOOKINGS FOR OWNER ---
async function loadOwnerBookings() {
    const tbody = document.getElementById('owner-bookings-tbody');
    const bookingsView = document.getElementById('owner-bookings-view');
    
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="6" class="text-center">Loading Data...</td></tr>';

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/bookings/my-bookings`, {
            headers: { 'x-auth-token': token }
        });

        if (!response.ok) throw new Error("Server error: " + response.status);
        const bookings = await response.json();

        tbody.innerHTML = '';

        if (!bookings || bookings.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4">No bookings found.</td></tr>';
        } else {
            bookings.forEach(booking => {
                const date = booking.booking_date ? new Date(booking.booking_date).toLocaleDateString() : 'N/A';
                const status = (booking.status || 'pending').toLowerCase();
                let badgeClass = status === 'confirmed' ? 'bg-success' : (status === 'cancelled' ? 'bg-danger' : 'bg-warning text-dark');

                const actions = (status === 'pending') ? `
                    <div class="btn-group">
                        <button class="btn btn-sm btn-success" onclick="updateBookingStatus(${booking.id}, 'confirmed')">Confirm</button>
                        <button class="btn btn-sm btn-outline-danger" onclick="updateBookingStatus(${booking.id}, 'cancelled')">Cancel</button>
                    </div>
                ` : `<span class="text-muted small">Processed</span>`;

                tbody.innerHTML += `
                    <tr>
                        <td class="fw-bold">👤 ${booking.customer_name || 'Guest'}</td>
                        <td>${booking.business_name || 'Business'}</td>
                        <td>${date}</td>
                        <td class="text-center">${booking.quantity || 1}</td>
                        <td><span class="badge ${badgeClass}">${status.toUpperCase()}</span></td>
                        <td>${actions}</td>
                    </tr>
                `;
            });
        }
    } catch (error) {
        console.error("Load Error:", error);
        tbody.innerHTML = `<tr><td colspan="6" class="text-danger text-center">Error: ${error.message}</td></tr>`;
    }
}

// --- 4. UPDATE BOOKING STATUS ---
async function updateBookingStatus(bookingId, newStatus) {
    if (!confirm(`Are you sure you want to change this booking to ${newStatus}?`)) return;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/bookings/update-status`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'x-auth-token': token 
            },
            body: JSON.stringify({ bookingId, status: newStatus })
        });

        if (!response.ok) throw new Error('Failed to update status');
        alert(`Booking has been ${newStatus}!`);
        loadOwnerBookings();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// --- 5. DELETE BUSINESS LOGIC ---
async function deleteOwnerBusiness(businessId) {
    if (!confirm('Are you sure you want to delete this business?')) return;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/businesses/${businessId}`, {
            method: 'DELETE',
            headers: { 'x-auth-token': token }
        });

        if (!response.ok) throw new Error('Failed to delete');
        alert('Business deleted successfully!');
        loadOwnerBusinesses(); 
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// --- 6. EDIT MODAL LOGIC (OPEN & SAVE) ---
async function openEditModal(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/businesses/${id}`);
        if (!response.ok) throw new Error("Could not fetch business details");
        const bus = await response.json();

        const idEl = document.getElementById('edit-id');
        const nameEl = document.getElementById('edit-name');
        const catEl = document.getElementById('edit-category');
        const descEl = document.getElementById('edit-description');

        if (!idEl || !nameEl || !catEl || !descEl) {
            console.error("❌ Modal IDs not found in HTML.");
            return;
        }

        idEl.value = bus.id;
        nameEl.value = bus.name;
        catEl.value = bus.category;
        descEl.value = bus.description || '';

        const modalElement = document.getElementById('editBusinessModal');
        let modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
        modalInstance.show();
    } catch (error) {
        console.error("Open Modal Error:", error);
    }
}

// Initialize Save Changes Listener Once
document.addEventListener('submit', async (e) => {
    if (e.target.id === 'edit-business-form') {
        e.preventDefault();
        if (document.activeElement) document.activeElement.blur();

        const idEl = document.getElementById('edit-id');
        const nameEl = document.getElementById('edit-name');
        const catEl = document.getElementById('edit-category');
        const descEl = document.getElementById('edit-description');

        if (!idEl || !nameEl || !catEl || !descEl) return;

        const updatedData = {
            name: nameEl.value,
            category: catEl.value,
            description: descEl.value
        };

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/businesses/${idEl.value}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(updatedData)
            });

            if (response.ok) {
                alert("Business updated successfully!");
                const modalInstance = bootstrap.Modal.getInstance(document.getElementById('editBusinessModal'));
                if (modalInstance) modalInstance.hide();
                loadOwnerBusinesses();
            } else {
                alert("Failed to update.");
            }
        } catch (error) {
            console.error("Update error:", error);
        }
    }
});

// --- 7. VIEW SWITCHER & INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    const manageBtn = document.getElementById('owner-manage-btn');
    const bookingsBtn = document.getElementById('owner-bookings-btn');

    if (manageBtn && bookingsBtn) {
        manageBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('owner-bookings-view').style.display = 'none';
            document.getElementById('owner-businesses-view').style.display = 'block';
            manageBtn.classList.add('active');
            bookingsBtn.classList.remove('active');
            loadOwnerBusinesses();
        });

        bookingsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('owner-businesses-view').style.display = 'none';
            document.getElementById('owner-bookings-view').style.display = 'block';
            bookingsBtn.classList.add('active');
            manageBtn.classList.remove('active');
            loadOwnerBookings();
        });
    }

    // Auto-load businesses if on the owner dashboard
    if (document.getElementById('owner-business-list-tbody')) {
        loadOwnerBusinesses();
    }
});

// Add this anywhere in your app.js
async function trackUserVisit(businessId) {
    // 1. Silent Check: If these don't exist, just stop without any errors
    const token = localStorage.getItem('token'); 
    const userData = JSON.parse(localStorage.getItem('user')); 

    if (!token || !userData || !businessId || businessId === 'undefined') {
        return; 
    }

    // 2. Background Task: Use a try/catch so a network error won't stop the site
    try {
        await fetch(`${API_BASE_URL}/activity/track`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ 
                user_id: userData.id, 
                business_id: businessId 
            })
        });
    } catch (error) {
        // We log it for you, but the user never sees a problem
        console.warn("Background tracking skipped.");
    }
}


// Load Recommendations For The User

async function loadRecommendations() {
    const userData = JSON.parse(localStorage.getItem('user'));
    const section = document.getElementById('recommendations-section');
    const container = document.getElementById('recommendations-container');

    if (!userData || !container) return;

    try {
        const response = await fetch(`${API_BASE_URL}/activity/recommendations/${userData.id}`);
        const recommended = await response.json();

        // Only show the section if there are actually visits recorded
        if (recommended.length > 0) {
            section.style.display = 'block'; 
            container.innerHTML = ''; // Clear previous content

            recommended.forEach(business => {
                // Reuse your existing business card HTML structure here
                container.innerHTML += `
                    <div class="col-md-3 mb-3">
                        <div class="card shadow-sm h-100">
                            <div class="card-body">
                                <h5 class="card-title">${business.name}</h5>
                                <p class="badge bg-primary">${business.category}</p>
                                <p class="text-muted small">You visited this ${business.visit_count} times</p>
                                <a href="details.html?id=${business.id}" class="btn btn-outline-primary btn-sm w-100">View Again</a>
                            </div>
                        </div>
                    </div>
                `;
            });
            }
            else {
             section.style.display = 'none';
           }
    } catch (error) {
        console.error("Could not load recommendations:", error);
    }
}

// When the page finishes loading, check for recommendations
document.addEventListener('DOMContentLoaded', () => {
    loadRecommendations();
});