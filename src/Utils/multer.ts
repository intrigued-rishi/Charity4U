
const multer = require('multer');
const path = require('path');


var storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,'..','..','static','avatars'));
    },
    filename:function(req,file,cb){
        cb(null,file.fieldname+'-'+Date.now()+path.extname(file.originalname));
    }
});

module.exports.uploadAvatar = multer({storage:storage}).array('avatar');
