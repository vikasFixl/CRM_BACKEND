// require("dotenv").config();
const Employee = require("../../models/HRM/employee");
const Role = require("../../models/HRM/role");

const bcrypt = require("bcrypt");
const saltRounds = 10;

const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;

const login = async (req, res) => {
  try {
    const allUser = await Employee.find();
    const user = allUser.find(
      (u) =>
        u.userName === req.body.userName &&
        bcrypt.compareSync(req.body.password, u.password)
    );
    console.log("user", user);

    const permission = await Role.findById(user.role);
    // get permission from user roles
    console.log("permissionsneww", permission);
    // const permissions = await Role.findById({
    //   where: {
    //     id: user.roleId,
    //   },
    //   include: {
    //     rolePermission: {
    //       include: {
    //         permission: true,
    //       },
    //     },
    //   },
    // });
    const permissionsArray = [
      "create-user",
      "create-attendance",
      "create-payroll",
      "create-leaveApplication",
      "crate-award",
      "create-project",
      "create-projectTeam",
      "create-milestone",
      "create-task-Status",
      "create-employmentStatus",

      "readAll-user",
      "readAll-rolePermission",
      "readAll-role",
      "readAll-designation",
      "readAll-department",
      "readAll-attendance",
      "readAll-payroll",
      "readAll-shift",
      "readAll-employmentStatus",
      "readAll-leaveApplication",
      "readAll-weeklyHoliday",
      "readAll-publicHoliday",
      "readAll-leavePolicy",
      "readAll-announcement",
      "readAll-account",
      "readAll-transaction",
      "readAll-account",
      "readAll-project",
      "readAll-priority",
      "readAll-setting",
      "readSingle-attendance",
      "readSingle-leaveApplication",
    ];
    // console.log("permissions neww", permissions);
    // // // store all permissions name to an array
    // const permissionNames = permissions.rolePermission.map(
    //   (rp) => rp.permission.name
    // );

    if (user) {
      const token = jwt.sign(
        { sub: user.id, permissions: permissionsArray },
        secret,
        {
          expiresIn: "24h",
        }
      );
      const { password, ...userWithoutPassword } = user;
      return res.status(200).json({
        ...userWithoutPassword,
        token,
        user_id: user._id,
        role: permission.name,
      });
    }
    return res
      .status(400)
      .json({ message: "userName or password is incorrect" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


const register = async (req, res) => {
  try {
    const join_date = new Date(req.body.joinDate);
    const leave_date = new Date(req.body.leaveDate);
    console.log("redfdsdf", req.body);
    const hash = await bcrypt.hash(req.body.password, saltRounds);
    
    const createEmployee = new Employee({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      userName: req.body.userName, // Include userName at the top level
      password: hash, // Include password at the top level
      email: req.body.email,
      phone: req.body.phone,
      street: req.body.street,
      city: req.body.city,
      state: req.body.state,
      zipCode: req.body.zipCode,
      country: req.body.country,
      joinDate: join_date,
      leaveDate: leave_date,
      employeeId: req.body.employeeId,
      bloodGroup: req.body.bloodGroup,
      image: req.body.image,
      employmentStatusId: req.body.employmentStatusId,
      departmentId: req.body.departmentId,
      roleId: req.body.roleId,
      shiftId: req.body.shiftId,
      leavePolicyId: req.body.leavePolicyId,
      weeklyHolidayId: req.body.weeklyHolidayId,
      designationHistory: req.body.designationId
        ? {
            create: {
              designationId: req.body.designationId,
              startDate: req.body.designationStartDate
                ? new Date(req.body.designationStartDate)
                : new Date(),
              endDate: req.body.designationEndDate
                ? new Date(req.body.designationEndDate)
                : new Date(),
              comment: req.body.designationComment || null,
            },
          }
        : {},
      // salaryHistory: req.body.salary
      //   ? {
      //       create: {
      //         salary: req.body.salary,
      //         startDate: req.body.salaryStartDate
      //           ? new Date(req.body.salaryStartDate)
      //           : new Date(),
      //         endDate: req.body.salaryEndDate
      //           ? new Date(req.body.salaryEndDate)
      //           : new Date(),
      //         comment: req.body.salaryComment || null,
      //       },
      //     }
      //   : {},
      designationHistory: req.body.designationHistory
      ? req.body.designationHistory.map((e) => {
          return {
            designationId: e.designationId,
            startDate: e.designationStartDate
              ? new Date(e.designationStartDate)
              : new Date(),
            endDate: e.designationEndDate
              ? new Date(e.designationEndDate)
              : new Date(),
            comment: e.designationComment || null,
          }
      })
      : [],
        salaryHistory: req.body.salaryHistory
        ? req.body.salaryHistory.map((e) => {
            return {
              salary: e.salary,
              startDate: e.salaryStartDate
                ? new Date(e.salaryStartDate)
                : new Date(),
              endDate: e.salaryEndDate
                ? new Date(e.salaryEndDate)
                : new Date(),
              comment: e.salaryComment || null,
            }
        })
        : [],
      educations: req.body.educations
          ? req.body.educations.map((e) => {
              return {
                degree: e.degree,
                institution: e.institution,
                fieldOfStudy: e.fieldOfStudy,
                result: e.result,
                startDate: new Date(e.studyStartDate),
                endDate: new Date(e.studyEndDate),
              };
            })
          : [],
    });

    await createEmployee.save();
    return res.status(201).json({ Employee: createEmployee });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


const getAllUser = async (req, res) => {
  if (req.query.query === "all") {
    try {
      // const allUser = await Employee.find({
      //   include: {
      //     designationHistory: {
      //       include: {
      //         designation: true,
      //       },
      //     },
      //     salaryHistory: true,
      //     educations: true,
      //     employmentStatus: true,
      //     department: true,
      //     role: true,
      //     shift: true,
      //     leavePolicy: true,
      //     weeklyHoliday: true,
      //     awardHistory: true,
      //   },
      // });
      const allUser = await Employee.find();
      return res.status(200).json(
        allUser
        // .map((u) => {
        //   const { password, ...userWithoutPassword } = u;
        //   return userWithoutPassword;
        // })
        // .sort((a, b) => a.id - b.id)
      );
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  } else if (req.query.status === "false") {
    try {
      // const allUser = await Employee.find({
      //   where: {
      //     status: false,
      //   },
      //   include: {
      //     designationHistory: {
      //       include: {
      //         designation: true,
      //       },
      //     },
      //     salaryHistory: true,
      //     educations: true,
      //     employmentStatus: true,
      //     department: true,
      //     role: true,
      //     shift: true,
      //     leavePolicy: true,
      //     weeklyHoliday: true,
      //     awardHistory: true,
      //   },
      // });
      const allUser = await Employee
        .find
        //   {where:{
        //   status: false
        // }}
        ();

      return res.status(200).json(
        allUser
        // .map((u) => {
        //   const { password, ...userWithoutPassword } = u;
        //   return userWithoutPassword;
        // })
        // .sort((a, b) => a.id - b.id)
      );
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  } else {
    try {
      // const allUser = await Employee.find({
      //   where: {
      //     status: true,
      //   },
      //   include: {
      //     designationHistory: {
      //       include: {
      //         designation: true,
      //       },
      //     },
      //     salaryHistory: true,
      //     educations: true,
      //     employmentStatus: true,
      //     department: true,
      //     role: true,
      //     shift: true,
      //     leavePolicy: true,
      //     weeklyHoliday: true,
      //     awardHistory: true,
      //   },
      // });
      const allUser = await Employee
        .find
        //   {
        //   where: {
        //     status: true,
        //   }
        // }
        ();

      return res.status(200).json(
        allUser
        // .map((u) => {
        //   const { password, ...userWithoutPassword } = u;
        //   return userWithoutPassword;
        // })
        // .sort((a, b) => a.id - b.id)
      );
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

const getSingleUser = async (req, res) => {
  try {
    // Find the user by ID in the Mongoose User model
    const singleUser = await Employee.findById(req.params.id);
    // .populate({
    //   path: 'designationHistory',
    //   populate: {
    //     path: 'designation',
    //   },
    // })
    // .populate('salaryHistory')
    // .populate('educations')
    // .populate('employmentStatus')
    // .populate('department')
    // .populate('role')
    // .populate('shift')
    // .populate('leavePolicy')
    // .populate('weeklyHoliday')
    // .populate({
    //   path: 'awardHistory',
    //   populate: {
    //     path: 'award',
    //   },
    // })
    // .populate({
    //   path: 'leaveApplication',
    //   options: {
    //     sort: { id: 'desc' },
    //     limit: 5,
    //   },
    // })
    // .populate({
    //   path: 'attendance',
    //   options: {
    //     sort: { id: 'desc' },
    //     limit: 1,
    //   },
    // });

    if (!singleUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Calculate paid and unpaid leave days for the user for the current year
    const leaveDays = await Employee.aggregate([
      {
        $match: {
          _id: singleUser._id,
        },
      },
      {
        $unwind: "$leaveApplication",
      },
      {
        $match: {
          "leaveApplication.status": "ACCEPTED",
          "leaveApplication.acceptLeaveFrom": {
            $gte: new Date(new Date().getFullYear(), 0, 1),
          },
          "leaveApplication.acceptLeaveTo": {
            $lte: new Date(new Date().getFullYear(), 11, 31),
          },
        },
      },
      {
        $group: {
          _id: "$leaveApplication.leaveType",
          totalDays: { $sum: "$leaveApplication.leaveDuration" },
        },
      },
    ]);

    const leaveDaysMap = new Map(
      leaveDays.map((item) => [item._id, item.totalDays])
    );

    const paidLeaveDays = leaveDaysMap.get("PAID") || 0;
    const unpaidLeaveDays = leaveDaysMap.get("UNPAID") || 0;

    singleUser.paidLeaveDays = paidLeaveDays;
    singleUser.unpaidLeaveDays = unpaidLeaveDays;
    // singleUser.leftPaidLeaveDays = singleUser.leavePolicy.paidLeaveCount - paidLeaveDays;
    // singleUser.leftUnpaidLeaveDays = singleUser.leavePolicy.unpaidLeaveCount - unpaidLeaveDays;

    // Only allow admins and owner to access other user records
    // const id = parseInt(req.params.id);
    // if (id !== req.auth.sub && !req.auth.permissions.includes('readSingle-user')) {
    //   return res.status(401).json({ message: 'Unauthorized. You are not an admin' });
    // }

    // Exclude the password field from the response
    const { password, ...userWithoutPassword } = singleUser.toObject();

    return res.status(200).json(userWithoutPassword);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const updateSingleUser = async (req, res) => {
  const id = parseInt(req.params.id);

  // Only allow admins and owner to edit other user records.
  if (id !== req.auth.sub && !req.auth.permissions.includes("update-user")) {
    return res.status(401).json({
      message: "Unauthorized. You can only edit your own record.",
    });
  }

  try {
    const userData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      userName: req.body.userName,
      email: req.body.email,
      phone: req.body.phone,
      street: req.body.street,
      city: req.body.city,
      state: req.body.state,
      zipCode: req.body.zipCode,
      country: req.body.country,
      employeeId: req.body.employeeId,
      bloodGroup: req.body.bloodGroup,
      image: req.body.image,
    };

    if (req.auth.permissions.includes("update-user")) {
      // Admin can change all fields
      const join_date = new Date(req.body.joinDate);
      const leave_date = new Date(req.body.leaveDate);

      userData.password = await bcrypt.hash(req.body.password, saltRounds);
      userData.joinDate = join_date;
      userData.leaveDate = leave_date;
      userData.employmentStatusId = req.body.employmentStatusId;
      userData.departmentId = req.body.departmentId;
      userData.roleId = req.body.roleId;
      userData.shiftId = req.body.shiftId;
      userData.leavePolicyId = req.body.leavePolicyId;
      userData.weeklyHolidayId = req.body.weeklyHolidayId;
    } else {
      // Owner can change only the password
      userData.password = await bcrypt.hash(req.body.password, saltRounds);
    }

    // Find and update the user in the Mongoose User model
    const updatedUser = await User.findByIdAndUpdate(id, userData, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Exclude the password field from the response
    const { password, ...userWithoutPassword } = updatedUser.toObject();

    return res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: error.message });
  }
};

const deleteSingleUser = async (req, res) => {
  // Only allow admins to delete other user records
  if (!req.auth.permissions.includes("delete-user")) {
    return res
      .status(401)
      .json({ message: "Unauthorized. Only admin can delete." });
  }

  try {
    const id = parseInt(req.params.id);

    // Find and update the user status in the Mongoose User model
    const deletedUser = await User.findByIdAndUpdate(
      id,
      { status: req.body.status },
      { new: true }
    );

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  login,
  register,
  getAllUser,
  getSingleUser,
  updateSingleUser,
  deleteSingleUser,
};
