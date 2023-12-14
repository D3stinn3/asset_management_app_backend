import reportTable from './db_reports.js';
import { MyErrors2 } from '../utility/constants.js';
import MyError from '../utility/myError.js';
import pool from '../../db2.js';
import Location from '../Tracking/location.js';
import Category from '../Allocation/Category/category2.js';

interface TaggedAsset {
    id: number;
    barcode: string;
    status?: string;
    description?: string;
    make_and_model_no?: string;
    category_name?: string;
    sub_category_name?: string;
    open_market_value?: number;
    insurance_value?: number;
    serial_number?: string;
    location: string;
    building?: string;
    office?: string
}
// A function that will get information of assets that are tagged
export function getTaggedAssets(is_tagged: boolean): Promise<TaggedAsset[]> {
    return new Promise((res, rej) => {
        // Function to get details from database
        getDetailsFromDatabase(is_tagged).then((rawAssetData: RawTaggedAsset[]) => {
            // Function to get location, building and office of asset
            let promises: Promise<TaggedAsset>[] = [];

            rawAssetData.map((r) => {
                promises.push(rawAssetToTaggedAsset(r));
            })

            // Return
            Promise.all(promises).then(data => {
                return res(data);
            }).catch((err: MyError) => {
                return rej(err);
            })
        }).catch((err: MyError) => {
            return rej(new MyError(MyErrors2.NOT_GET_TAGGED_ASSETS));
        })
    });
}

interface RawTaggedAsset {
    id: number;
    barcode: string;
    make_and_model_no?: string;
    status?: string;
    description: string;
    category_id: number;
    open_market_value?: number;
    insurance_value?: number;
    serial_number: string;
    location_id: number
}

interface RawTaggedAssetWithLocation extends RawTaggedAsset{
    location: string;
    building?: string;
    office?: string
}

interface RawTaggedAssetFetchResult {
    rowCount: number;
    rows: RawTaggedAsset[]
}

// Returns details of assets from the database
function getDetailsFromDatabase(is_tagged: boolean): Promise<RawTaggedAsset[]> {
    return new Promise((res, rej) => {
        // Get details from database
        pool.query(reportTable.getRawAssetData, [is_tagged]).then((data: RawTaggedAssetFetchResult) => {
            return res(data.rows);
        }).catch((err: any) => {
            return rej(new MyError(MyErrors2.NOT_GET_ASSET_DATA))
        })
    });
}

function rawAssetToTaggedAsset(rawAsset: RawTaggedAsset): Promise<TaggedAsset> {
    return new Promise((res, rej) => {
        // Add location details to asset
        addOfficeBuildingLocationToAsset(rawAsset).then(rawAssetWithLocation => {
            // Add category details to asset
            addCategoryAndSubCategory(rawAssetWithLocation).then(taggedAsset => {
                return res(taggedAsset);
            })
        }).catch((err: any) => {
            return rej(new MyError(MyErrors2.NOT_GET_TAGGED_ASSETS));
        })
    })
}

