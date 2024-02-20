import pool from "../../db2.js";
import reportTable from "./db_reports.js";
import { EventItemTypes, Log } from "../Log/log.js";
import { AuditTrailEntry } from "./audit_trail.js";
import MyError from "../utility/myError.js";
import { MyErrors2 } from "../utility/constants.js";
import { ResultFromDatabase } from "../utility/helper_types.js";
import { AssetRegisterData, ChainOfCustody, RawAssetMovement, RawAssetRegisterData, RawGatepassReport } from "./helpers.js";

interface RawAuditTrailResults {
    name: string;
    username: string;
    ipaddress: string;
    timestamp: Date,
    description: string;
    item: string
}

interface AuditTrailFetchResult {
    rowCount: number;
    rows: RawAuditTrailResults[]
}
const baseAssetRegister = `SELECT a.serialnumber AS serial_number, TO_CHAR(a.acquisitiondate, 'YYYY-MM-DD') AS acquisition_date, a.condition, (SELECT name AS responsible_users_name FROM User2 
    WHERE id = a.responsibleuserid LIMIT 1), a.acquisitioncost AS acquisition_cost, a.residualvalue AS residual_value, c.name AS category_name, 
    a.usefullife AS useful_life, a.barcode, a.description, a.locationid AS locationid, TO_CHAR(a.disposaldate, 'YYYY-MM-DD') AS expected_depreciation_date, 
    GREATEST(DATE_PART('day', disposaldate - NOW()), 0) AS days_to_disposal FROM Asset a FULL JOIN Category c ON c.id = a.categoryid`;

const baseAssetRegisterQueryWithDeletedAssets = baseAssetRegister + ' WHERE a.deleted = true ';

const baseAssetRegisterQueryWithNonDeletedAssets = baseAssetRegister + ' WHERE a.deleted = false ';

function getResultsFromDatabase<T>(query: string, args: any[]): Promise<T[]> {
    return new Promise((res, rej) => {
        pool.query(query, args).then((data: ResultFromDatabase<T>) => {
            return res(data.rows);
        }).catch((err: any) => {
            return rej(new MyError(MyErrors2.NOT_GET_FROM_DATABASE));
        })
    })
}

export default class ReportDatabase {
    static getGatepassReport(assetID: number): Promise<RawGatepassReport[]> {
        return new Promise((res, rej) => {
            let query = `SELECT g.reason AS gatepass_reason, g.fromlocation, g.tolocation, TO_CHAR(g.date, 'YYYY-MM-DD') AS leaving_time, g.comment AS 
            gatepass_comment, g.approved AS is_gatepass_approved, u.username AS assigned_user_username, u.name AS assigned_user_name, a.description AS 
            asset_description, a.barcode FROM GatepassAsset ga INNER JOIN Gatepass g ON g.id = ga.gatepassid INNER JOIN Asset a ON a.assetid = ga.assetid 
            INNER JOIN User2 u ON u.id = g.userid WHERE g.deleted = false AND ga.assetid = $1`;

            getResultsFromDatabase<RawGatepassReport>(query, [assetID]).then(data => {
                return res(data);
            }).catch((err: MyError) => {
                return rej(err);
            })
        })
    }

    /**
     * @param startDate The start of acquisition period
     * @param endDate End of acquisition period
     * @param locationid Location of assets
     * @returns The list of assets that were purchased in specified period and in the specific location
     */
    static getAcquiredAssetsInLocation(startDate: Date, endDate: Date, locationid: number): Promise<RawAssetRegisterData[]> {
        return new Promise((res, rej) => {
            let query = baseAssetRegisterQueryWithNonDeletedAssets + " AND a.locationid = $1 AND a.acquisitiondate BETWEEN $2 AND $3";

            // Call query
            getResultsFromDatabase<RawAssetRegisterData>(query, [locationid, startDate, endDate]).then(data => {
                return res(data);
            }).catch((err: MyError) => {
                return rej(err);
            })
        })
    }

    /**
     * 
     * @param locationid Location to get assets of
     * @returns The details of assets in specified location
     */
    static getAssetsInLocation(locationid: number): Promise<RawAssetRegisterData[]> {
        return new Promise((res, rej) => {
            let query = baseAssetRegisterQueryWithNonDeletedAssets + " AND a.locationid = $1";

            // Run query and return results
            getResultsFromDatabase<RawAssetRegisterData>(query, [locationid]).then(data => {
                return res(data);
            }).catch((err: MyError) => {
                return rej(err);
            })
        })
    }

    /**
     * 
     * @param assetid ID of the asset you want to see movements of
     * @returns Movement data
     */
    static getAssetMovements(assetid: number): Promise<RawAssetMovement[]> {
        return new Promise((res, rej) => {
            let query = `SELECT a.barcode, a.description AS asset_description, locationid, TO_CHAR(scannedtime, 'YYYY-MM-DD') AS time_moved FROM Processedtags p 
                        INNER JOIN Asset a ON p.assetid = a.assetid WHERE a.assetid = $1`;

            // Call and get data
            getResultsFromDatabase<RawAssetMovement>(query, [assetid]).then(data => {
                return res(data);
            }).catch((err: MyError) => {
                return rej(err);
            })
        })
    }

