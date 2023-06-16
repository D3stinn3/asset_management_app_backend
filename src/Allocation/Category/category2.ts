// Importing the database bool from db2.js. This will allow me to connect to the database
import pool from '../../../db2.js';

// Importing SQL commands involving categories
import categoryTable from './db_category2.js';

// Importing custom MyError class
import MyError from '../../utility/myError.js';
import utility from '../../utility/utility.js';
import { Errors } from '../../utility/constants.js';
import { DepreciationTypes } from '../Asset/asset2.js';
import { Depreciation } from './updateCategory.js';


class Category {
    categoryName: string;
    parentCategoryID: number;
    depreciaitionType: string;
    depreciationPercentage?: number;

    // Constructor
    constructor(categoryName: string, parentCategoryID: number, depreciationType: string, depreciationPercentage: number) {
        if (utility.isAnyEmpty([categoryName, parentCategoryID, depreciationType])) {
            throw new MyError("Missing Information");
        }

        if (typeof categoryName === "string") {
            this.categoryName = categoryName;
        } else {
            throw new MyError("Invalid Category Name");
        }

        if (!Number.isInteger(parentCategoryID)) {
            throw new MyError("Invalid parent category");
        } else {
            this.parentCategoryID = parentCategoryID;
        }

        Category.verifyDepreciationDetails({type: depreciationType, value: depreciationPercentage});
        this.depreciaitionType = depreciationType;
        this.depreciationPercentage = depreciationPercentage;
    }

    // Function that saves category in the database
    static async _saveCategoryInDb(categoryName: string, parentCategoryID: number, depreciationType: string, depreciationPercentage: number) {
        // Create category
        pool.query(categoryTable.add, [categoryName, depreciationType, parentCategoryID]).then(_ => {
            if (depreciationPercentage) {
                // Add depreciaition percentage to database

                // Get ID of created category
                Category._getCategoryID(categoryName).then(ID => {

                    // Add depreciation percentage to database
                    pool.query(categoryTable.addWritten, [ID, depreciationPercentage]).then(_ => {

                    }).catch(err => {
                        throw new MyError("Could Not Add Entry to DepreciationPercentage table");
                    });
                }).catch(err => {
                    console.log(err);
                    throw new MyError(Errors[12]);
                });
            }
            
        }).catch(err => {
            console.log(err);
            throw new MyError(Errors[9]);
        });
    }

    async initialize() {
        if (await Category._doesCategoryExist(this.categoryName)) {
            throw new MyError("Category Already Exists");
        }

        if (!await Category._doesCategoryIDExist(this.parentCategoryID)) {
            throw new MyError("Parent Category Does Not Exist");
        }

        utility.addErrorHandlingToAsyncFunction(Category._saveCategoryInDb, "Could not add category to system"
            , this.categoryName, this.parentCategoryID, this.depreciaitionType,
            this.depreciationPercentage);
    }

    // Static fields
    static depTypes = ['Straight Line', 'Double Declining Balance', 'Written Down Value'];

    // Function that gets Category ID from name
    static async _getCategoryID(categoryName: string): Promise<number | never> {
        let fetchResult;
        let categoryID;

        try {
            fetchResult = await pool.query(categoryTable.getID, [categoryName]);
        } catch (err) {
            throw new MyError(Errors[5]);
        }

        utility.verifyDatabaseFetchResults(fetchResult, Errors[5]);

        categoryID = fetchResult.rows[0].id;
        return categoryID;
    }

    static async _doesCategoryExist(categoryName: string): Promise<boolean> {
        try {
            const exist = await Category._getCategoryID(categoryName);
            return true;
        } catch (err) {
            return false;
        }
    }

