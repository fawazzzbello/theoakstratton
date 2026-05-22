// Initialize Stripe
const stripe = Stripe('REPLACE_WITH_STRIPE_PUBLISHABLE_KEY');
let elements;
let cardElement;

// Load payment methods
async function loadPaymentMethods() {
  try {
    const response = await fetch('/api/payment-methods');
    const methods = await response.json();

    const container = document.getElementById('paymentMethodsList');
    if (!container) return;

    container.innerHTML = methods.map(method => `
      <div class="payment-method-card" onclick="selectPaymentMethod('${method.id}')">
        <div class="payment-icon">${method.icon}</div>
        <h4>${method.name}</h4>
        <p class="payment-desc">${method.description}</p>
        <p class="payment-fee">Fee: ${method.fee}</p>
      </div>
    `).join('');
  } catch (error) {
    console.error('Failed to load payment methods:', error);
  }
}

// Select payment method
function selectPaymentMethod(methodId) {
  document.querySelectorAll('.payment-method-card').forEach(el => {
    el.classList.remove('selected');
  });

  event.currentTarget.classList.add('selected');
  document.getElementById('selectedPaymentMethod').value = methodId;

  // Show/hide card element based on method
  const cardContainer = document.getElementById('cardElementContainer');
  if (methodId === 'card') {
    cardContainer.style.display = 'block';
    initializeCardElement();
  } else {
    cardContainer.style.display = 'none';
  }
}

// Initialize Stripe Card Element
function initializeCardElement() {
  if (elements) return;

  elements = stripe.elements();
  cardElement = elements.create('card', {
    style: {
      base: {
        fontSize: '16px',
        color: '#374151',
        fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto'
      },
      invalid: {
        color: '#ef4444'
      }
    }
  });

  const container = document.getElementById('cardElement');
  if (container) {
    cardElement.mount('#cardElement');

    cardElement.on('change', function(event) {
      const displayError = document.getElementById('cardErrors');
      if (event.error) {
        displayError.textContent = event.error.message;
      } else {
        displayError.textContent = '';
      }
    });
  }
}

// Process payment
async function processPayment(event) {
  event.preventDefault();

  const amount = document.getElementById('paymentAmount')?.value;
  const email = document.getElementById('paymentEmail')?.value;
  const name = document.getElementById('paymentName')?.value;
  const paymentMethod = document.getElementById('selectedPaymentMethod')?.value;

  if (!amount || !email || !name || !paymentMethod) {
    showPaymentMessage('Please fill in all fields', 'error');
    return;
  }

  try {
    // Create payment intent
    const response = await fetch('/api/payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: Math.round(parseFloat(amount) * 100), // Convert to pence
        email,
        name,
        paymentMethod,
        bnplProvider: paymentMethod
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);

    // Confirm payment with Stripe
    const confirmResult = await stripe.confirmPayment({
      elements,
      clientSecret: data.clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success?intent=${data.paymentIntentId}`
      }
    });

    if (confirmResult.error) {
      showPaymentMessage(confirmResult.error.message, 'error');
    }
  } catch (error) {
    console.error('Payment error:', error);
    showPaymentMessage(error.message || 'Payment failed', 'error');
  }
}

// Show payment message
function showPaymentMessage(message, type) {
  const msgDiv = document.createElement('div');
  msgDiv.className = `payment-message payment-${type}`;
  msgDiv.textContent = message;
  msgDiv.style.cssText = `
    padding: 1rem;
    margin: 1rem 0;
    border-radius: 6px;
    background: ${type === 'success' ? '#dcfce7' : '#fee2e2'};
    color: ${type === 'success' ? '#15803d' : '#dc2626'};
    border: 1px solid ${type === 'success' ? '#86efac' : '#fca5a5'};
  `;

  const container = document.getElementById('paymentContainer');
  if (container) {
    container.prepend(msgDiv);
    setTimeout(() => msgDiv.remove(), 5000);
  }
}

// Load payment methods on page load
document.addEventListener('DOMContentLoaded', loadPaymentMethods);
