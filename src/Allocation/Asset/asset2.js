import fs from 'fs';

// Importing the database bool from db2.js. This will allow me to connect to the database
import pool from '../../../db2.js';

// Importing custom classes
import MyError from '../../../utility/myError.js';
import utility from '../../../utility/utility.js';
import Location from '../../Tracking/location.js';
import User from '../../Users/users.js';
import Category from '../Category/category2.js';
import assetTable from './db_assets.js';
import { Errors } from '../../../utility/constants.js';


class Asset {
    static assetStatusOptions = ['good', 'excellent', 'fair'];

    constructor(barCode, assetLifeSpan, acquisitionDate, locationID, status, custodianName,
        acquisitionCost, categoryName, attachments, noInBuilding, 
        serialNumber, residualValue, code, description, depreciaitionType, depreciationPercent) {
        // utility.checkIfBoolean(fixed, "Invalid Fixed Status");
        // this.fixed = fixed;

        utility.checkIfNumberisPositive(assetLifeSpan, "Invalid asset life span");
        this.assetLifeSpan = assetLifeSpan;

        this.acquisitionDate = utility.checkIfValidDate(acquisitionDate, "Invalid acquisition date");

        utility.checkIfNumberisPositive(locationID, "Invalid location ID");
        this.locationID = locationID;

        if (!status instanceof String) {
            throw new MyError("Invalid status");
        }
        utility.checkIfInList(Asset.assetStatusOptions, status.toLowerCase(), "Invalid status");
        this.status = status;

        this.custodianName = custodianName;

        utility.checkIfNumberisPositive(acquisitionCost, "Invalid acquisition cost");
        this.acquisitionCost = acquisitionCost;

        // utility.checkIfNumberisPositive(insuranceValue, "Invalid insurance value");
        // this.insuranceValue = insuranceValue;

        utility.checkIfString(description, "Invalid Description");
        this.description = description;

        utility.checkIfString(code, "Invalid Code");
        this.code = code;

        utility.checkIfString(barCode, "Invalid Barcode");
        this.barCode = barCode;

        utility.checkIfNumberisPositive(noInBuilding, "Invalid Number in Building");
        this.noInBuilding = noInBuilding;

        utility.checkIfString(depreciaitionType, "Invalid Depreciation Type");
        this.depreciaitionType = depreciaitionType;

        utility.checkIfNumberisPositive(depreciationPercent, "Invalid Depreciation Percent");
        this.depreciationPercent = depreciationPercent;

        this.categoryName = categoryName;

        if (!Array.isArray(attachments)) {
            throw new MyError("Attachments is not array")
        } else {
            if (attachments.length) {
                for (let i = 0; i < attachments.length; i++) {
                    if (!fs.existsSync(attachments[i])) {
                        throw new MyError(Errors[4]);
                    }
                }
            }
        }
        this.attachments = attachments;
        // this.makeAndModelNo = makeAndModelNo;
        this.serialNumber = serialNumber;

        if (residualValue) {
            utility.checkIfNumberisPositive(residualValue, "Invalid Residual Value");
            this.residualValue = residualValue;
        } else {
            this.residualValue = null;
        }
    }
    // Since the constructor cannot make asynchronous calls a seprate initialize function is needed to initialize
    // asynchronous values
    async initialize() {
        if (!await Category._doesCategoryExist(this.categoryName)) {
            throw new MyError(Errors[5]);
        }
        try {
            this.categoryID = await Category._getCategoryID(this.categoryName);
        } catch (err) {
            console.log(err);
            throw new MyError(Errors[6]);
        }
        if (! await Location.verifyLocationID(this.locationID)) {
            throw new MyError(Errors[3]);
        }
        await User.checkIfUserExists(this.custodianName, "Invalid custodian");
        if (await Asset._doesBarCodeExist(this.assetTag)) {
            throw new MyError(Errors[7]);
        }
        let depreciaitionType = Category._getCategoryDepreciationType(this.categoryID);
        if (depreciaitionType !== "Straight Line") {
            if (this.residualValue) {
                throw new MyError("Invalid Residual Value for Depreciation Type");
            }
        }

        await this._storeAssetInAssetRegister();
    }

