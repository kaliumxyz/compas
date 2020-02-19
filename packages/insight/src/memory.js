const sizes = ["Bytes", "KiB", "MiB", "GiB", "TiB", "PiB"];

/**
 * Format bytes, with up to 2 digits after the decimal point, in a more human readable way
 * Support up to a pebibyte
 * @param {number} bytes
 * @returns {string}
 */
const bytesToHumanReadable = bytes => {
  if (bytes === 0) {
    return "0 Byte";
  }

  const idx = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, idx);

  let result = value.toFixed(2);

  // Remove trailing zeroes
  if (result.endsWith(".00")) {
    result = result.substring(0, result.length - 3);
  } else if (result.endsWith("0")) {
    result = result.substring(0, result.length - 1);
  }
  return `${result} ${sizes[idx]}`;
};

/**
 * Prints the memory usage of the current process to the provided logger
 * For more info on the printed properties see:
 * https://nodejs.org/dist/latest-v13.x/docs/api/process.html#process_process_memoryusage
 * @param logger
 */
const printProcessMemoryUsage = logger => {
  const { external, heapTotal, heapUsed, rss } = process.memoryUsage();
  logger.info({
    rss: bytesToHumanReadable(rss),
    heapUsed: bytesToHumanReadable(heapUsed),
    heapTotal: bytesToHumanReadable(heapTotal),
    external: bytesToHumanReadable(external),
  });
};

module.exports = {
  bytesToHumanReadable,
  printProcessMemoryUsage,
};