    /**
     * 
     * @param assetid The id of the asset you want to see chain of custody of
     * @returns Details of times asset has been allocated
     */
    static getChainOfCustody(assetid: number): Promise<ChainOfCustody[]> {
        return new Promise((res, rej) => {
            let query = `SELECT u.username AS username, u.name AS name_of_user, TO_CHAR(l.timestamp, 'YYYY-MM-DD') AS time_allocated, e.description AS event_description, 
                        a.description AS asset_description FROM Log l INNER JOIN Events e ON e.id = l.eventid INNER JOIN Asset a ON a.assetid = l.itemid INNER JOIN User2 u 
                        ON u.id = l.toid WHERE l.eventid = 37 AND l.itemid = $1`;

            getResultsFromDatabase<ChainOfCustody>(query, [assetid]).then(data => {
                return res(data);
            }).catch((err: MyError) => {
                return rej(err);
            })
        })
    }
    
    /**
     * 
     * @returns assets that are in the stock takes but not in the asset register
     */
    static getStockTakeAssetsNotInRegister(): Promise<RawAssetRegisterData[]> {
        return new Promise((res, rej) => {
            // Gets all assets from non deleted batches
            let query = baseAssetRegisterQueryWithDeletedAssets + " AND a.assetid IN (SELECT ba.assetid FROM batchasset ba INNER JOIN Batch b ON b.id = ba.batchid WHERE b.deleted = false)";

            // Call query and return results
            getResultsFromDatabase<RawAssetRegisterData>(query, []).then(data => {
                return res(data);
            }).catch((err: MyError) => {
                return rej(err);
            });
        });
    }

    /**
     * Gets all of the assets that are in any batch in the system that also appears in the asset register
     */
    static getStockTakeAssetsInRegister(): Promise<RawAssetRegisterData[]> {
        return new Promise((res, rej) => {
            // Gets all assets from non deleted batches
            let query = baseAssetRegisterQueryWithNonDeletedAssets + " AND a.assetid IN (SELECT ba.assetid FROM batchasset ba INNER JOIN Batch b ON b.id = ba.batchid WHERE b.deleted = false)";

            // Call query and return results
            getResultsFromDatabase<RawAssetRegisterData>(query, []).then(data => {
                return res(data);
            }).catch((err: MyError) => {
                return rej(err);
            });
        })
    }

    static getAssetRegisterData(): Promise<RawAssetRegisterData[]> {
        return new Promise((res, rej) => {
            // Query to get data from database
            let query = baseAssetRegisterQueryWithNonDeletedAssets;

            // Call query and return results
            getResultsFromDatabase<RawAssetRegisterData>(query, []).then(data => {
                return res(data);
            }).catch((err: MyError) => {
                return rej(err);
            });
        })
    }

    static getAssetDisposalData(startDate: Date, endDate: Date): Promise<RawAssetRegisterData[]> {
        return new Promise((res, rej) => {
            let query = baseAssetRegisterQueryWithNonDeletedAssets + `AND a.disposaldate BETWEEN $1 AND $2`;
            console.log(query);

            // Call query and return results
            getResultsFromDatabase<RawAssetRegisterData>(query, [startDate, endDate]).then(data => {
                return res(data);
            }).catch((err: MyError) => {
                return rej(err);
            });
        })
    }
    
    // Function to get audit trail details
    static getAuditTrails(userid: number, eventtype: string, fromDate: Date, toDate: Date): Promise<AuditTrailEntry[]> {
        return new Promise((res, rej) => {
            // Get the type of item the audit trail is 
            let itemtype = Log.getLogEventItemType(eventtype);

            // Get the query to use based on itemtype
            let query;
            switch (itemtype) {
                case EventItemTypes.Asset:
                    query = reportTable.assetaudittrail;
                    break;
                case EventItemTypes.Category:
                    query = reportTable.categoryaudittrail;
                    break;
                case EventItemTypes.Location:
                    query = reportTable.locationaudittrail;
                    break;
                case EventItemTypes.User:
                    query = reportTable.useraudittrail;
                    break;
                case EventItemTypes.Report:
                    query = reportTable.useraudittrail;
                    break;
                case EventItemTypes.Reader:
                    query = reportTable.readeraudittrail;
                    break;
                case EventItemTypes.GatePass:
                    query = reportTable.gatepassaudittrail;
                    break;
                case EventItemTypes.Batch:
                    query = reportTable.batchaudittrail;
                    break;
                case EventItemTypes.Inventory:
                    query = reportTable.inventoryaudittral;
                    break;
                default:
                    return rej(new MyError(MyErrors2.LOG_EVENT_NOT_EXIST));
            }

            // Run query
            pool.query(query, [userid, eventtype, fromDate, toDate]).then((fetchResult: AuditTrailFetchResult) => {
                if (fetchResult.rowCount <= 0) {
                    return res([]);
                }

                const results: AuditTrailEntry[] = fetchResult.rows.map((e) => {
                    return {
                        name_of_user: e.name,
                        username: e.username,
                        ip: e.ipaddress,
                        date_of_event: e.timestamp.toISOString().slice(0, 10),
                        description: e.description,
                        item: e.item
                    }
                })

                return res(results);
            }).catch((err: any) => {
                return rej(new MyError(MyErrors2.NOT_GENERATE_REPORT));
            })
        })
    }
}