    static async _doesAssetTagExist(assetTag) {
        let fetchResult;
        try {
            fetchResult = await pool.query(assetTable.doesAssetTagExist, [assetTag]);
        } catch (err) {
            throw new MyError("Could Not Verify Asset Tag");
        }

        if (utility.isFetchResultEmpty(fetchResult)) {
            return false;
        } else {
            return true;
        }
    }

    static _doesBarCodeExist(barCode) {
        return new Promise((res, rej) => {
            pool.query(assetTable.doesBarCodeExist, [barCode]).then(fetchResult => {
                if (utility.isFetchResultEmpty(fetchResult)) {
                    res(false);
                } else {
                    res(true);
                }
            }).catch(err => {
                console.log(err);
                rej(new MyError(Errors[36]));
            });
        })
    }

    async _storeAssetInAssetRegister() {
        try {
            await pool.query(assetTable.addAssetToAssetRegister, [this.barCode ,this.noInBuilding, this.description, this.code, this.serialNumber,
            this.acquisitionDate, this.locationID, this.residualValue, this.status, this.custodianName, this.acquisitionCost, this.categoryID,
            this.assetLifeSpan, this.depreciaitionType, this.depreciationPercent]);
            await Asset._insertAssetAttachments(this.assetTag, this.attachments);
        } catch (err) {
            console.log(err);
            throw new MyError("Could not add asset to asset Register");
        }
    }

    static async _getAssetCategoryName(assetTag) {
        let fetchResult;

        if (! await Asset._doesAssetTagExist(assetTag)) {
            throw new MyError("Asset Does Not Exist");
        } else {
            try {
                fetchResult = await pool.query(assetTable.getAssetCategoryName, [assetTag]);
            } catch (err) {
                throw new MyError("Could Not Get Category Name");
            }

            utility.verifyDatabaseFetchResults(fetchResult, "Nothing Was Returned From Database");

            return fetchResult.rows[0].name;
        }
    }

    static async _updateAssetAcquisitionDate(assetTag, newDate) {
        await pool.query(assetTable.updateAssetAcquisitionDate, [newDate, assetTag]);
    }

    static async _updateAssetFixedStatus(assetTag, newFixedStatus) {
        await pool.query(assetTable.updateAssetFixedStatus, [newFixedStatus, assetTag]);
    }

    static async _updateAssetLifeSpan(assetTag, newLifeSpan) {
        await pool.query(assetTable.updateAssetLifeSpan, [newLifeSpan, assetTag]);
    }

    static async _updateAssetLocation(assetTag, newLocation) {
        await pool.query(assetTable.updateAssetLocation, [newLocation, assetTag]);
    }

    static async _updateAssetStatus(assetTag, newStatus) {
        await pool.query(assetTable.updateAssetStatus, [newStatus, assetTag]);
    }

    static async _updateAssetCustodian(assetTag, newCustodian) {
        await pool.query(assetTable.updateAssetCustodian, [newCustodian, assetTag]);
    }

    static async _updateAssetAcquisitionCost(assetTag, newAcquisitionCost) {
        await pool.query(assetTable.updateAssetAcquisitionCost, [newAcquisitionCost, assetTag]);
    }

    static async _updateAssetInsuranceValue(assetTag, newInsuranceValue) {
        await pool.query(assetTable.updateAssetInsuranceValue, [newInsuranceValue, assetTag]);
    }

    static async _updateAssetCategoryID(assetTag, newCategoryID) {
        await pool.query(assetTable.updateAssetCategory, [newCategoryID, assetTag]);
    }

    static async _insertAssetAttachments(assetTag, attachments) {
        for (let i = 0; i < attachments.length; i++) {
            await pool.query(assetTable.addAssetFileAttachment, [assetTag, attachments[i]]);
        }
    }

