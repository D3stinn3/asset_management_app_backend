import express from 'express';
const router = express.Router();
import pool from '../db2.js';
import locationTable from '../src/Tracking/db_location.js';
import { Errors, Succes } from '../utility/constants.js';

// Route to send all locations and their ids
router.get('/getLocations', (req, res) => {
    console.log("I have entered the request");
    pool.query(locationTable.getLocations, []).then((data) => {
        if (data.rowCount <= 0){
            return res.status(404).json({
                message: Errors[13]
            });
        }
        return res.status(200).json(data.rows);
    }).catch((e) => {
        console.log(e);
        return res.status(501).json({
            message: Errors[9]
        })
    })
})

router.get('/view/:item', (req, res) => {
    const item = req.params.item;

    let query;
    let queryArguements;
    let errorMessage;

    if (item == 'location') {
        query = locationTable.getLocationSites;
        queryArguements = [];
        errorMessage = Errors[13]
    } else if(item == 'site') {
        query = locationTable.getSites;
        queryArguements = [];
        errorMessage = Errors[34];
    }else {
        return res.status(400).json({message: Errors[0]})
    }

    // Get All Locations And Their Sites
    pool.query(query, queryArguements).then(fetchResult => {
        if (fetchResult.rowCount <= 0) {
            return res.status(400).json({message: errorMessage})
        }

        return res.json(fetchResult.rows)
    })
})

// Route for creating locations or sites
router.post('/create/:item', (req, res) => {
    const item = req.params.item;

    let itemExistParams;
    let itemExistQuery;
    let ExistErrorMessage;
    let createItemQuery;
    let createItemParams;
    let successMessage;

    if(item == 'location') {
        let {
            name,
            site, 
            companyName
        } = req.body   
        itemExistParams = [name, site, companyName]
        itemExistQuery = locationTable.doesLocationExist
        ExistErrorMessage = Errors[32]
        createItemQuery = locationTable.createLocation
        createItemParams = [name, companyName, site, companyName]
        successMessage = Succes[5]
    } else if(item == 'site') {
        let {
            name,
            county,
            city,
            address,
            companyName
        } = req.body
        itemExistParams = [name, companyName]
        itemExistQuery = locationTable.doesSiteExist
        ExistErrorMessage = Errors[33]
        createItemQuery = locationTable.createSite
        createItemParams = [name, county, city, address, companyName]
        successMessage = Succes[6]
    }else {
        return res.status(400).json({message: Errors[0]})
    }

    // Confirm if item exists
    pool.query(itemExistQuery, itemExistParams).then(fetchResult => {
        // If item exists return error
        if (fetchResult.rowCount > 0) {
            return res.status(400).json({message: ExistErrorMessage})
        }

        // Create item
        pool.query(createItemQuery, createItemParams).then(_ => {
            return res.json({message: successMessage})
        }).catch(err => {
            console.log(err)
            return res.status(500).json({message: Errors[9]})
        })
    }).catch(err => {
        console.log(err)
        return res.status(500).json({message: Errors[9]})
    })
})

router.route('*', (req, res)=>{
    res.status(404).json({data:'Resource not found'})
})

export default router;
