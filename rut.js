// SPDX-License-Identifier: GPL-2.0-or-later
//
// Generated with AI for personal use.
// Do NOT upload to extensions.gnome.org (EGO) unless you understand JavaScript
// and can maintain this code.

export const Kind = {
    COMPANY: 'company',
    PERSON: 'person',
};

// Companies (legal entities) use 50.000.000 to 99.999.999.
// People: never below 1.000.000 nor above 16.999.999.
const RANGES = {
    [Kind.COMPANY]: [50000000, 99999999],
    [Kind.PERSON]: [1000000, 16999999],
};

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
 * Random valid RUT of the given kind. The number and the check digit are kept apart,
 * so the RUT can be formatted again when the format changes.
 *
 * @param {string} kind - a Kind value
 * @returns {{kind: string, number: number, digit: string}} the RUT
 */
export function randomRut(kind) {
    const [min, max] = RANGES[kind];
    const number = min + Math.floor(Math.random() * (max - min + 1));
    return {kind, number, digit: checkDigit(number)};
}

/**
 * Format a RUT as "12.345.678-5" (dots), "12345678-5" (dash) or "123456785" (plain).
 *
 * @param {number} number - RUT number
 * @param {string} digit - check digit
 * @param {string} format - 'dots', 'dash' or 'plain'
 * @returns {string} the formatted RUT
 */
export function formatRut(number, digit, format) {
    if (format === 'plain')
        return `${number}${digit}`;
    if (format === 'dash')
        return `${number}-${digit}`;
    return `${String(number).replace(/\B(?=(\d{3})+$)/g, '.')}-${digit}`;
}
