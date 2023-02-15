// Importing pool
const pool = require('../db2');

const assert = require('chai').assert;

const Category = require('../src/Allocation/category2');
const utility = require('../utility/utility');

describe.skip("getCategoryID Tests", function(){
    let categoryName;
    let categoryID;
    let errorMessage;

    beforeEach(async function(){
        categoryName = "Existing";
        categoryID = 3;
        errorMessage = "Category Does Not Exist";

        try{
            await pool.query("CREATE TEMPORARY TABLE Category (LIKE Category INCLUDING ALL)");
            await pool.query("INSERT INTO Category (ID, name, parentFolderID, depreciationType) VALUES ($1, $2, 1, 'Double Declining Balance')", [categoryID, categoryName]);
        }catch(err){
            console.log(err);
            assert(false, "Could Not create temporary databases");
        }
    });

    it("should throw an error when category name does not exist", async function(){
        // Test Inputs
        categoryName = "Does Not Exist";

        await utility.assertThatAsynchronousFunctionFails(Category.getCategoryID, errorMessage, categoryName, errorMessage);
    });

    it("should return a category ID when a valid category ID is given", async function(){
        await utility.assertThatAsyncFunctionReturnsRightThing(Category.getCategoryID, categoryID, categoryName);
    });

    afterEach(async function(){
        try{
            await pool.query("DROP TABLE IF EXISTS pg_temp.Category");
        }catch(err){
            console.log(err);
            assert(false, "Could Not Delete Temporary Table");
        }
    })
});

describe.skip("saveCategoryInDB tests", function(){
    let categoryName;
    let depreciaitionType;
    let categoryID;
    let parentFolderID;
    let depreciationPercentage;

    this.beforeEach(async function(){
        categoryName = "Totally Real Category";
        parentFolderID = 1;

        try{
            await pool.query("CREATE TEMPORARY TABLE Category (LIKE Category INCLUDING ALL)");
            await pool.query("CREATE TEMPORARY TABLE DepreciationPercent (LIKE DepreciationPercent INCLUDING ALL)");
        }catch(err){
            console.log(err);
            assert(false, "Could Not Create Temporary Tables");
        }
    });

    async function assertThatFunctionInsertsInDB(){
        try{
            await Category._saveCategoryInDb(categoryName, parentFolderID, depreciaitionType, depreciationPercentage);
        }catch(err){
            console.log(err);
            assert(false, "_saveCategoryInDB did not run");
        }

        try{
            fetchResult = await pool.query("SELECT id FROM Category WHERE name = $1 AND parentFolderID = $2 AND depreciationType = $3", [categoryName, parentFolderID, depreciaitionType]);
        }catch(err){
            console.log(err);
            assert(false, "Could Not Get Data To Verify If _saveCategoryInDB inserted values in the DB");
        }

        utility.verifyDatabaseFetchResults(fetchResult, "Nothing Was Returned From Database");
    }

    it("should only add information to Category table when depreciation method is straight line or double declining balance", async function(){
        // Test Inputs
        depreciaitionType = "Straight Line";

        await assertThatFunctionInsertsInDB();

        categoryID = fetchResult.rows[0].id;

        try{
            fetchResult = await pool.query("SELECT percentage FROM DepreciationPercent WHERE categoryID = $1", [categoryID]);
        }catch(err){
            console.log(err);
            assert(false, "Database Function Did Not Run");
        }

        if (fetchResult.rowCount > 0){
            assert(false, "No Entry Should Be Added in Table");
        }

        assert(true);
    });

    it("should add an entry to DepreciationPercent when depreciation type is written down value", async function(){
        // Test Inputs
        depreciaitionType = "Written Down Value";
        depreciationPercentage = 25;
        let itemToCompareDepreciationPercentageWith;

        await assertThatFunctionInsertsInDB();

        categoryID = fetchResult.rows[0].id;

        try{
            fetchResult = await pool.query("SELECT percentage FROM DepreciationPercent WHERE categoryID = $1", [categoryID]);
        }catch(err){
            console.log(err);
            assert(false, "Could Not Get category ID from DepreciationPercent table");
        }

        utility.verifyDatabaseFetchResults(fetchResult, "No percentage Was Returned");

        itemToCompareDepreciationPercentageWith = fetchResult.rows[0].percentage;

        assert.equal(depreciationPercentage, itemToCompareDepreciationPercentageWith, "Wrong percentage returned");

    });

    this.afterEach(async function(){
        try{
            await pool.query("DROP TABLE IF EXISTS pg_temp.Category");
            await pool.query("DROP TABLE IF EXISTS pg_temp.DepreciationPercent");
        }catch(err){
            console.log(err);
            assert(false, "Could Not Drop Temporary Tables");
        }
    });
});