    static async _updateAssetResidualValue(assetTag, residualValue) {
        await pool.query(assetTable.updateAssetResidualValue, [residualValue, assetTag]);
    }

    static async updateAsset(updateAssetDict, assetTag) {
        // Throw an error if no asset with asset tag exists
        if (!await Asset._doesAssetTagExist(assetTag)) {
            throw new MyError("Asset Does Not Exist");
        }

        if ('fixed' in updateAssetDict) {
            utility.checkIfBoolean(updateAssetDict.fixed, "Invalid Fixed Status");
            await utility.addErrorHandlingToAsyncFunction(Asset._updateAssetFixedStatus,
                "Invalid Fixed Status", assetTag,
                updateAssetDict.fixed);
        }
        else if ('assetLifeSpan' in updateAssetDict) {
            utility.checkIfNumberisPositive(updateAssetDict.assetLifeSpan, "Invalid asset life span");
            await utility.addErrorHandlingToAsyncFunction(Asset._updateAssetLifeSpan, "Invalid asset life span",
                assetTag, updateAssetDict.assetLifeSpan);
        }
        else if ('acquisitionDate' in updateAssetDict) {
            newDate = utility.checkIfValidDate(updateAssetDict.acquisitionDate, "Invalid acquisition date");
            await utility.addErrorHandlingToAsyncFunction(Asset._updateAssetAcquisitionDate, "Invalid acquisition date",
                assetTag, newDate);
        }
        else if ('locationID' in updateAssetDict) {
            await Location.verifyLocationID(updateAssetDict.locationID, "Invalid location");
            await utility.addErrorHandlingToAsyncFunction(Asset._updateAssetLocation, "Invalid location",
                assetTag, updateAssetDict.locationID);
        }
        else if ('status' in updateAssetDict) {
            if (!updateAssetDict.status instanceof String) {
                throw new MyError("Invalid status");
            }
            utility.checkIfInList(Asset.assetStatusOptions, updateAssetDict.status.toLowerCase(), "Invalid status");
            await utility.addErrorHandlingToAsyncFunction(Asset._updateAssetStatus, "Invalid status",
                assetTag, updateAssetDict.status);
        }
        else if ('custodianName' in updateAssetDict) {
            await User.checkIfUserExists(updateAssetDict.custodianName, "Invalid custodian");
            await utility.addErrorHandlingToAsyncFunction(Asset._updateAssetCustodian, "Invalid custodian",
                assetTag, updateAssetDict.custodianName);
        }
        else if ('acquisitionCost' in updateAssetDict) {
            utility.checkIfNumberisPositive(updateAssetDict.acquisitionCost, "Invalid acquisition cost");
            await utility.addErrorHandlingToAsyncFunction(Asset._updateAssetAcquisitionCost, "Invalid acquisition cost",
                assetTag, updateAssetDict.acquisitionCost);
        }
        else if ('insuranceValue' in updateAssetDict) {
            utility.checkIfNumberisPositive(updateAssetDict.insuranceValue, "Invalid insurance value");
            await utility.addErrorHandlingToAsyncFunction(Asset._updateAssetInsuranceValue, "Invalid insurance value",
                assetTag, updateAssetDict.insuranceValue);
        }
        else if ('categoryName' in updateAssetDict) {
            try {
                if (!await Category._doesCategoryExist(updateAssetDict.categoryName)) {
                    throw new MyError("Invalid category");
                } else {
                    let categoryID = await Category._getCategoryID(updateAssetDict.categoryName);
                    await Asset._updateAssetCategoryID(assetTag, categoryID);
                }
            } catch (err) {
                throw new MyError("Invalid category");
            }
        }
        else if ('attachments' in updateAssetDict) {
            if (!Array.isArray(updateAssetDict.attachments)) {
                throw new MyError("Invalid attachments")
            } else {
                if (updateAssetDict.attachments.length) {
                    for (let i = 0; i < updateAssetDict.attachments.length; i++) {
                        if (!fs.existsSync(updateAssetDict.attachments[i])) {
                            throw new MyError("Invalid attachments");
                        }
                    }
                }
            }
            await utility.addErrorHandlingToAsyncFunction(Asset._insertAssetAttachments, "Invalid attachments",
                assetTag, updateAssetDict.attachments);
        }
        else if ('residualValue' in updateAssetDict) {
            utility.checkIfNumberisPositive(updateAssetDict.residualValue, "Invalid Residual Value");
            let assetCategoryName = utility.addErrorHandlingToAsyncFunction(Asset._getAssetCategoryName, "Could not get category name for asset",
                assetTag);
            if (assetCategoryName !== "Straight Line") {
                if (updateAssetDict.residualValue) {
                    throw new MyError("Invalid Residual Value for the Depreciation Type");
                }
            }
            utility.addErrorHandlingToAsyncFunction(Asset._updateAssetResidualValue, "Invalid Residual Value",
                assetTag, updateAssetDict.residualValue);
        }
    }

