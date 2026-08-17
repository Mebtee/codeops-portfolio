document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('signup-form');
  const nameInput = document.getElementById('name');
  const phoneInput = document.getElementById('phone');
  const errorArea = document.getElementById('error-message');
  const countDisplay = document.getElementById('count-display');

  const STORAGE_KEY = 'signed_up_users';

  // 5. Restoration: Read storage and update count on load
  const getUsersFromStorage = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  };

  const updateCountUI = (count) => {
    countDisplay.textContent = `Signed up users: ${count}`;
  };

  // Initial load restoration
  let users = getUsersFromStorage();
  updateCountUI(users.length);

  // 1. Submission Control
  form.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevents page reload

    // Read trimmed field values
    const nameValue = nameInput.value.trim();
    const phoneValue = phoneInput.value.trim();

    // Reset previous errors
    errorArea.textContent = '';

    // 2. Validation Checks (Evaluates sequentially to display the FIRST error)
    
    // Check Name Length (< 2 characters)
    if (nameValue.length < 2) {
      // 3. Feedback: Uses safe text methods (textContent)
      errorArea.textContent = 'Name must be at least 2 characters long.';
      return;
    }

    // Check Ethiopian Mobile Pattern (09... or +2519...)
    const ethiopianPhoneRegex = /^(09\d{8}|\+2519\d{8})$/;
    if (!ethiopianPhoneRegex.test(phoneValue)) {
      // 3. Feedback: Clear, specific error message
      errorArea.textContent = 'Please enter a valid Ethiopian phone number (e.g., 0912345678 or +251912345678).';
      return;
    }

    // 4. Persistence: Save entry to localStorage as JSON
    const newUser = {
      name: nameValue,
      phone: phoneValue
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));

    // Update UI count and reset form
    updateCountUI(users.length);
    form.reset();
  });
});