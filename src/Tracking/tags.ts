import pool from "../../db2.js";
import Asset from "../Allocation/Asset/asset2.js";
import { Errors, MyErrors2 } from "../utility/constants.js";
import MyError from "../utility/myError.js";
import utility from "../utility/utility.js";
import locationTable from "./db_location.js";
import _ from 'lodash';

interface processedTag {
    scannedTime: Date;
    assetID: number;
    readerDeviceID: string;
}

export interface rawTag {
    commandCode: string;
    hardwareKey: string;
    tagRecNums: string;
    antNo: string;
    pc:  string;
    epcID: string;
    crc: string;
}

export interface SyncItem {
    barcode: string;
    timestamp: string;
}

export function syncTags(tags: SyncItem[]): Promise<void> {
    return new Promise((res, rej) => {
        let promises: Promise<void>[] = [];

        // Sync every tag
        tags.forEach((tag) => promises.push(syncTag(tag)));

        Promise.all(promises).then(_ => {
            return res();
        }).catch(err => {
            console.log(err);
            if (err instanceof MyError) {
                return rej(err);
            } else {
                return rej(new MyError(MyErrors2.NOT_STORE_CONVERTED));
            }
        })
    });
}

export function syncTag(tag: SyncItem): Promise<void> {
    return new Promise((res, rej) => {
        // Check if asset exist
        Asset._doesBarCodeExist(tag.barcode).then(doesExist => {
            if (doesExist == false) {
                return rej(new MyError(MyErrors2.ASSET_NOT_EXIST));
            } 

            let timestamp = new Date(tag.timestamp);
            // Convert date to ISO string
            let dateToAdd = timestamp.toISOString();
            Asset._getAssetID(tag.barcode).then(assetID => {
                pool.query(locationTable.syncItem, [dateToAdd, true, true, assetID]).then(() => {
                    return res();
                }).catch(err => {
                    console.log(err);
                    return rej(new MyError(MyErrors2.NOT_STORE_CONVERTED));
                })
            }).catch(err => {
                console.log(err);
                return rej(new MyError(MyErrors2.NOT_STORE_CONVERTED));
            });
        }).catch(err => {
            console.log(err);
            if (err instanceof MyError) {
                return rej(err);
            } else {
                return rej(new MyError(MyErrors2.NOT_STORE_CONVERTED));
            }
        })
    });
}

function convertRawTagToProcessedTag(rawTag: rawTag): Promise<processedTag> {
    return new Promise((res, rej) => {
        let readerDeviceID = rawTag.hardwareKey + rawTag.antNo;
        let scannedTime = new Date();
        Asset._getAssetID(rawTag.epcID).then(assetID => {
            return res({scannedTime, assetID, readerDeviceID});
        }).catch(err => {
            console.log(err);
            return rej(new MyError(Errors[73]));
        });
    });
}

function addProcessedTagToDB(processedTag: processedTag): Promise<void> {
    return new Promise((res, rej) => {
        pool.query(locationTable.addProcessedTag, [processedTag.scannedTime, processedTag.assetID, processedTag.readerDeviceID]).then(_ => {
            return res();
        }).catch(err => {
            console.log(err);
            return rej(new MyError(Errors[73]));
        });
    });
}

export function addProcessedTag(tags: Set<string>): Promise<void> {
    return new Promise((res, rej) => {
        if (tags.size == 0) {
            return res();
        } else {
            let promises: Promise<void>[] = [];
            tags.forEach(tag => {
                let newTag:rawTag = JSON.parse(tag);
                promises.push(convertRawTagToProcessedTag(newTag).then(processedTag => {
                    return addProcessedTagToDB(processedTag);
                }));
            });
            Promise.all(promises).then(_ => {
                return res();
            }).catch(err => {
                console.log(err);
                return rej(new MyError(Errors[73]));
            });
        }
    });
}

export function convertHexToASCII(hexStr: string): string {
    let asciiStr = '';
    for (let i = 0; i < hexStr.length; i += 2) {
        asciiStr += String.fromCharCode(parseInt(hexStr.substring(i, i+2), 16));
    }
    return asciiStr;
}