    static async displayAllAssetTags() {
        try {
            let fetchResult = await pool.query(assetTable.getAssetTags);
            let assetTags = fetchResult.rows.map(obj => obj.assettag);
            return assetTags;
        } catch (err) {
            console.log(err);
            throw new MyError("Could not get asset tags");
        }
    }

    static async disposeAsset(assetTag) {
        try {
            await pool.query(assetTable.disposeAsset, [assetTag]);
        } catch (err) {
            throw new MyError("Asset Could Not Be Deleted");
        }
    }

    static _insertDepreciationSchedule(assetTag, year, openBookValue, depreciationExpense, closingBookValue, accumulatedDepreciation) {
        return new Promise((res, rej) => {
            pool.query(assetTable.insertDepreciationSchedule, [year, openBookValue, depreciationExpense, accumulatedDepreciation, closingBookValue, assetTag]).then(_ => {
                res("Done")
            }).catch(err => {
                console.log(err);
                rej(err)
            })
        })
    }

    static _getCloseBookValue(assetTag, year) {
        return new Promise((res, rej) => {
            pool.query(assetTable.getCloseBookValue, [assetTag, year]).then(fetchresult => {
                if(fetchresult.rowCount <= 0) {
                    return rej(new MyError("No Close Book Value For Asset"))
                }
                var closingBookVal = fetchresult.rows[0].closingbookvalue
                return res(closingBookVal)
            })
        })
    }

    static async _getAccumulatedDepreciation(assetTag) {
        return new Promise((res, rej) => {
            pool.query(assetTable.getAccumulatedDepreciation, [assetTag]).then(fetchResult => {
                if(fetchResult.rowCount <= 0) {
                    return rej(new MyError("Could Not Get Accumulated Depreciation"))
                }
                return res(fetchResult.rows[0]['sum'])
            })
        })
    }

