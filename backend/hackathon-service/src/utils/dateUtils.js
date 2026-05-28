/**
 * UTC Date Utility Functions
 * Always work with UTC on the backend to avoid timezone issues
 */

/**
 * Get current UTC time
 * @returns {Date} Current date in UTC
 */
export const getNowUTC = () => {
    return new Date();
};

/**
 * Convert a date to UTC (removes timezone offset)
 * @param {Date} date - The date to convert
 * @returns {Date} Date in UTC
 */
export const toUTC = (date) => {
    if (!date) return new Date();
    return new Date(date.getTime());
};

/**
 * Check if a hackathon is currently active
 * @param {Date} startDate - Hackathon start date
 * @param {Date} submissionEndDate - Submission end date
 * @returns {boolean} True if hackathon is active
 */
export const isHackathonActive = (startDate, submissionEndDate) => {
    const now = getNowUTC();
    return new Date(startDate).getTime() <= now.getTime() &&
        new Date(submissionEndDate).getTime() >= now.getTime();
};

/**
 * Check if a hackathon has expired
 * @param {Date} submissionEndDate - Submission end date
 * @returns {boolean} True if hackathon has expired
 */
export const isHackathonExpired = (submissionEndDate) => {
    const now = getNowUTC();
    return new Date(submissionEndDate).getTime() < now.getTime();
};

/**
 * Check if a hackathon is upcoming
 * @param {Date} startDate - Hackathon start date
 * @returns {boolean} True if hackathon is upcoming
 */
export const isHackathonUpcoming = (startDate) => {
    const now = getNowUTC();
    return new Date(startDate).getTime() > now.getTime();
};

/**
 * Convert UTC date to IST for frontend display
 * @param {Date} utcDate - Date in UTC
 * @returns {string} Formatted date in IST
 */
export const formatToIST = (utcDate) => {
    if (!utcDate) return "N/A";

    const date = new Date(utcDate);
    const istFormatter = new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });

    return istFormatter.format(date);
};

/**
 * Get time remaining until a date (in ms)
 * @param {Date} targetDate - Target date
 * @returns {number} Milliseconds remaining
 */
export const getTimeRemaining = (targetDate) => {
    const now = getNowUTC();
    const remaining = new Date(targetDate).getTime() - now.getTime();
    return Math.max(0, remaining);
};

/**
 * Get time elapsed since a date (in ms)
 * @param {Date} pastDate - Past date
 * @returns {number} Milliseconds elapsed
 */
export const getTimeElapsed = (pastDate) => {
    const now = getNowUTC();
    return now.getTime() - new Date(pastDate).getTime();
};
