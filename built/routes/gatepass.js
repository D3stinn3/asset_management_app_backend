import express from 'express';
import utility from '../utility/utility.js';
import { Errors, Succes } from '../utility/constants.js';
const router = express.Router();
import pool from '../../db2.js';
import { assignGatePass } from '../GatePass/assignGatepass.js';
import Asset from '../Allocation/Asset/asset2.js';
import MyError from '../utility/myError.js';
import locationTable from '../Tracking/db_location.js';
import { updateAntennae } from '../Tracking/antennae.js';
router.get('/movements', (req, res) => {
    let { from, to } = req.query;
    // Check if they are valid dates
    try {
        from = utility.checkIfValidDate(from, "Invalid From Date");
        to = utility.checkIfValidDate(to, "Invalid To Date");
    }
    catch (err) {
        console.log(err);
        return res.status(400).json({ message: Errors[37] });
    }
    // Get all movements between the dates
    pool.query(gatepass.getTags, [from, to]).then(data => {
        if (data.rowCount <= 0) {
            return res.status(400).json({ message: Errors[38] });
        }
        return res.json(data.rows);
    }).catch(err => {
        console.log(err);
        return res.status(400).json({ message: Errors[9] });
    });
});
router.get('/getReaders', (req, res) => {
    // Call DB to get all readers
    pool.query(locationTable.viewReaders).then(data => {
        return res.json(data.rows);
    }).catch(err => {
        return res.status(400).json({ message: Errors[9] });
    });
});
router.get('/readerIDs', (req, res) => {
    // Call DB and return response
    pool.query(locationTable.readerIDs).then(data => {
        return res.json(data.rows);
    }).catch(err => {
        return res.status(400).json({ message: Errors[9] });
    });
});
router.get('/getAntennae', (req, res) => {
    // Call DB to get all antennae
    pool.query(locationTable.getAntennaes).then(data => {
        return res.json(data.rows);
    }).catch(err => {
        return res.status(400).json({ message: Errors[9] });
    });
});
router.put('/updateAntennae', (req, res) => {
    let id = req.body.id;
    let readerID = req.body.readerID;
    let antennaeno = req.body.antennaeno;
    let entry = req.body.entry;
    let updateJSONToUse = {};
    // Convert details to right type
    if (readerID) {
        updateJSONToUse.readerID = parseInt(readerID);
    }
    if (antennaeno) {
        updateJSONToUse.antennaeno = parseInt(antennaeno);
    }
    if (entry) {
        updateJSONToUse.entry = entry;
    }
    // Update Antennae
    updateAntennae(id, updateJSONToUse).then(_ => {
        return res.json({ message: Succes[15] });
    }).catch(err => {
        console.log(err);
        if (err instanceof MyError) {
            return res.status(400).json({ message: err.message });
        }
        else {
            return res.status(400).json({ message: Errors[9] });
        }
    });
});
// Route for creating a gatepass
router.post('/create', (req, res) => {
    let barcodes = req.body.barcodes;
    let username = req.body.username;
    let reason = req.body.reason;
    let leavingTime = req.body.leavingTime;
    let returnTime = req.body.returnTime;
    let entry = req.body.entry;
    let assetIDsToAdd;
    let leavingTimeToAdd;
    let returnTimeToAdd;
    try {
        leavingTimeToAdd = utility.checkIfValidDate(leavingTime, "Invalid Leaving Time");
        returnTimeToAdd = utility.checkIfValidDate(returnTime, "Invalid Return Time");
    }
    catch (err) {
        console.log(err);
        if (err instanceof MyError) {
            return res.status(400).json({ message: err.message });
        }
        else {
            return res.status(400).json({ message: Errors[9] });
        }
    }
    // Convert barcodes to assetIDs
    let promises = [];
    barcodes.forEach(barcode => {
        promises.push(Asset._getAssetID(barcode));
    });
    Promise.all(promises).then(data => {
        assetIDsToAdd = data;
        // Add GatePass
        assignGatePass(assetIDsToAdd, username, reason, leavingTimeToAdd, returnTimeToAdd, entry).then(_ => {
            return res.json({ message: Succes[13] });
        }).catch(err => {
            console.log(err);
            if (err instanceof MyError) {
                return res.status(400).json({ message: err.message });
            }
            else {
                return res.status(400).json({ message: Errors[9] });
            }
        });
    }).catch(err => {
        if (err instanceof MyError) {
            return res.status(400).json({ message: err.message });
        }
        else {
            return res.status(400).json({ message: Errors[9] });
        }
    });
});
export default router;
//# sourceMappingURL=gatepass.js.map