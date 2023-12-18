import logTable from './db_log.js';
import pool from '../../db2.js';
import MyError from '../utility/myError.js';
import { MyErrors2 } from '../utility/constants.js';

export class Log {
    // Create log
    static async createLog(ipaddress: string, userid: number, eventid: number, itemid?: number): Promise<void> {
        return new Promise((res, rej) => {
            pool.query(logTable.insertLog, [ipaddress, userid, itemid ?? 0, eventid]).then((_: any) => {
                return res();
            }).catch((err: any) => {
                return rej(new MyError(MyErrors2.NOT_GENERATE_LOG));
            })
        })
    }
}