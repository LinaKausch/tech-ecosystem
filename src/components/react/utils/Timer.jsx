/**
* Format elapsed time as HH:MM:SS
* @param {number} startTimeMs - Starting timestamp in milliseconds (from Date.now())
* @returns {string} Formatted time string (HH:MM:SS)
*/
export const getFormattedTime = (startTimeMs) => {
    const elapsedMs = Date.now() - startTimeMs;
    return formatDurationMs(elapsedMs);
};

export const formatDurationMs = (elapsedMs) => {
    const elapsedSeconds = Math.floor(elapsedMs / 1000);
    const hours = Math.floor(elapsedSeconds / 3600);
    const minutes = Math.floor((elapsedSeconds % 3600) / 60);
    const seconds = elapsedSeconds % 60;

    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};
