// script.js

// IMPORTANT: Replace this with the actual URL of your deployed backend server!
// Example: const BACKEND_URL = 'https://your-deployed-backend-app.com';
const BACKEND_URL = 'https://sample-website-a5b7ec576406.herokuapp.com/'; // Keep this for local testing, change for deployment

document.addEventListener('DOMContentLoaded', () => {
    // Get references to the mobile menu button and the mobile menu itself
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    // Toggle mobile menu visibility when the button is clicked
    if (mobileMenuButton) { // Ensure button exists before adding listener
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden'); // Toggles the 'hidden' Tailwind class
        });
    }

    // Close mobile menu when a navigation link is clicked (for smooth scrolling)
    // This is primarily for the index.html internal links, and for mobile menu on all pages
    const navLinks = document.querySelectorAll('nav a'); // Select all nav links
    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            // Check if the link is an internal anchor link on the same page
            if (link.hash && link.pathname === window.location.pathname) {
                // For internal links, prevent default to handle smooth scroll if needed
                // event.preventDefault(); // Uncomment if you want JS smooth scroll over CSS
                // If mobile menu is open, close it
                if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                }
            } else if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                // If it's an external link (to login.html, signup.html) or other page, and mobile menu is open, close it
                mobileMenu.classList.add('hidden');
            }
        });
    });


    // Handle the reservation form submission (only if on index.html)
    const reservationForm = document.getElementById('reservation-form');
    const confirmationMessage = document.getElementById('confirmation-message');

    if (reservationForm) { // Only attach listener if the form exists on the page
        reservationForm.addEventListener('submit', async (event) => { // Added async
            event.preventDefault(); // Prevent the default form submission behavior

            // Basic form validation (client-side)
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const checkIn = document.getElementById('check-in').value;
            const checkOut = document.getElementById('check-out').value;
            const guests = document.getElementById('guests').value;
            const roomType = document.getElementById('room-type').value;

            if (!name || !email || !checkIn || !checkOut || !guests || !roomType) {
                displayMessage('Please fill in all required fields.', 'error', confirmationMessage);
                return;
            }

            // Validate dates: Check-out must be after check-in
            const checkInDate = new Date(checkIn);
            const checkOutDate = new Date(checkOut);
            if (checkOutDate <= checkInDate) {
                displayMessage('Check-out date must be after check-in date.', 'error', confirmationMessage);
                return;
            }

            // Get the authentication token from local storage
            const token = localStorage.getItem('token');
            if (!token) {
                displayMessage('Please log in to make a reservation.', 'error', confirmationMessage);
                return;
            }

            try {
                const response = await fetch(`${BACKEND_URL}/api/reservations`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` // Send the JWT token
                    },
                    body: JSON.stringify({
                        fullName: name,
                        email: email,
                        phone: document.getElementById('phone').value.trim(),
                        checkIn: checkIn,
                        checkOut: checkOut,
                        guests: guests,
                        roomType: roomType,
                        message: document.getElementById('message').value.trim()
                    }),
                });

                const data = await response.json();

                if (response.ok) {
                    displayMessage(data.message, 'success', confirmationMessage);
                    reservationForm.reset(); // Clear the form after submission
                } else {
                    displayMessage(data.message || 'Reservation failed. Please try again.', 'error', confirmationMessage);
                }
            } catch (error) {
                console.error('Error during reservation:', error);
                displayMessage('Network error. Could not connect to the server.', 'error', confirmationMessage);
            }
        });
    }


    // --- Login Form Handling (only if on login.html) ---
    const loginForm = document.getElementById('login-form');
    const loginMessage = document.getElementById('login-message');

    if (loginForm) { // Only attach listener if the form exists on the page
        loginForm.addEventListener('submit', async (event) => { // Added async
            event.preventDefault(); // Prevent default form submission

            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value.trim();

            if (!email || !password) {
                displayMessage('Please enter both email and password.', 'error', loginMessage);
                return;
            }

            try {
                const response = await fetch(`${BACKEND_URL}/api/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();

                if (response.ok) {
                    // Store the token and user ID (e.g., in localStorage)
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('userId', data.userId);
                    localStorage.setItem('fullName', data.fullName); // Store user's full name

                    displayMessage(data.message, 'success', loginMessage);
                    loginForm.reset();
                    setTimeout(() => {
                        window.location.href = 'index.html'; // Redirect to home page after successful login
                    }, 1500);
                } else {
                    displayMessage(data.message || 'Login failed. Invalid credentials.', 'error', loginMessage);
                }
            } catch (error) {
                console.error('Error during login:', error);
                displayMessage('Network error. Could not connect to the server.', 'error', loginMessage);
            }
        });
    }

    // --- Sign Up Form Handling (only if on signup.html) ---
    const signupForm = document.getElementById('signup-form');
    const signupMessage = document.getElementById('signup-message');

    if (signupForm) { // Only attach listener if the form exists on the page
        signupForm.addEventListener('submit', async (event) => { // Added async
            event.preventDefault(); // Prevent default form submission

            const name = document.getElementById('signup-name').value.trim();
            const email = document.getElementById('signup-email').value.trim();
            const password = document.getElementById('signup-password').value.trim();
            const confirmPassword = document.getElementById('signup-confirm-password').value.trim();

            if (!name || !email || !password || !confirmPassword) {
                displayMessage('Please fill in all required fields.', 'error', signupMessage);
                return;
            }

            if (password.length < 6) {
                displayMessage('Password must be at least 6 characters long.', 'error', signupMessage);
                return;
            }

            if (password !== confirmPassword) {
                displayMessage('Passwords do not match. Please try again.', 'error', signupMessage);
                return;
            }

            try {
                const response = await fetch(`${BACKEND_URL}/api/signup`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ fullName: name, email, password }),
                });

                const data = await response.json();

                if (response.ok) {
                    displayMessage(data.message, 'success', signupMessage);
                    signupForm.reset(); // Clear the form after submission
                    setTimeout(() => {
                        window.location.href = 'login.html'; // Redirect to login page
                    }, 2000);
                } else {
                    displayMessage(data.message || 'Signup failed. User might already exist.', 'error', signupMessage);
                }
            } catch (error) {
                console.error('Error during signup:', error);
                displayMessage('Network error. Could not connect to the server.', 'error', signupMessage);
            }
        });
    }

    // Helper function to display messages for forms
    function displayMessage(message, type, targetElement) {
        targetElement.textContent = message;
        targetElement.classList.remove('hidden', 'bg-red-100', 'text-red-800', 'border-red-200', 'bg-green-100', 'text-green-800', 'border-green-200');

        if (type === 'error') {
            targetElement.classList.add('bg-red-100', 'text-red-800', 'border-red-200');
        } else if (type === 'success') {
            targetElement.classList.add('bg-green-100', 'text-green-800', 'border-green-200');
        }
        targetElement.classList.remove('hidden');

        // Hide message after 5 seconds
        setTimeout(() => {
            targetElement.classList.add('hidden');
        }, 5000);
    }
});