    // Update Category
    static verifyCategoryName(newName: string): Promise<void | never> {
        return new Promise((res, rej) => {
            // Verify the new name
            if (typeof newName !== "string") {
                // If not a string throw an error
                return rej(new MyError(Errors[53]));
            } else if (newName.length > 50) {
                // Throw an error for a name that's too long
                return rej(new MyError(Errors[53]));
            }

            // Check if the name exists
            Category._doesCategoryExist(newName).then(exist => {
                if (exist === true) {
                    return rej(new MyError(Errors[54]));
                }
                return res();
            }).catch(err => {
                return rej(new MyError(Errors[9]));
            });
        });
    }
    static verifyDepreciationDetails(props: Depreciation): void | never {
        // Verifies that depreciation details are valid
        // Make sure that depType is valid
        if (Object.values(DepreciationTypes).includes(props.type) === false) {
            throw new MyError(Errors[50]);
        }

        // Make sure deptype depvalue pair is valid
        if (props.type === DepreciationTypes.WrittenDownValue) {
            if (props.value) {
                if (props.value <= 0) {
                    throw new MyError(Errors[50]);
                }
            }
        } else {
            if (props.value) {
                throw new MyError(Errors[50]);
            }
        }
    }   

    static async _insertDepreciationPercentInDb(category_id, percent) {
        try {
            await pool.query(categoryTable.insertDepreciationPercent, [category_id, percent]);
        } catch (err) {
            throw new MyError("Could not insert depreciation percentage");
        }
    }

    static async _deleteDepreciationPercentInDb(category_id) {
        try {
            await pool.query(categoryTable.deleteDepreciationPercent, [category_id]);
        } catch (err) {
            throw new MyError("Could not delete depreciation percentage entry");
        }
    }

    // Delete Category
    // Deleting a category would involve deleting the depreiciation details of all the assets under the category which
    // To me doesn't make alot of sense. So I've decided to not add this functionality for now

    static async _doesCategoryIDExist(categoryID: number): Promise<boolean | never> {
        return new Promise((res, rej) => {
            pool.query(categoryTable.doesCategoryIDExist, [categoryID]).then(fetchResult => {
                if (fetchResult.rowCount === 0) {
                    return res(false);
                } else {
                    return res (true);
                }
            }).catch(err => {
                console.log(err);
                return rej(new MyError(Errors[9]))
            });
        })
    }

    static async _getCategoryDepreciationType(categoryID) {
        let fetchResult;

        // Check if Category Exists
        if (!await Category._doesCategoryIDExist(categoryID)) {
            throw new MyError("Category Does Not Exist");
        }

        try {
            fetchResult = await pool.query(categoryTable.getCategoryDepreciationType, [categoryID]);
        } catch (err) {
            throw new MyError("Could Not Get Category Depreciation Type");
        }

        utility.verifyDatabaseFetchResults(fetchResult, "Error Querying Database");

        let depreciaitionType = fetchResult.rows[0].depreciationtype;
        return depreciaitionType;
    }

    static async _getCategoryDepreciationPercent(categoryID) {
        let fetchResult;
        let depreciationPercentage;

        if (!await Category._doesCategoryIDExist(categoryID)) {
            throw new MyError("Category Does Not Exist");
        }

        if (await Category._getCategoryDepreciationType(categoryID) === "Written Down Value") {
            try {
                fetchResult = await pool.query(categoryTable.getDepreciationPercent, [categoryID]);
            } catch (err) {
                throw new MyError("Could Not Get Depreciation Percentage")
            }

            depreciationPercentage = fetchResult.rows[0].percentage;
        } else {
            depreciationPercentage = null;
        }

        return depreciationPercentage;
    }

    static async _getDepreciationDetails(categoryName) {
        return new Promise((res, rej) => {
            Category._getCategoryID(categoryName).then(categoryID => {
                Category._getCategoryDepreciationType(categoryID).then(depType => {
                    Category._getCategoryDepreciationPercent(categoryID).then(perc => {
                        res({ "depType": depType, "perc": perc });
                    })
                })
            }).catch(err => {
                console.log(err);
                rej(MyError(Errors[9]));
            })
        })
    }

    // View Category Details
    static async viewDetails(categoryName) {
        let categoryExist = await Category._doesCategoryExist(categoryName);
        if (!categoryExist) {
            throw new MyError("Category Does Not Exist");
        }

        let categoryID = await Category._getCategoryID(categoryName);
        let depreciationType = await Category._getCategoryDepreciationType(categoryID);
        let depreciationValue = await Category._getCategoryDepreciationPercent(categoryID, depreciationType);

        return {
            categoryName: categoryName,
            depreciationType: depreciationType,
            depreciationValue: depreciationValue
        }
    }
}

export default Category;