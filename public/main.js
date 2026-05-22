// Smooth scroll to sections
function scrollToWaitlist() {
    document.getElementById('waitlist').scrollIntoView({ behavior: 'smooth' });
}

function scrollToContact() {
    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
}

function scrollToPayment() {
    document.getElementById('payment').scrollIntoView({ behavior: 'smooth' });
}

// Contact form submission
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);

        // Add reCAPTCHA token if available
        if (window.grecaptcha) {
            try {
                data.recaptchaToken = await window.grecaptcha.execute('YOUR_RECAPTCHA_SITE_KEY', { action: 'contact' });
            } catch (err) {
                console.warn('reCAPTCHA not configured:', err);
            }
        }

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                showMessage('Thank you! We\'ll be in touch within 24 hours.', 'success');
                contactForm.reset();
            } else {
                showMessage(result.error || 'Something went wrong. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('Failed to send message. Please try again.', 'error');
        }
    });
}

// Waitlist form submission
const waitlistForm = document.getElementById('waitlistForm');
if (waitlistForm) {
    waitlistForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(waitlistForm);
        const data = Object.fromEntries(formData);

        // Add reCAPTCHA token if available
        if (window.grecaptcha) {
            try {
                data.recaptchaToken = await window.grecaptcha.execute('YOUR_RECAPTCHA_SITE_KEY', { action: 'waitlist' });
            } catch (err) {
                console.warn('reCAPTCHA not configured:', err);
            }
        }

        try {
            const response = await fetch('/api/waitlist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                showMessage('Welcome to the waitlist! Check your email for confirmation.', 'success');
                waitlistForm.reset();
            } else {
                showMessage(result.error || 'Something went wrong. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('Failed to join waitlist. Please try again.', 'error');
        }
    });
}

// Show temporary message
function showMessage(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    messageDiv.textContent = text;

    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => messageDiv.remove(), 300);
    }, 4000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;

        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});
