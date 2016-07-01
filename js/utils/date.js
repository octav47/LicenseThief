/**
 *
 * @param date
 * @returns {string}
 */
function formatDate(date) {
    return date.split('.').reverse().join('-');
}

module.exports.formatDate = formatDate;