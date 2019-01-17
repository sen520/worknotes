/**
 * Generates a random integer within a boundary.
 *
 * @param min lower bound
 * @param max uppoer bound
 * @returns {*} an integer
 */
/* eslint-disable no-param-reassign */
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);

  // The maximum is exclusive and the minimum is inclusive
  return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * Validates whether the input is an valid email or not, support unicode.
 *
 * @param email the email address to verify
 * @returns {boolean} true if the input is a valid email address
 */
/* eslint-disable no-useless-escape */
function validateEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

/**
 * Validates whether the input is an valid phone or not. Only support Chinese
 * mobile phone number.
 *
 * @param phone the 10 digit phone number
 * @returns {boolean} true if it is a valid chinese mobile phone number
 */
function validatePhone(phone) {
  const re = /^1[0-9]{10}$/;
  return re.test(phone);
}

/**
 * Set the result.
 *
 * @param res
 * @param code
 * @param data
 */
const setResult = (res, code, data) => {
  const response = Object.assign({}, data, { status: code });
  res.send(response);
};

/**
 * Set the result.
 *
 * @param res
 * @param code
 * @param data
 */
const setError = (res, code, error) => {
  console.error(error.name);
  console.error(error.message);
  console.error(error.stack);
  setResult(res, 500, error);
};

/**
 * Reverses the dictionary from key:value to value:key.
 *
 * @param input the input dictionary
 * @returns {{}|*}
 */
const reverseDictionary = (input) => {
  const output = {};
  for (const k of Object.keys(input)) {
    output[input[k]] = k;
  }
  return output;
};

/**
 * Deep clones an object.
 *
 * @param input
 * @returns {any}
 */
const deepCopy = (input) => {
  return JSON.parse(JSON.stringify(input));
};

/**
 * Formats address to a string.
 *
 * @param address an address object
 * @return {string}
 */
const formatAddress = (address) => {
  return ['address1', 'address2', 'city', 'state', 'country', 'zip'].map(
    t => address[t]).filter(t => t.length > 0).join(', ');
};

/**
 * Formats currency to a string
 *
 * @param fee a currency object
 * @return {string}
 */
const formatCurrency = (fee) => {
  return `${fee.amount.toLocaleString()} ${fee.unit}`;
};

module.exports = {
  getRandomInt,
  validateEmail,
  validatePhone,
  setResult,
  setError,
  reverseDictionary,
  deepCopy,
  formatAddress,
  formatCurrency,
};
