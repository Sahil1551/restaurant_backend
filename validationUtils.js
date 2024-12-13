// validationUtils.js

// Function to validate email format using a regular expression
function validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }
  
  // Function to validate the number of guests (e.g., between 1 and 100)
  function validateNumberOfGuests(guests) {
    return guests >= 1 && guests <= 100;
  }
  
  module.exports = {
    validateEmail,
    validateNumberOfGuests,
  };
  