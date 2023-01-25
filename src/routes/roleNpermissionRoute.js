const express = require("express");
const router = express.Router();
const roleRoute=require("../controllers/role")

router.post('/create',roleRoute.createRole)
router.get('/',roleRoute.getRole)
router.patch('/update/:id',roleRoute.updateRole);
router.delete('/delete/:id',roleRoute.deleteRole)

module.exports=router