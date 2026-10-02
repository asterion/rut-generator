// SPDX-License-Identifier: GPL-2.0-or-later
//
// Generated with AI for personal use.
// Do NOT upload to extensions.gnome.org (EGO) unless you understand JavaScript
// and can maintain this code.

// Chilean companies (legal entities) get RUT numbers in this range
const MIN_COMPANY_RUT = 50000000;
const MAX_COMPANY_RUT = 99999999;
// Range used for people: never below 1.000.000 nor above 16.999.999
const MIN_PERSON_RUT = 1000000;
const MAX_PERSON_RUT = 16999999;

/**
 * Check digit of a RUT number, using the modulo 11 algorithm.
 *
 * @param {number} number - RUT number without the check digit
 * @returns {string} the check digit: '0' to '9' or 'K'
 */
export function checkDigit(number) {
    let sum = 0;
    let factor = 2;
    for (let rest = number; rest > 0; rest = Math.floor(rest / 10)) {
        sum += (rest % 10) * factor;
        factor = factor === 7 ? 2 : factor + 1;
    }

    const digit = 11 - (sum % 11);
    if (digit === 11)
        return '0';
    return digit === 10 ? 'K' : String(digit);
}

/**
 * Random valid RUT with its number between min and max, formatted like "76543210-K".
 *
 * @param {number} min - lowest RUT number
 * @param {number} max - highest RUT number
 * @returns {string} the formatted RUT
 */
function randomRut(min, max) {
    const number = min + Math.floor(Math.random() * (max - min + 1));
    return `${number}-${checkDigit(number)}`;
}

/**
 * Random valid company RUT, like "76543210-K".
 *
 * @returns {string} the formatted RUT
 */
export function randomCompanyRut() {
    return randomRut(MIN_COMPANY_RUT, MAX_COMPANY_RUT);
}

/**
 * Random valid person RUT, like "12345678-5".
 *
 * @returns {string} the formatted RUT
 */
export function randomPersonRut() {
    return randomRut(MIN_PERSON_RUT, MAX_PERSON_RUT);
}
