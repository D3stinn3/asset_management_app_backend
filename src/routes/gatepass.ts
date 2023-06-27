import express from 'express';
import utility from '../utility/utility.js';
import { Errors, Succes } from '../utility/constants.js';
const router = express.Router();
import pool from '../../db2.js';
import { requestForGatepass } from '../GatePass/assignGatepass.js';
import Asset from '../Allocation/Asset/asset2.js';
import MyError from '../utility/myError.js';
import locationTable from '../Tracking/db_location.js';
import { AntennaeUpdateJSON, updateAntennae } from '../Tracking/antennae.js';
import { updateReader, updateReaderJSON } from '../Tracking/readers.js';
import { getApprovers } from '../GatePass/getApprovers.js';
import { getPastRequests } from '../GatePass/pastgatepasses.js';
import { getRequestedGatePasses } from '../GatePass/requestedgatepasses.js';
import { handleRequest } from '../GatePass/handleGatepass.js';
import { createInventory } from '../GatePass/createInventory.js';
import { createBatch } from '../GatePass/createBatch.js';
import { allocateBatch } from '../GatePass/allocateBatch.js';
import gatepasstable from '../GatePass/db_gatepass.js';

router.get('/movements', (req, res) => {
    let {
        from,
        to
    } = req.query;

    // Check if they are valid dates
    try {
        from = utility.checkIfValidDate(from, "Invalid From Date");
        to = utility.checkIfValidDate(to, "Invalid To Date");
    } catch(err) {
        console.log(err);
        return res.status(400).json({message: Errors[37]});
    }

    // Get all movements between the dates
    pool.query(gatepass.getTags, [from, to]).then(data => {
        if (data.rowCount <= 0) {
            return res.status(400).json({message: Errors[38]})
        }
        return res.json(data.rows);
    }).catch(err => {
        console.log(err);
        return res.status(400).json({message: Errors[9]})
    })
});

router.get('/approvers', (req, res) => {
    // Get location ID from query
    let locationID = Number.parseInt(req.query.locationID);

    // Get all approvers for a location
    getApprovers(locationID).then(data => {
        return res.json(data);
    }).catch(err => {
        console.log(err);
        return res.status(400).json({message: Errors[9]})
    });
});

router.get('/getReaders', (req, res) => {
    // Call DB to get all readers
    pool.query(locationTable.viewReaders).then(data => {
        return res.json(data.rows);
    }).catch(err => {
        return res.status(400).json({message: Errors[9]});
    });
});

router.get('/readerIDs', (req, res) => {
    // Call DB and return response
    pool.query(locationTable.readerIDs).then(data => {
        return res.json(data.rows);
    }).catch(err => {
        return res.status(400).json({message: Errors[9]});
    });
});

router.get('/getAntennae', (req, res) => {
    // Call DB to get all antennae
    pool.query(locationTable.getAntennaes).then(data => {
        return res.json(data.rows);
    }).catch(err => {
        return res.status(400).json({message: Errors[9]});
    });
});

router.put('/updateAntennae', (req, res) => {
    let id: number = Number.parseInt(req.body.id);
    let readerID: string = req.body.readerID;
    let antennaeno: string = req.body.antennaeno;
    let entry: boolean = req.body.entry;

    let updateJSONToUse: AntennaeUpdateJSON = {};

    // Convert details to right type
    if(readerID) {
        updateJSONToUse.readerID = parseInt(readerID);
    }
    if(antennaeno) {
        updateJSONToUse.antennaeno = parseInt(antennaeno);
    }
    if(entry) {
        updateJSONToUse.entry = entry;
    }

    // Update Antennae
    updateAntennae(id, updateJSONToUse).then(_ => {
        return res.json({message: Succes[15]});
    }).catch(err => {
        console.log(err);
        if (err instanceof MyError) {
            return res.status(400).json({message: err.message});
        } else {
            return res.status(400).json({message: Errors[9]});
        }
    });
});

router.put('/updateReader', (req, res) => {
    let id: number = Number.parseInt(req.body.id);
    let hardwarekey: string = req.body.hardwarekey;
    let locationid: string = req.body.locationid;
    let noantennae: string = req.body.noantennae;

    // Verify details
    let updateJSONToUse: updateReaderJSON = {};
    if(hardwarekey) {
        updateJSONToUse.hardwarekey = hardwarekey;
    }
    if(locationid) {
        updateJSONToUse.locationid = parseInt(locationid);
    }
    if(noantennae) {
        updateJSONToUse.noantennae = parseInt(noantennae);
    }

    // Update Reader
    console.log(id);
    updateReader(id, updateJSONToUse).then(_ => {
        return res.json({message: Succes[16]});
    }).catch(err => {
        console.log(err);
        if (err instanceof MyError) {
            return res.status(400).json({message: err.message});
        } else {
            return res.status(400).json({message: Errors[9]});
        }
    });
});

router.get('/getPastGatePasses', (req, res) => {
    // Send past requests
    getPastRequests(req.username).then(data => {
        return res.json(data);
    }).catch(err => {
        if (err instanceof MyError) {
            return res.status(400).json({message: err.message});
        } else {
            return res.status(400).json({message: Errors[9]});
        }
    });
});

