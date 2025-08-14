// Test data for login validation tests

export const invalidPhoneNumbers = [
  { input: "1234", description: "4 digits (too short)" },
  { input: "ab", description: "alphabetic characters" },
  { input: "!@", description: "special characters" },
];

export const validPhoneNumber = {
  input: "0123456789",
  description: "10 digits (valid phone number)",
};

export const errorMessages = {
  invalidPhoneNumber: "Please enter a valid phone number",
};