describe("Update Category Database Functions Test", function(){
    let categoryID = 3;
    let fetchResult;
    let result;
    let oldName = 'Old Name';
    let oldParentFolderID = 1;
    let oldDepreciationType = 'Straight Line';

    this.beforeEach(async function(){
        try{
            await pool.query("CREATE TEMPORARY TABLE Category (LIKE Category INCLUDING ALL)");
            await pool.query("CREATE TEMPORARY TABLE Folder (LIKE Folder INCLUDING ALL)");
            await pool.query("CREATE TEMPORARY TABLE DepreciationPercent (LIKE DepreciationPercent INCLUDING ALL)");
            await pool.query("INSERT INTO Category VALUES (3, $1, $2, $3)", [oldName, oldParentFolderID, oldDepreciationType]);
        }catch(err){
            console.log(err);
            assert(false, "Could Not Create Temporary Tables");
        }
    });

    async function testDatabaseFunction(newValue, oldValue, attributeToUpdate, func, ...params){
        try{
            await func(...params);
        }catch(err){
            console.log(err);
            assert(false, `${func.name} function could not be run`);
        }
        try{
            fetchResult = await pool.query(`SELECT ${attributeToUpdate} FROM Category WHERE ID = $1`, [categoryID]);
        }catch(err){
            console.log(err);
            assert(false, `Could Not Fetch ${attributeToUpdate} From Database`);
        }

        utility.verifyDatabaseFetchResults(fetchResult, "Nothing Returned From Database");
        result = fetchResult.rows[0][attributeToUpdate];

        assert.notEqual(result, oldValue, `${attributeToUpdate} Did Not Change`);
        assert.equal(newValue, result, `${attributeToUpdate} Changed To Something Else, ${result}`);
    }

    it("_updateNameInDB test", async function(){
        let newName = "New Name";

        await testDatabaseFunction(newName, oldName, 'name', Category._updateNameinDb, categoryID, newName);
    });

    it("_updateFolderInDB test", async function(){
        let newParentFolderID = 3;

        // Insert The New Folder In DB
        try{
            await pool.query("INSERT INTO Folder VALUES ($1, 'New Test Folder', 'TestCompany')", [newParentFolderID])
        }catch(err){
            console.log(err);
            assert(false, "Could Not Insert New Folder In DB");
        }

        await testDatabaseFunction(newParentFolderID, oldParentFolderID, 'parentfolderid', Category._updateFolderinDB, categoryID, newParentFolderID);
    });

    it("_updateDepreciationTypeInDB test", async function(){
        let newDepreciationType = 'Double Declining Balance';

        await testDatabaseFunction(newDepreciationType, oldDepreciationType, 'depreciationtype', Category._updateDepreciationTypeInDB, categoryID, newDepreciationType);
    });

    it("_insertDepreciationPercentageInDB", async function(){
        let depreciationPercentage = 40;

        try{
            await Category._insertDepreciationPercentInDb(categoryID, depreciationPercentage);
        }catch(err){
            console.log(err);
            assert(false, "Function Did Not Run");
        }

        try{
            fetchResult = await pool.query("SELECT percentage FROM DepreciationPercent WHERE categoryID = $1", [categoryID]);
        }catch(err){
            console.log(err);
            assert(false, "Could Not Fetch Percent From DB");
        }

        utility.verifyDatabaseFetchResults(fetchResult, "Nothing Was Returned From Database");
        result = fetchResult.rows[0].percentage;

        assert.equal(depreciationPercentage, result, "Wrong Value Inserted");
    })

    this.afterEach(async function(){
        try{
            await pool.query("DROP TABLE IF EXISTS pg_temp.Category");
            await pool.query("DROP TABLE IF EXISTS pg_temp.Folder");
            await pool.query("DROP TABLE IF EXISTS pg_temp.DepreciationPercent");
        }catch(err){
            console.log(err);
            assert(false, "Could Not Drop Temporary Tables");
        }
    })
});