import * as XLSX from 'xlsx/xlsx.mjs';
import MyError from '../../utility/myError.js';
import { MyErrors2 } from '../../utility/constants.js';
import locationTable from '../../Tracking/db_location.js';
import pool from '../../../db2.js';
import categoryTable from '../Category/db_category2.js';
import assetTable from './db_assets.js';

export function bulkAddAssets(excelFileName: string): Promise<number[]> {
    return new Promise((res, rej) => {
        // Get the excel file
        getExcelFile(excelFileName).then(excelFileData => {
            // First get all categories and locations in the database and the max assetID
            getAllLocations().then(locations => {
                getAllCategories().then(categories => {
                    // Get max asset ID
                    pool.query(assetTable.getMaxAssetID).then(result => {
                        let maxAssetID = result.rows[0].max;

                        // Create a list of problematic rows
                        let problematicRows: number[] = [];

                        // For every row in the excel file
                        for (var i = 0; i < excelFileData.length; i++) {
                            // Check if the category and location exist in the database
                            if (categories.find(category => category.name === excelFileData[i].category) === undefined || locations.find(location => location.name === excelFileData[i].site) === undefined) {
                                // If category or location does not exist store the row number of the problematic row in a list
                                problematicRows.push(i + 1);
                            }
                            
                            // Create barcode from assetID and category

                            // Create asset in database

                            // Increment assetID by one
                            maxAssetID++;
                        }

                        

                        // Return the list of problematic rows
                        return res(problematicRows);
                    }).catch(err => {
                        if (err instanceof MyError) {
                            return rej(err);
                        } else {
                            console.log(err);
                            return rej(new MyError(MyErrors2.INTERNAL_SERVER_ERROR));
                        }
                    });
                }).catch(err => {
                    if (err instanceof MyError) {
                        return rej(err);
                    } else {
                        console.log(err);
                        return rej(new MyError(MyErrors2.INTERNAL_SERVER_ERROR));
                    }
                });
            }).catch(err => {
                if (err instanceof MyError) {
                    return rej(err);
                } else {
                    console.log(err);
                    return rej(new MyError(MyErrors2.INTERNAL_SERVER_ERROR));
                }
            });
        }).catch(err => {
            if (err instanceof MyError) {
                return rej(err);
            } else {
                console.log(err);
                return rej(new MyError(MyErrors2.NOT_PROCESS_EXCEL_FILE));
            }
        });
    });
}

interface GetAllLocationsDatabaseResult {
    rows: LocationFromDb[];
    rowCount: number;
}

interface GetAllCategoriesDatabaseResult {
    rows: CategoryFromDb[];
    rowCount: number;
}

interface LocationFromDb {
    id: number;
    name: string;
    companyname: string;
    parentlocationid: number | null;
}

interface CategoryFromDb {
    id: number;
    name: string;
    depreciationtype: string;
    parentcategoryid: number | null;
    code: string;
}

function getAllCategories(): Promise<CategoryFromDb[]> {
    return new Promise((res, rej) => {
        pool.query(categoryTable.getAllCategories3).then((result: GetAllCategoriesDatabaseResult) => {
            return res(result.rows);
        }).catch(err => {
            console.log(err);
            return rej(new MyError(MyErrors2.INTERNAL_SERVER_ERROR));
        });
    });
}

function getAllLocations(): Promise<LocationFromDb[]> {
    return new Promise((res, rej) => {
        // Get all locations from database
        pool.query(locationTable.getAllLocations).then((result: GetAllLocationsDatabaseResult) => {
            return res(result.rows);
        }).catch(err => {
            console.log(err);
            return rej(new MyError(MyErrors2.INTERNAL_SERVER_ERROR));
        });
    });
}
enum AssetExcelFileHeaders {
    CATEGORY= "Category",
    SITE = "Site",
    BUILDING = "Building",
    OFFICE = "Office",
    CODE = "Code",
    DESCRIPTION = "Description",
    USEFULLIFE = "Useful Life",
    SERIALNUMBER = "Serial Number",
    CONDITION = "Condition"
}

interface AssetFromExcelFile {
    site: string;
    building?: string;
    office?: string;
    code?: string;
    description?: string;
    category: string;
    usefullife?: number;
    serialnumber?: string;
    condition?: string;
}


/**
 * 
 * @param excelFile The name of the excel file
 * @returns An object containing asset data from the file
 * @description This function will read the excel file and return an object containing the data from the file. It assumes that the headers of the excel file are in the first row and have specific names
 */
function getExcelFile(excelFilename: string): Promise<AssetFromExcelFile[]> {
    return new Promise((res, rej) => {
        try {
            // Get excel file
            let excelFile = XLSX.readFile(excelFilename);

            // Get first worksheet
            let worksheet = excelFile.Sheets[excelFile.SheetNames[0]];

            // Convert to JSON
            let json = XLSX.utils.sheet_to_json(worksheet);

            // Get index of items
            let categoryIndex = json[0].indexOf(AssetExcelFileHeaders.CATEGORY);
            let siteIndex = json[0].indexOf(AssetExcelFileHeaders.SITE);
            let buildingIndex = json[0].indexOf(AssetExcelFileHeaders.BUILDING);
            let officeIndex = json[0].indexOf(AssetExcelFileHeaders.OFFICE);
            let codeIndex = json[0].indexOf(AssetExcelFileHeaders.CODE);
            let descriptionIndex = json[0].indexOf(AssetExcelFileHeaders.DESCRIPTION);
            let usefullifeIndex = json[0].indexOf(AssetExcelFileHeaders.USEFULLIFE);
            let serialnumberIndex = json[0].indexOf(AssetExcelFileHeaders.SERIALNUMBER);
            let conditionIndex = json[0].indexOf(AssetExcelFileHeaders.CONDITION);

            let convertedFile: AssetFromExcelFile[] = [];

            // Get data from items
            for (var i = 1; i < json.length; i++) {
                convertedFile.push({
                    site: json[i][siteIndex],
                    building: json[i][buildingIndex],
                    office: json[i][officeIndex],
                    code: json[i][codeIndex],
                    description: json[i][descriptionIndex],
                    category: json[i][categoryIndex],
                    usefullife: json[i][usefullifeIndex],
                    serialnumber: json[i][serialnumberIndex],
                    condition: json[i][conditionIndex]
                });
            }

            // Return data
            return res(convertedFile);
        } catch(err) {
            console.log(err);
            return rej(new MyError(MyErrors2.NOT_PROCESS_EXCEL_FILE));
        }   
    });
}