import express from 'express';
const router = express.Router();
import userTable from '../Users/db_users.js';
import { Errors, Succes } from '../utility/constants.js';
import pool from '../../db2.js';
import { updateUser } from '../Users/update.js';
import MyError from '../utility/myError.js';
router.get('/getUsers', (req, res) => {
    pool.query(userTable.getUsers, []).then(data => {
        if (data.rowCount <= 0) {
            return res.status(404).json({
                message: Errors[14],
            });
        }
        return res.status(200).json(data.rows);
    }).catch(e => {
        console.log(e);
        return res.status(501).json({
            message: Errors[9],
        });
    });
});
router.get('/userTable', (req, res) => {
    // Get usernames and emails from database
    pool.query(userTable.nameEmail, []).then(data => {
        // If data is empty return an error
        if (data.rowCount <= 0) {
            return res.status(400).json({ message: Errors[22] });
        }
        // Return data
        return res.json(data.rows);
    }).catch(err => {
        console.log(err);
        return res.status(500).json({ message: Errors[9] });
    });
});
router.get('/user/:id', (req, res) => {
    // Get username
    const username = req.params.id;
    // Get email of user
    pool.query("SELECT email FROM User2 WHERE username=$1 AND deleted = false", [username]).then(data => {
        // Return an error if data is empty
        if (data.rowCount == 0) {
            return res.status(400).json({ message: Errors[22] });
        }
        let email = data.rows[0]['email'];
        // console.log(email);
        // return res.send("OK");
        // Get roles
        pool.query(userTable.userRoles, [username]).then(data => {
            // Return an error if data is empty
            if (data.rowCount == 0) {
                return res.status(400).json({ message: Errors[22] });
            }
            // Extract roles
            let roles = data.rows.map(row => {
                return row['name'];
            });
            // Send roles and email
            return res.json({ email, roles });
        }).catch(e => {
            console.log(e);
            return res.status(500).json({ message: Errors[9] });
        });
    }).catch(e => {
        console.log(e);
        return res.status(500).json({ message: Errors[9] });
    });
});
// Route To Add A User To A Company
router.post('/addUser', (req, res) => {
    // Get User Details And Roles From Frontend
    let { fname, lname, email, password, username, companyName, roles } = req.body;
    // Check if user with email already exists
    pool.query(userTable.doesUserExist, [email, username]).then(fetchResult => {
        // If the rows returned are not empty return an error
        if (fetchResult.rowCount > 0) {
            return res.status(400).json({ message: Errors[24] });
        }
        // Add user if doesn't exist
        pool.query(userTable.addUser, [fname, lname, email, password, username, companyName]).then(_ => {
            // Add user roles
            for (var i = 0; i < roles.length; i++) {
                if (i == roles.length - 1) {
                    pool.query(userTable.addUserRole, [username, roles[i]]).then(_ => {
                        return res.json({ message: "User Created" });
                    }).catch(err => {
                        console.log(err);
                        return res.status(501).json({ message: Errors[9] });
                    });
                }
                else {
                    pool.query(userTable.addUserRole, [username, roles[i]]).catch(err => {
                        console.log(err);
                        return res.status(501).json({ message: Errors[9] });
                    });
                }
            }
        }).catch(err => {
            console.log(err);
            return res.status(501).json({ message: Errors[9] });
        });
    }).catch(err => {
        console.log(err);
        return res.status(501).json({ message: Errors[9] });
    });
});
router.get('/getCompany/:username', (req, res) => {
    // Check if username exits
    pool.query(userTable.doesUsernameExist, [req.params.username]).then(fetchResult => {
        // If nothing is returned the user does not exist
        if (fetchResult.rowCount <= 0) {
            return res.status(404).json({ message: Errors[24] });
        }
        // Return company
        pool.query(userTable.getCompany, [req.params.username]).then(fetchResult => {
            // If nothing is returned returned error
            if (fetchResult.rowCount <= 0) {
                return res.status(400).json({ message: Errors[31] });
            }
            // Return company
            return res.json(fetchResult.rows[0]);
        }).catch(err => {
            console.log(err);
            return res.status(501).json({ message: Errors[9] });
        });
    }).catch(err => {
        console.log(err);
        return res.status(501).json({ message: Errors[9] });
    });
});
router.get('/getNameEmails/:username', (req, res) => {
    let username = req.params.username;
    pool.query(userTable.getNameEmail, [username]).then(data => {
        if (data.rowCount <= 0) {
            return res.status(404).json({ message: Errors[14] });
        }
        return res.status(200).json(data.rows);
    }).catch(err => {
        console.log(err);
        return res.status(501).json({ message: Errors[9] });
    });
});
router.post('/update', (req, res) => {
    let body = req.body;
    let username = body.username;
    let updateBody = {};
    if (body.fname) {
        updateBody.fname = body.fname;
    }
    if (body.lname) {
        updateBody.lname = body.lname;
    }
    if (body.email) {
        updateBody.email = body.email;
    }
    if (body.password) {
        updateBody.password = body.password;
    }
    if (body.roles) {
        updateBody.roles = body.roles;
    }
    // Update user
    updateUser(username, updateBody).then(_ => {
        return res.json({ message: Succes[17] });
    }).catch(err => {
        console.log(err);
        if (err instanceof MyError) {
            return res.status(501).json({ message: err.message });
        }
        else {
            return res.status(501).json({ message: Errors[9] });
        }
    });
});
export default router;
//# sourceMappingURL=users.js.map