function addCategoryAndSubCategory(rawAsset: RawTaggedAssetWithLocation): Promise<TaggedAsset> {
    return new Promise((res, rej) => {
        // Check if category exists
        Category._doesCategoryIDExist(rawAsset.category_id).then(categoryExists => {
            if(categoryExists == false) {
                return rej(new MyError(MyErrors2.CATEGORY_NOT_EXIST));
            }

            // Get parent category of asset
            Category.getParentCategoryID(rawAsset.category_id).then(parentCategoryID => {
                if(parentCategoryID) {
                    // Get category name
                    Category.getCategoryName(parentCategoryID).then(categName => {
                        // Get name of sub category
                        Category.getCategoryName(rawAsset.category_id).then(subCategName => {
                            return res({
                                id: rawAsset.id,
                                barcode: rawAsset.barcode,
                                status: rawAsset.status,
                                description: rawAsset.description,
                                make_and_model_no: rawAsset.make_and_model_no,
                                category_name: categName ?? "",
                                sub_category_name: subCategName ?? "",
                                open_market_value: rawAsset.open_market_value,
                                insurance_value: rawAsset.insurance_value,
                                serial_number: rawAsset.serial_number,
                                location: rawAsset.location,
                                building: rawAsset.building,
                                office: rawAsset.office
                            })
                        })
                    })
                }

                // Get name of category
                Category.getCategoryName(rawAsset.category_id).then(categName => {
                    return res({
                        id: rawAsset.id,
                        barcode: rawAsset.barcode,
                        status: rawAsset.status,
                        description: rawAsset.description,
                        make_and_model_no: rawAsset.make_and_model_no,
                        category_name: categName ?? "",
                        sub_category_name: undefined,
                        open_market_value: rawAsset.open_market_value,
                        insurance_value: rawAsset.insurance_value,
                        serial_number: rawAsset.serial_number,
                        location: rawAsset.location,
                        building: rawAsset.building,
                        office: rawAsset.office
                    })
                })
            })
        }).catch((err: any) => {
            return rej(new MyError(MyErrors2.NOT_ADD_CATEGORY_TO_ASSET));
        })
    })
}

export function addOfficeBuildingLocationToAsset(rawAsset: RawTaggedAsset): Promise<RawTaggedAssetWithLocation> {
    return new Promise((res, rej) => {
        // Get id of building of location
        Location.findParentLocation(rawAsset.location_id).then((building_id: number | void) => {
            if (building_id) {
                // Get name of the building
                Location.getLocationName(building_id).then((building_name: string) => {
                    // Get id of site
                    Location.findParentLocation(building_id).then((site_id: number | void) => {
                        if (site_id) {
                            // Get name of the site
                            Location.getLocationName(site_id).then((site_name: string) => {
                                // Get name of location
                                Location.getLocationName(rawAsset.location_id).then((location_name: string) => {
                                    return res({
                                        id: rawAsset.id,
                                        barcode: rawAsset.barcode,
                                        make_and_model_no: rawAsset.make_and_model_no,
                                        status: rawAsset.status,
                                        description: rawAsset.description,
                                        category_id: rawAsset.category_id,
                                        open_market_value: rawAsset.open_market_value,
                                        insurance_value: rawAsset.insurance_value,
                                        serial_number: rawAsset.serial_number,
                                        location_id: rawAsset.location_id,
                                        location: site_name,
                                        building: building_name,
                                        office: location_name
                                    });
                                })
                            })
                        } else {
                            // Get name of site
                            Location.getLocationName(rawAsset.location_id).then((location_name: string) => {
                                return res({
                                    id: rawAsset.id,
                                    barcode: rawAsset.barcode,
                                    make_and_model_no: rawAsset.make_and_model_no,
                                    status: rawAsset.status,
                                    description: rawAsset.description,
                                    category_id: rawAsset.category_id,
                                    open_market_value: rawAsset.open_market_value,
                                    insurance_value: rawAsset.insurance_value,
                                    serial_number: rawAsset.serial_number,
                                    location_id: rawAsset.location_id,
                                    location: building_name,
                                    building: location_name,
                                    office: undefined
                                });
                            })
                        }
                    })
                })
            } else {
                // Get name of site
                Location.getLocationName(rawAsset.location_id).then((location_name: string) => {
                    return res({
                        id: rawAsset.id,
                        barcode: rawAsset.barcode,
                        make_and_model_no: rawAsset.make_and_model_no,
                        status: rawAsset.status,
                        description: rawAsset.description,
                        category_id: rawAsset.category_id,
                        open_market_value: rawAsset.open_market_value,
                        insurance_value: rawAsset.insurance_value,
                        serial_number: rawAsset.serial_number,
                        location_id: rawAsset.location_id,
                        location: location_name,
                        building: undefined,
                        office: undefined
                    });
                })
            }
        }).catch((err: MyError) => {
            return rej(new MyError(MyErrors2.NOT_ADD_BUILDING_LOCATION));
        })
    });
}