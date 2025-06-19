// // activityLogger.js
// const Activity = require('../models/activityModel');

// const activityLogger = (moduleName, activity) => {
//     return async (req, res, next) => {
//         try {
//             // Log the activity to the database
//             await Activity.create({ module: moduleName, activity, });
//             // console.log(`[${moduleName}] ${activity} - User: ${req.user.username}`);
//             next();
//         } catch (error) {
//             console.error(`Error logging activity: ${error}`);
//             next(error);
//         }
//     };
// };

// module.exports = activityLogger;
