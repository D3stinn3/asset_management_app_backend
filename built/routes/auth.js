import express from 'express';
let router = express.Router();
import verifyAuthenticationDetails from '../Auth/verify_password.js';
import { MyErrors2 } from '../utility/constants.js';
import User from '../Users/users.js';
import Auth from '../Auth/auth.js';
import JWT from 'jsonwebtoken';
import dotenv from 'dotenv';
import Mail from '../Mail/mail.js';
dotenv.config();
router.post('/sendDetails', (req, res) => {
    // Accepts username and password from the user
    const username = req.body.username;
    const password = req.body.password;
    // Checks if password username combo is correct 
    verifyAuthenticationDetails(username, password).then(isCorrect => {
        // If authentication details are not right
        if (!isCorrect) {
            // return indication that combo was wrong  
            return res.status(200).json({ isCorrect: false });
        }
        // If correct return id of user and indication that details are correct
        User.getUserID(username).then(id => {
            return res.json({ isCorrect: true, id });
        });
    }).catch((err) => {
        return res.status(500).json({ message: MyErrors2.INTERNAL_SERVER_ERROR });
    });
});
router.post('/generateOTP', (req, res) => {
    const userid = Number.parseInt(req.body.id);
    Auth.generateOTP(userid).then(otp => {
        // Send message to users email with OTP
        // Get email of user
        User.getEmail(userid).then(email => {
            // Send email
            const emailBody = `
            <p>Hi ${email}</p>
            <p>We received your request for a single-use code to use with your Extreme Wireless Asset Management account.</p>
            <p>Your single-use code is: ${otp}</p>
            <p>If you didn't request this code, you can safely ignore this email. Someone else might have typed your email address by mistake.</p>
            <p>Thanks,</p>
            <p>The Extreme Wireless Asset Management account team</p>
            `;
            const from = "Extreme Wireless Asset Management account team <account-security-noreply@mail.extremeusers.com>";
            const to = email;
            const subject = "Your Single Use Code";
            Mail.sendMail(emailBody, from, to, subject).then((_) => {
                return res.send("Done");
            }).catch((err) => {
                console.log(err);
                return res.status(500).json({ message: MyErrors2.INTERNAL_SERVER_ERROR });
            });
        }).catch((err) => {
            console.log(err);
            return res.status(500).json({ message: MyErrors2.INTERNAL_SERVER_ERROR });
        });
    }).catch((err) => {
        console.log(err);
        return res.status(500).json({ message: MyErrors2.INTERNAL_SERVER_ERROR });
    });
});
router.post('/verifyOTP', (req, res) => {
    // Get OTP entered by user and user id
    const userid = Number.parseInt(req.body.id);
    const otp = req.body.otp;
    // Verify if OTP is correct
    Auth.verifyOTP(userid, otp).then(isCorrect => {
        // If not correct return not correct
        if (!isCorrect) {
            return res.json({ isCorrect: false });
        }
        // Get username of user to be returned in webtoken
        User.getUsername(userid).then(username => {
            var _a;
            // Send JWT token
            const token = JWT.sign({ id: userid }, (_a = process.env.TOKEN_SECRET) !== null && _a !== void 0 ? _a : "", { expiresIn: 3600 });
            return res.json({
                isCorrect: true,
                token,
                username,
                user_id: userid
            });
        }).catch((err) => {
            return res.status(500).json({ message: MyErrors2.INTERNAL_SERVER_ERROR });
        });
    }).catch((err) => {
        return res.status(500).json({ message: MyErrors2.INTERNAL_SERVER_ERROR });
    });
});
export default router;
//# sourceMappingURL=auth.js.map