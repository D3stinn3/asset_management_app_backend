// Importing the database bool from db2.js. This will allow me to connect to the database
import pool from '../../db2.js';

// Importing custom classes
import userTable from './db_users.js'
import MyError from '../utility/myError.js';
import { Errors, MyErrors2 } from '../utility/constants.js';

interface UserFromDB {
    fname: string;
    lname: string;
    email: string;
    password: string;
    username: string;
    companyname: string;
    usertype: number;
    delete: boolean
}

interface UserFetchResult {
    rowCount: number;
    rows: UserFromDB[]
}



class User {
    constructor(){}

    static async getName(username: string): Promise<string | never> {
        return new Promise((res, rej) => {
            pool.query(userTable.getName, [username]).then((data) => {
                if(data.rowCount > 0) {
                    return res(data.rows[0]['name']);
                }
            }).catch(err => {
                console.log(err);
                return rej(new MyError(Errors[9]));
            });
        });
    }

    static async checkIfUserExists(username: string): Promise<boolean> {
        return new Promise((res, rej) => {
            pool.query(userTable.checkIfUserInDB, [username]).then((data: UserFetchResult) => {
                if (data.rowCount > 0) {
                    res(true);
                } else {
                    res(false);
                }
            }).catch(err => {
                console.log(err);
                res(false);
            });
        });
    }

    static async checkIfUserIDExists(userID: number): Promise<boolean> {
        return new Promise((res, rej) => {
            pool.query(userTable.checkIfUserIDExists, [userID]).then((data: UserFetchResult) => {
                if (data.rowCount > 0) {
                    res(true);
                } else {
                    res(false)
                }
            }).catch(_ => {
                throw(new MyError(MyErrors2.USER_NOT_EXIST))
            })
        });
    }

    static async checkIfUserNameExists(username: string): Promise<boolean> {
        return new Promise((res, rej) => {
            pool.query(userTable.checkIfNameExists, [username]).then((data: UserFetchResult) => {
                if (data.rowCount > 0) {
                    res(true);
                } else {
                    res(false);
                }
            }).catch(err => {
                console.log(err);
                res(false);
            });
        });
    }
}

export default User;