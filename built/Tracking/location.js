var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Importing the database bool from db2.js. This will allow me to connect to the database
import pool from '../../db2.js';
// Importing custom classes
import MyError from '../utility/myError.js';
import locationTable from './db_location.js';
import { Errors, MyErrors2 } from '../utility/constants.js';
import reportsTable from '../Reports/db_reports.js';
import getResultsFromDatabase from '../utility/getResultsFromDatabase.js';
class Location {
    constructor() { }
    static verifyLocationID(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // Returns true if locationID exists in the database, false otherwise
            let fetchResult;
            try {
                fetchResult = yield pool.query(locationTable.getLocation, [id]);
            }
            catch (err) {
                throw new MyError(Errors[3]);
            }
            return (fetchResult.rowCount > 0);
        });
    }
    static doesLocationNameExist(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((res, rej) => {
                pool.query(locationTable.doesLocationExist, [name]).then((result) => {
                    return res(result.rowCount > 0);
                }).catch(err => {
                    return rej(new MyError(Errors[9]));
                });
            });
        });
    }
    // Find all child locations
    static findChildLocations(id, locationIDs) {
        return new Promise((res, rej) => {
            // Get the child locations of the location with id ID
            pool.query(reportsTable.getChildLocations, [id]).then(data => {
                if (data.rowCount > 0) {
                    // Add each location to locationIDs and call findChildLocations on each location
                    for (let i in data.rows) {
                        locationIDs.push(data.rows[i]['id']);
                        // Resolve so that recursive call can end
                        res(Location.findChildLocations(data.rows[i]['id'], locationIDs));
                    }
                }
                // Base Case, function should do nothing if location has no children 
                else {
                    res(locationIDs);
                }
            }).catch(err => {
                console.log(err);
                rej(Errors[9]);
            });
        });
    }
    // A function that finds the immediate parent of a location. If the location has no parent null is returned
    static findParentLocation(id) {
        return new Promise((res, rej) => {
            pool.query(locationTable.getParentLocations, [id]).then((data) => {
                if (data.rowCount <= 0) {
                    return res();
                }
                else {
                    return res(data.rows[0].parentlocationid);
                }
            }).catch((err) => {
                return rej(new MyError(MyErrors2.NOT_GET_PARENT_LOCATION));
            });
        });
    }
    // Finds the ID of the site of the location of the given id
    static findIDOfSiteOfLocation(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let parentLocationID = 1;
                let locationID = id;
                while (!parentLocationID) {
                    // Get parent location
                    parentLocationID = yield this.findParentLocation(locationID);
                    if (parentLocationID) {
                        locationID = parentLocationID;
                    }
                }
                return locationID;
            }
            catch (err) {
                throw new MyError(MyErrors2.NOT_GET_PARENT_LOCATION);
            }
        });
    }
    // A function to get the name of a location from an id
    static getLocationName(id) {
        return new Promise((res, rej) => {
            // Get name from database
            pool.query(locationTable.getLocationName, [id]).then((data) => {
                if (data.rowCount <= 0) {
                    return rej(new MyError(MyErrors2.NOT_GET_LOCATION_NAME));
                }
                else {
                    return res(data.rows[0].name);
                }
            }).catch((err) => {
                return rej(new MyError(MyErrors2.NOT_GET_LOCATION_NAME));
            });
        });
    }
    // Find the site, building and office of a location from its ID
    static getSiteBuildingOffice(locationid) {
        return new Promise((res, rej) => {
            // Throw error if location does not exist
            this.verifyLocationID(locationid).then(doesExist => {
                if (doesExist === false) {
                    return rej(new MyError(MyErrors2.LOCATION_NOT_EXIST));
                }
                // If the location is a site show only site
                this.findParentLocation(locationid).then(parent1 => {
                    // If location has no parent it is a site
                    if (!parent1) {
                        // Get name of site
                        this.getLocationName(locationid).then(siteName => {
                            return res({
                                site: siteName,
                                building: "all",
                                office: "all"
                            });
                        }).catch((err) => {
                            return rej(new MyError(MyErrors2.NOT_GET_SITE_BUILDING_OFFICE));
                        });
                    }
                    else {
                        // If location has a parent it means it could either be a building or office
                        this.findParentLocation(parent1).then(parent2 => {
                            // If parent2 is null it means it means parent2 is the site and locationid is building
                            if (!parent2) {
                                this.getLocationName(locationid).then(buildingName => {
                                    // Get name of site
                                    this.getLocationName(parent1).then(siteName => {
                                        // Return results
                                        return res({
                                            site: siteName,
                                            building: buildingName,
                                            office: "all"
                                        });
                                    }).catch((err) => {
                                        return rej(new MyError(MyErrors2.NOT_GET_SITE_BUILDING_OFFICE));
                                    });
                                }).catch((err) => {
                                    console.log(err);
                                    return rej(new MyError(MyErrors2.NOT_GET_SITE_BUILDING_OFFICE));
                                });
                            }
                            else {
                                // parent2 is the site, parent1 is the building and locationid is the office
                                this.getLocationName(parent2).then(siteName => {
                                    this.getLocationName(parent1).then(buildingName => {
                                        this.getLocationName(locationid).then(officeName => {
                                            return res({
                                                site: siteName,
                                                building: buildingName,
                                                office: officeName
                                            });
                                        }).catch((err) => {
                                            return rej(new MyError(MyErrors2.NOT_GET_SITE_BUILDING_OFFICE));
                                        });
                                    }).catch((err) => {
                                        return rej(new MyError(MyErrors2.NOT_GET_SITE_BUILDING_OFFICE));
                                    });
                                }).catch((err) => {
                                    return rej(new MyError(MyErrors2.NOT_GET_SITE_BUILDING_OFFICE));
                                });
                            }
                        }).catch((err) => {
                            return rej(new MyError(MyErrors2.NOT_GET_SITE_BUILDING_OFFICE));
                        });
                    }
                }).catch((err) => {
                    return rej(new MyError(MyErrors2.NOT_GET_SITE_BUILDING_OFFICE));
                });
            }).catch((err) => {
                return rej(new MyError(MyErrors2.NOT_GET_SITE_BUILDING_OFFICE));
            });
        });
    }
    // Find parent locations
    static findParentLocations(id, locationIDs) {
        return new Promise((res, rej) => {
            // Get the parent locations of the locations with id ID
            pool.query(locationTable.getParentLocations, [id]).then(data => {
                if (data.rowCount > 0) {
                    // Add each location to locationIDs and call findChildLocations on each location
                    for (let i in data.rows) {
                        locationIDs.push(data.rows[i]['parentlocationid']);
                        // Resolve so that recursive call can end
                        res(Location.findParentLocations(data.rows[i]['parentlocationid'], locationIDs));
                    }
                }
                // Base Case, function should do nothing if location has no children 
                else {
                    res(locationIDs);
                }
            }).catch(err => {
                console.log(err);
                rej(Errors[9]);
            });
        });
    }
    static getLocationID(name) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const results = yield getResultsFromDatabase("SELECT id FROM Location WHERE name = $1 AND deleted = false", [name]);
                return (_b = (_a = results[0]) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : null;
            }
            catch (err) {
                throw new MyError(MyErrors2.NOT_FIND_LOCATION);
            }
        });
    }
    static doesLocationExist(name, parentlocationid) {
        return new Promise((res, rej) => {
            if (parentlocationid === -1) {
                let query = "SELECT name FROM Location WHERE name = $1 AND parentlocationid IS NULL";
                pool.query(query, [name]).then((result) => {
                    if (result.rowCount <= 0) {
                        return res(false);
                    }
                    else {
                        return res(true);
                    }
                }).catch((err) => {
                    console.log(err);
                    return rej(new MyError(MyErrors2.NOT_FIND_LOCATION));
                });
            }
            else {
                let query = "SELECT name FROM Location WHERE name = $1 AND parentlocationid = $2";
                pool.query(query, [name, parentlocationid]).then((result) => {
                    if (result.rowCount <= 0) {
                        return res(false);
                    }
                    else {
                        return res(true);
                    }
                }).catch((err) => {
                    console.log(err);
                    return rej(new MyError(MyErrors2.NOT_FIND_LOCATION));
                });
            }
        });
    }
}
export default Location;
//# sourceMappingURL=location.js.map