router.get('/requestedGatePasses', (req, res) => {
    // Send requested requests
    getRequestedGatePasses(req.username).then(data => {
        return res.json(data);
    }).catch(err => {
        if (err instanceof MyError) {
            return res.status(400).json({message: err.message});
        } else {
            return res.status(400).json({message: Errors[9]});
        }
    });
});

router.post('/handle', (req, res) => {
    // Get details from request
    let id: number = Number.parseInt(req.body.id);
    let approved: boolean = req.body.approved;
    let comment: string = req.body.comment;

    // Handle GatePass
    handleRequest(approved, comment, id).then(_ => {
        return res.json({message: Succes[18]});
    }).catch(err => {
        if (err instanceof MyError) {
            return res.status(400).json({message: err.message});
        } else {
            return res.status(400).json({message: Errors[9]});
        }
    });
});

router.post('/createBatch', (req, res) => {
    // Get details from request
    let date = req.body.date;
    let comments = req.body.comments;
    let locationID = Number.parseInt(req.body.locationID);
    let assets = req.body.assets;

    // Get date from date
    let dateToAdd: Date;
    try {
        dateToAdd = utility.checkIfValidDate(date, "Invalid Date");

        // Create Batch
        createBatch(dateToAdd, comments, locationID, assets).then(_ => {
            return res.json({message: Succes[20]})
        }).catch(err => {
            if (err instanceof MyError) {
                return res.status(501).json({message: err.message})
            } else {
                return res.status(501).json({message: Errors[9]});
            }
        })
    } catch(err) {
        return res.status(501).json({message: Errors[9]});
    }
});

router.post('/allocateBatch', (req, res) => {
    // Get details
    let inventoryID = Number.parseInt(req.body.inventoryID);
    let batchID = Number.parseInt(req.body.batchID);

    // Allocate Batch
    allocateBatch(inventoryID, batchID).then(_ => {
        return res.json({message: Succes[21]});
    }).catch(err => {
        if (err instanceof MyError) {
            return res.status(501).json({message: err.message})
        } else {
            return res.status(501).json({message: Errors[9]});
        }
    });
});

router.get('/getInventories', (req, res) => {
    // Return db results
    pool.query("SELECT * FROM Inventory").then(data => {
        return res.json(data.rows);
    }).catch(err => {
        return res.status(501).json({message: Errors[9]});
    });
});

router.get('/assetsInBatch/:id', (req, res) => {
    // Get batch id
    let id = Number.parseInt(req.params.id);

    // Return db results
    pool.query(gatepasstable.getAssetsInBatch, [id]).then(data => {
        return res.json(data.rows);
    }).catch(err => {
        return res.status(501).json({message: Errors[9]});
    });
});

router.post('/addToBatch', (req, res) => {
    // Get barcode and batch id
    let barcode = req.body.barcode;
    let batchID = Number.parseInt(req.body.batchID);

    // Get asset id
    Asset._getAssetID(barcode).then(id => {
        // Insert into db
        pool.query(gatepasstable.insertBatchAsset, [id, batchID]).then(_ => {
            return res.json({message: Succes[22]});
        }).catch(err => {
            return res.status(400).json({message: Errors[70]});
        });
    }).catch(err => {
        if (err instanceof MyError) {
            return res.status(501).json({message: err.message})
        } else {
            return res.status(501).json({message: Errors[9]});
        }
    });
});

router.get('/batchesInInventory/:id', (req, res) => {
    let id = Number.parseInt(req.params.id);
    // Return db results
    pool.query(gatepasstable.getBatchesInInventory, [id]).then(data => {
        return res.json(data.rows);
    }).catch(err => {
        return res.status(501).json({message: Errors[9]});
    });
});

router.get('/unallocatedBatch', (req, res) => {
    // Get all unallocated batches
    pool.query(gatepasstable.getUnallocatedAssets).then(data => {
        return res.json(data.rows);
    }).catch(err => {
        return res.status(501).json({message: Errors[9]});
    });
});

router.post('/createInventory', (req, res) => {
    // Get details from request
    const name = req.body.name;

    // Create inventory
    createInventory(name).then(_ => {
        return res.json({message: Succes[19]})
    })
});

// Route for creating a gatepass
router.post('/create', (req, res) => {
    let name = req.body.name;
    let fromLocation = req.body.fromLocation;
    let toLocation = req.body.toLocation;
    let date = req.body.date;
    let reason = req.body.reason;
    let barcode = req.body.barcode;
    let approvers = req.body.approvers;

    try {
        date = utility.checkIfValidDate(date, "Invalid Date");
    } catch(err) {
        console.log(err);
        return res.status(400).json({message: err.message});
    }

    let gatePass = {username: name, date: date, fromLocation: fromLocation, toLocation: toLocation, barcode: barcode, reason: reason};
    // Create Gatepass
    requestForGatepass(gatePass, approvers).then(_ => {
        return res.json({message: Succes[13]});
    }).catch(err => {
        console.log(err);
        if (err instanceof MyError) {
            return res.status(400).json({message: err.message});
        } else {
            return res.status(400).json({message: Errors[9]});
        }
    });
});

export default router;