// SPDX-License-Identifier: GPL-2.0-or-later
//
// Generated with AI for personal use.
// Do NOT upload to extensions.gnome.org (EGO) unless you understand JavaScript
// and can maintain this code.

// Chilean companies (legal entities) get RUT numbers in this range
const MIN_COMPANY_RUT = 50000000;
const MAX_COMPANY_RUT = 99999999;

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
 * Random valid company RUT, formatted like "76543210-K".
 *
 * @returns {string} the formatted RUT
 */
export function randomCompanyRut() {
    const number = MIN_COMPANY_RUT + Math.floor(Math.random() * (MAX_COMPANY_RUT - MIN_COMPANY_RUT + 1));
    return `${number}-${checkDigit(number)}`;
}
