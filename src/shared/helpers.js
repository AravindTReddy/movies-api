export const formatBudget = (amount) => 
    amount ? `$${amount.toLocaleString('en-US')}` : '$0';
  
export const validateYear = (year) => 
    /^(19|20)\d{2}$/.test(year);

export const validateInteger = (value) => 
    Number.isInteger(Number(value)) && value >= 0;
  