// utils/formatMoney.js

/**
 * Formats a number into a human-readable string representation for money.
 * 
 * @param {number} value - The money value to format.
 * @returns {string} - The formatted money string.
 */
export function formatMoney(value) {
    if (isNaN(value)) return '';
  
    if (value < 1000) {
      return value.toFixed(0); // Display without decimal places
    } else if (value < 1000000) {
      // Format as '1.00k'
      return (value / 1000).toFixed(2) + 'k';
    } else if (value < 1000000000) {
      // Format as '1.00M'
      return (value / 1000000).toFixed(2) + 'M';
    } else if (value < 1000000000000) {
      // Format as '1.00B'
      return (value / 1000000000).toFixed(2) + 'B';
    }else{
      return (value / 1000000000000).toFixed(2) + 'T';
    }
  }
  
