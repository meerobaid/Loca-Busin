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