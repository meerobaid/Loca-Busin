const businesses = [
    {
        id: 1,
        name: "The Artisan Bakery",
        category: "Bakery",
        address: "123 Bread St, Foodville",
        rating: 5,
        image: "https://images.unsplash.com/photo-1568254183919-78a4f43a2877?q=80&w=870",
        description: "A family-owned bakery specializing in handcrafted sourdough bread and delightful pastries. We use only the finest local ingredients.",
        services: [
            { name: "Sourdough Loaf", price: 8 },
            { name: "Croissant", price: 4 },
            { name: "Coffee", price: 3 }
        ]
    },
    {
        id: 2,
        name: "Quick Fix Garage",
        category: "Automotive",
        address: "456 Engine Ave, Mechantown",
        rating: 4,
        image: "https://images.unsplash.com/photo-1541802645826-5cc028556f84?q=80&w=870",
        description: "Reliable and honest auto repair services. From oil changes to engine diagnostics, our certified mechanics have you covered.",
        services: [
            { name: "Standard Oil Change", price: 50 },
            { name: "Tire Rotation", price: 30 },
            { name: "Brake Inspection", price: 25 }
        ]
    },
    {
        id: 3,
        name: "The Zen Garden Spa",
        category: "Salon & Spa",
        address: "789 Relax Rd, Serenity City",
        rating: 5,
        image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=870",
        description: "Escape the hustle and bustle. Our spa offers a tranquil environment for massage, facials, and total body relaxation.",
        services: [
            { name: "60-Min Deep Tissue Massage", price: 120 },
            { name: "Hydrating Facial", price: 90 },
            { name: "Manicure & Pedicure", price: 75 }
        ]
    }
];

module.exports = businesses;