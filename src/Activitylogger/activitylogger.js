const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'activity.log');

function logActivity(activity) {
  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp}: ${activity}\n`;

  fs.appendFile(logFile, logEntry, (err) => {
    if (err) {
      console.error('Error writing to log file:', err);
    }
  });
}

function logPurchase(purchaseActivity) {
  logActivity(purchaseActivity);
}

module.exports = { logActivity, logPurchase };
