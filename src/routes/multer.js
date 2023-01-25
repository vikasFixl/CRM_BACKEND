const multer=require("multer")
const path=require("path")

const storage = multer.diskStorage({
    destination:__dirname+'/uploads/logos',
    filename: (req, file, cb) => {
        cb(null,file.fieldname+'-'+Math.random()+Date.now()+path.extname(file.originalname))
    }
});

const upload = multer({
    storage:storage
});

module.exports=upload;