
import React, { useState, useEffect } from 'react';
import { parsePhoneNumber } from 'libphonenumber-js';

const PhoneForm = () => {
  const [countryCodes, setCountryCodes] = useState([]);
  const [selectedCountryCode, setSelectedCountryCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetch('https://restcountries.com/v3.1/all')
      .then((response) => response.json())
      .then((data) => {
        const codes = data
          .map((country) => {
            const code = country.idd.root + (country.idd.suffixes ? country.idd.suffixes[0] : '');
            return {
              code: code.startsWith('+') ? code.substring(1) : code, // Remove leading "+" if exists
              name: country.name.common,
            };
          })
          .filter((country) => country.code);
        setCountryCodes(codes);
      });
  }, []);

  const handleCountryChange = (event) => {
    setSelectedCountryCode(event.target.value);
    setPhoneNumber('');
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handlePhoneNumberChange = (event) => {
    const value = event.target.value;
    setPhoneNumber(value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!selectedCountryCode || !phoneNumber) {
      setErrorMessage('Please select a country and enter a valid phone number.');
      setSuccessMessage('');
      return;
    }

    // Remove any spaces or non-digit characters from the phone number
    const cleanedPhoneNumber = phoneNumber.replace(/[^0-9]/g, '');

    // Build full phone number with the selected country code (no extra "+")
    const fullPhoneNumber = `+${selectedCountryCode}${cleanedPhoneNumber}`;

    try {
      const parsedPhoneNumber = parsePhoneNumber(fullPhoneNumber);

      // Check if the phone number is valid according to the selected country
      if (!parsedPhoneNumber.isValid()) {
        setErrorMessage('Invalid phone number. Please check the number format.');
        setSuccessMessage('');
      } else {
        // Check if the phone number length is within a valid range for the country
        const length = parsedPhoneNumber.number.length;
        if (length < 10 || length > 15) {
          setErrorMessage('Phone number length is incorrect. It should be between 10 and 15 digits.');
          setSuccessMessage('');
        } else {
          setErrorMessage('');
          setSuccessMessage('Phone number is valid!');
        }
      }
    } catch (error) {
      setErrorMessage('Error parsing phone number. Please ensure the phone number format is correct.');
      setSuccessMessage('');
    }
  };

  return (
    <div>
      <h2>Phone Number Form</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="country">Select Country Code: </label>
          <select
            id="country"
            value={selectedCountryCode}
            onChange={handleCountryChange}
          >
            <option value="">--Select Country--</option>
            {countryCodes.map((country, index) => (
              <option key={index} value={country.code}>
                {country.name} (+{country.code})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="phone">Phone Number: </label>
          <input
            type="text"
            id="phone"
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            placeholder="Enter phone number"
          />
        </div>
        <button type="submit">Submit</button>
      </form>

      {errorMessage && <p className="error">{errorMessage}</p>}
      {successMessage && <p className="success">{successMessage}</p>}
    </div>
  );
};

export default PhoneForm;
