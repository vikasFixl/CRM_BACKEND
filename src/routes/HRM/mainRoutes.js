const express = require("express");
const app = express();

app.use("/role-permission", require("./rolePersimmison"));
app.use("/transaction", require("./transaction"));
app.use("/permission", require("./permission"));
app.use("/employee", require("./employee"));
app.use("/role", require("./role"));
app.use("/designation", require("./designation"));
app.use("/account", require("./accountRoutes"));
// app.use("/setting", require("./setting"));
// app.use("/email", require("./email"));
app.use("/department", require("./department"));
app.use("/employment-status", require("./employmenStatus"));
app.use("/announcement", require("./announcement"));
app.use("/leave-application", require("./leaveApplication"));
app.use("/attendance", require("./attendance"));
app.use("/payroll", require("./payroll"));
app.use("/education", require("./education"));
app.use("/salaryHistory", require("./salaryHistory"));
app.use("/designationHistory", require("./designationHistory"));
// app.use("/dashboard", require("./"));
app.use("/shift", require("./shift"));
// app.use("/files", require("./routes/files/files.routes"));
app.use("/leave-policy", require("./leavePolicy"));
app.use("/weekly-holiday", require("./weeklyHoliday"));
app.use("/public-holiday", require("./publicHoliday"));
app.use("/award", require("./award"));
app.use("/awardHistory", require("./awardHistory"));

//project management routes
app.use("/project", require("./project"));
app.use("/milestone", require("./milestone"));
app.use("/tasks", require("./tasks"));
app.use("/assigned-task", require("./assignedTask"));
app.use("/project-team", require("./projectTeam"));
app.use("/task-status", require("./taskStatus"));
app.use("/task-priority", require("./taskPriority"));

module.exports = app;