    static async createDepreciationSchedule(depreciationType, assetTag, assetLifeSpan, acquisitionCost, acquisitionDate, residualValue, depreciationPercentage) {
        if (!await Asset._doesAssetTagExist(assetTag)) {
            throw new MyError("Asset Does Not Exist");
        }

        let year;
        let openBookValue;
        let depreciationExpense;
        let accumulatedDepreciation;
        let closingBookValue;

        const getOpenBookValue = (i, acquisitionCost, assetTag, year) => {
            return new Promise((res, rej) => {
                if (i == 0) {
                    res(acquisitionCost)
                } else {
                    Asset._getCloseBookValue(assetTag, year).then(val => {
                        res(val)
                    }).catch(err => {
                        console.log(`i is ${i}`)
                        console.log(err);
                        rej(new MyError("No close book value"));
                    })
                }
            })
        }

        const getDepreciationExpense = (depreciationType, acquisitionCost, residualValue, assetLifeSpan, openBookValue, depreciationPercentage) => {
            return new Promise((res, rej) => {
                if (depreciationType === "Straight Line") {
                    return res((acquisitionCost - residualValue) / assetLifeSpan);
    
                } else if (depreciationType === "Double Declining Balance") {
                    return res(2 * (1 / assetLifeSpan) * openBookValue);
    
                } else if (depreciationType === "Written Down Value") {
                    return res(openBookValue * (depreciationPercentage / 100));
    
                } else {
                    return rej(new MyError("Depreciation Type is not supported"));
                }
            })
        }

        const getAccumulatedDepreciation = (i, depreciationExpense, assetTag) => {
            return new Promise((res, rej) => {
                if (i == 0) {
                    return res(depreciationExpense);
                } else {
                    Asset._getAccumulatedDepreciation(assetTag).then(val => {
                        return res(val + depreciationExpense)
                    }).catch(err => {
                        console.log(err);
                        return rej(new MyError("Could Not Get Accumulated Depreciation"));
                    })
                }
            })
        }

        let i = 0;

        function loop() {
            if (i < assetLifeSpan) {
                year = acquisitionDate.getFullYear() + i;
                return getOpenBookValue(i, acquisitionCost, assetTag, year - 1).then(openBookValue => {
                    return getDepreciationExpense(depreciationType, acquisitionCost, residualValue, assetLifeSpan, openBookValue, depreciationPercentage).then(depreciationExpense => {
                        return getAccumulatedDepreciation(i, depreciationExpense, assetTag).then(accumulatedDepreciation => {
                            closingBookValue = openBookValue - depreciationExpense;
                            return Asset._insertDepreciationSchedule(assetTag, year, openBookValue, depreciationExpense, closingBookValue, accumulatedDepreciation).then(() => {
                                i++;
                                return loop();
                            })
                        })
                    })
                }).catch(err => {
                    console.log(err)
                    throw new MyError("Invalid Depreciation Schedule Entry")
                })
            } else {
                Promise.resolve();
            }
        }

        return loop();

        // return new Promise((res, rej) => {
        //     for(let i = 0; i < assetLifeSpan; i++) {
        //         // Get openbookvalue
        //         getOpenBookValue(i, acquisitionCost, assetTag, year).then(val1 => {
        //             year = acquisitionDate.getFullYear() + i;
        //             openBookValue = val1

        //             // Get Depreciation Expense
        //             getDepreciationExpense(depreciationType, acquisitionCost, residualValue, assetLifeSpan, openBookValue, depreciationPercentage).then(val2 => {
        //                 depreciationExpense = val2;
        //                 console.log("Done 1")

        //                 // Get Accumulated Depreciation
        //                 getAccumulatedDepreciation(i, depreciationExpense, assetTag).then(val3 => {
        //                     accumulatedDepreciation = val3;
        //                     console.log("Done 2")

        //                     // Insert deprecition schedule
        //                     closingBookValue = openBookValue - depreciationExpense;
        //                     console.log(assetTag, year, openBookValue, depreciationExpense, accumulatedDepreciation, closingBookValue);
        //                     Asset._insertDepreciationSchedule(assetTag, year, openBookValue, depreciationExpense, closingBookValue, accumulatedDepreciation).then(_ => {
        //                         console.log("Depreciation Schedule Created");
        //                     }).catch(err => {
        //                         console.log(1)
        //                         console.log(err);
        //                         return rej(new MyError("Invalid Depreciation Schedule Entry"));
        //                     })
        //                 }).catch(err => {
        //                     console.log(2)
        //                     console.log(err);
        //                     return rej(err);
        //                 })
        //             }).catch(err => {
        //                 console.log(3)
        //                 console.log(err)
        //                 return rej(err)
        //             })
        //         }).catch(err => {
        //             console.log(4)
        //             console.log(err)
        //             return rej(err)
        //         })
        //     }
        // });
    }

    static async allocateAsset(assetTag, username) {
        if (!await Asset._doesAssetTagExist(assetTag)) {
            throw new MyError("Asset Does Not Exist");
        }

        await User.checkIfUserExists(username, "User Does Not Exist");
        utility.addErrorHandlingToAsyncFunction(Asset._updateAssetCustodian, "Could Not Assign Asset To User",
            assetTag, username);
    }
}

export default Asset;