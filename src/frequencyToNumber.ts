/**
 * Takes the frenquency in text format and returns interval in blocks
 * @param {string} frequency The frequency interval on text format
 * @returns {number} The frequency in blocks
 */
export function frequencyToNumber(frequency: 'day' | 'week'): number {
    if (frequency === 'day') return 17280;
    if (frequency === 'week') return 120960;

    return 0;
}
