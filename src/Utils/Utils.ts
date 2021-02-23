import * as Bcrypt from 'bcrypt';
import * as Multer from 'multer';

const storageOptions =
    Multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './src/uploads')
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname);
        }
    });
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/pdf') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

export class Utils {
    public MAX_TOKEN_TIME = 600000;
    public multer = Multer({storage: storageOptions, fileFilter: fileFilter});

    static generateVerificationToken(size: number = 5) {
        let digits = '0123456789';
        let otp = '';
        for (let i = 0; i < size; i++) {
            otp += digits[Math.floor(Math.random() * 10)];
        }
        return parseInt(otp);
    }

    static encryptPassword(password: string): Promise<any> {
        return new Promise((resolve, reject) => {
            Bcrypt.hash(password, 10, (err, hash) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(hash);
                }
            })
        })
    }

    static async comparePassword(password: { plainPassword: string, encryptedPassword: string }): Promise<any> {
        return new Promise(((resolve, reject) => {
            Bcrypt.compare(password.plainPassword, password.encryptedPassword, ((err, isSame) => {
                if (err) {
                    reject(err);
                } else if (!isSame) {
                    reject(new Error('User and Password Does not Match'));
                } else {
                    resolve(true);
                }
            }))
        }))
    }
}
