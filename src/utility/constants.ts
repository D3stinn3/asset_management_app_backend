export const Errors = {
    '0': "Route Does Not Exist",
    '1': 'Could Not Create Asset',
    '2': 'Could Not Display Assets',
    '3': "Location Does Not Exist",
    '4': "Attachment Does Not Exist",
    '5': "Category Does Not Exist",
    '6': "Could Not Add Asset To Category",
    '7': "Asset Already Exists",
    '8': "Could Not Get Asset Details",
    '9': "Internal Server Error",
    '10': "Could Not Get Categories",
    '11': "Could Not Get Category",
    '12': 'Could Not Create Category',
    '13': "Could Not Get Locations",
    '14': "Could Not Get Users",
    '15': "Could Not Create Physical Valuation Report",
    '16': "Could Not Create File",
    '17': "Could Not Send File",
    '18': "User Has No Logs",
    '19': "There Are No Missing Assets",
    '20': "There Are No Allocation Records for asset",
    '21': "There Are No Asset Movements",
    '22': "Could Not Get Data",
    '23': "Could Not Delete File",
    '24': "User Already Exists",
    '25': "Email Already Exists",
    '26': "Invalid Credentials",
    '27': "Not Logged In",
    '28': "Not Authorized",
    '29': "Asset Does Not Exist",
    '30': "User Does Not Exist",
    '31': "Could Not Get Company",
    '32': "Location Already Exists",
    '33': "Site Already Exists",
    '34': "Could Not Get Sites",
    '35': "Barcode Already Exists",
    '36': "Could Not Verify Barcode",
    '37': "Invalid Date Given",
    '38': "Could Not Get Scanned Assets",
    '39': "Reader Already Exists",
    '40': "Antennae Already Exists",
    '41': "Asset With Search Field Does Not Exist",
    '42': "Invalid Search Term",
    '43': "Invalid Item To Update",
    '44': "No Asset Matches Search Term",
    '45': "There Are No Stock Takes For The Chosen Location",
    '46': "There Are No More Child Locations",
    '47': "Could Not Get Depreciation Details",
    '48': "Could Not Create Depreciation Schedule",
    '49': "Invalid Asset Condition",
    '50': "Invalid Depreciation Details",
    '51': "Invalid Attachments",
    '52': "Invalid Residual Value",
    '53': "Invalid Category Details",
    '54': "Category Already Exists", 
    '55': "Could Not Create Reader",
    '56': "Reader Does Not Exist",
    '57': "Invalid Antennae Number",
    '58': "Could Not Create Antennae",
    '59': "Invalid Leaving Date",
    '60': "Antennae Does Not Exist",
    '61': "Could Not Verify Details",
    '62': "Could Not Update Antennae",
    '63': "Could Not Update Reader",
    '64': "Invalid Details",
    '65': "Could Not Update User",
    '66': "Could Not Create Batch",
    '67': "Inventory Does Not Exist",
    '68': "Batch Does Not Exist",
    '69': "Could Not Allocate Batch",
    '70': "Could Not Add Asset To Batch",
    '71': "Could Not Update Inventory",
    '72': "Could Not Update Batch",
    '73': "Could Not Read Tag",
    '74': "Could Not Get Asset Movements",
    '75': "Could Not Get Inventories",
}

export enum Logs {
    "CREATE_ASSET"= 1,
    "DELETE_ASSET" = 2,
    "UPDATE_ASSET" = 3,
    "CREATE_CATEGORY" = 4,
    "DELETE_CATEGORY" = 5,
    "UPDATE_CATEGORY" = 6,
    "CREATE_LOCATION" = 7,
    "DELETE_LOCATION" = 8,
    "UPDATE_LOCATION" = 9,
    "CREATE_READER" = 10,
    "DELETE_READER" = 11,
    "UPDATE_READER" = 12,
    "CREATE_USER" = 13,
    "DELETE_USER" = 14,
    "UPDATE_USER" = 15,
    "ASSET_REGISTER_REPORT" = 16,
    "ASSET_DEPRECIATION_SCHEDULE_REPORT" = 17,
    "ASSET_ACQUISITION_REPORT" = 18,
    "STOCK_TAKE_RECONCILIATION_REPORT" = 19,
    "CATEGORY_DERECIATION_CONFIGURATION_REPORT" = 20,
    "ASSET_CATEGORY_REPORT" = 21,
    "AUDIT_TRAIL_REPORT" = 22,
    "CHAIN_OF_CUSTODY_REPORT" = 23,
    "MOVEMENT_REPORT" = 24,
    "REQUEST_GATEPASS" = 25,
    "APPROVE_GATEPASS" = 26,
    "REJECT_GATEPASS" = 27,
    "CREATE_INVENTORY" = 28,
    "DELETE_INVENTORY" = 29,
    "UPDATE_INVENTORY" = 30,
    "CREATE_BATCH" = 31,
    "DELETE_BATCH" = 32,
    "UPDATE_BATCH" = 33,
    "ASSIGN_BATCH_INVENTORY" = 34,
    "UNASSIGN_BATCH_INVENTORY" = 35,
    "UNKOWN" = 36,
    "ALLOCATE_ASSET" = 37,
    "ASSET_DISPOSAL_REPORT" = 38,
    "GATEPASS_REPORT" = 39,
    "STATE_PHYSICAL_VERIFICATION_MISSING" = 40,
    "STATE_PHYSICAL_VERIFICATION_PRESENT" = 41,
    "TAGGED_ASSETS" = 42,
    "UNTAGGED_ASSETS" = 43,
    "ASSET_CATEGORY_DEPRECIATION_REPORT" = 44,
    "CREATE_ASSET_REMARK" = 45,
    "ATTACH_ASSET_FILE" = 46
}

export enum MyErrors2 {
    'NOT_GET_INVENTORIES' = "Could Not Get Inventories",
    'NOT_STORE_CONVERTED' = "Could Not Store Converted Assets",
    'NOT_CREATE_READER' = "Could Not Create Reader",
    'NOT_CONFIRM_READER' = "Could Not Confirm Reader Details",
    'READER_EXISTS' = "Reader Already Exists",
    'INTERNAL_SERVER_ERROR' = "Internal Server Error",
    'INVALID_READER_DETAILS' = "Invalid Reader Details",
    'NOT_GET_READERS' = "Could Not Get Readers",
    'READER_DOESNT_EXIST' = "Reader Does Not Exist",
    'NOT_EDIT_READER' = "Could Not Update Reader",
    'ASSET_NOT_EXIST' = "Asset Does Not Exist",
    'NOT_STORE_FILE' = "Could Not Store File",
    'INVALID_PARENT_CATEGORY' = "Invalid parent category",
    'EXISTS_LOCATION' = "Location Already Exists",
    'NOT_CREATE_LOCATION' = "Could Not Create Location",
    'NOT_READ_TAG' = "Could Not Read Tag",
    'NOT_PROCESS_TAG' = "Could Not Process Tag",
    'NOT_CONFIRM_GATEPASS' = "Could Not Verify If Gatepass Exists",
    'NOT_PROCESS_EXCEL_FILE' = "Could Not Process The Excel File",
    'COMPANY_EXISTS' = "Company Already Exists",
    'NOT_CREATE_COMPANY' = "Could Not Create Company",
    'USER_NOT_EXIST' = "User Does Not Exist",
    'CATEGORY_NOT_EXIST' = "Category Does Not Exist",
    "NO_USERS" = "There Are No Users In The System",
    "NOT_GET_ASSET_DATA" = "Could Not Get Asset Data",
    "NOT_GET_PARENT_LOCATION" = "Could Not Get Parent Location",
    "NOT_GET_LOCATION_NAME" = "Could Not Get Location Name",
    "NOT_ADD_BUILDING_LOCATION" = "Could Not Add The Building And Location To Asset",
    "NOT_GET_TAGGED_ASSETS" = "Could Not Get Tagged Assets",
    "EMAIL_ALREADY_EXISTS" = "The provided email already exists",
    "INVAILID_NAME" = "The provided name is invalid",
    "INVALID_ROLE" = "The provided role is invalid",
    "NOT_ADD_OTP" = "Could Not Store Create OTP In System",
    "NOT_GENERATE_OTP" = "Could Not Generate OTP",
    "NOT_GET_OTP" = "Could Not Get OTP Details For User",
    "NOT_DELETE_OTP" = "Could Not Delete OTP Record",
    "NOT_VERIFY_OTP" = "Could Not Verify OTP",
    "NOT_SEND_MAIL" = "Could Not Send Mail",
    "NOT_LOGIN_USER" = "Could Not Log In User",
    "NOT_GET_USER_ID" = "Could Not Get User ID",
    "NOT_GET_PARENT_CATEGORY" = "Could Not Get Parent Category",
    "NOT_ADD_CATEGORY_TO_ASSET" = "Could Not Add Category And Sub Category To Raw Asset",
    "NOT_GET_CATEGORY_NAME" = "Could Not Get Category Name",
    "NOT_GENERATE_LOG" = "Could Not Generate Log",
    "NOT_GENERATE_BARCODE" = "Could Not Generate Barcode",
    "LOCATION_NOT_EXIST" = "Location Does Not Exist",
    "ASSET_STATUS_NOT_EXIST" = "Asset Status Does Not Exist",
    "INVALID_CHARACTER_LENGTH" = "Character Is Not Right Length",
    "INVALID_BARCODE" = "Invalid Barcode",
    "NOT_GET_NEXT_ASSET_ID" = "Could Not Get Next Asset ID",
    "NOT_STORE_ASSET" = "Could Not Store Asset",
    "NOT_GENERATE_REPORT" = "Could Not Generate Report",
    "LOG_EVENT_NOT_EXIST" = "The Log Event Type Does Not Exist",
    "NOT_GET_FROM_DATABASE" = "Could Not Get Data From Database",
    "NOT_GET_SITE_BUILDING_OFFICE" = "Could Not Get The Site, Building and Office of Location",
    "REPORT_NOT_SUPPPORTED" = "The report chosen is not supported by system",
    "NOT_GET_ROLES" = "Could Not Get Roles",
    "NOT_GET_EVENTS" = "Could Not Get Events",
    "NOT_GENERATE_MONTLY_DEPRECIATED_ASSETS" = "Could Not Get List of Assets That Have Fully Depreciated This Month",
    "NOT_GET_MAIL_SUBSCRIPTIONS" = "Could Not Get Mail Subscriptions",
    "NOT_GET_MAIL_LIST" = "Could Not Get People Subscribed To Mail",
    "NOT_CHECK_IF_EVENT_EXISTS" = "Could Not Check If Event Exists In System",
    "NOT_ADD_EVENT" = "Could Not Create Event",
    "EVENT_ALREADY_EXISTS" = "The Event Already Exists",
    "NOT_ADD_USER_MAILING_LIST" = "Could Not Add User To Mailing List",
    "ROUTE_NOT_EXIST" = "This Route Does Not Exist",
    "NOT_FIND_LOCATION" = "Could Not Check If Location Exists",
    "NOT_GET_USER_MAIL_SUBSCRIPTIONS" = "Could Not Get User Mail Subscriptions",
    "NOT_ADD_VALUATION" = "Could Not Add Asset Valuation",
    "NOT_GET_VALUATION" = "Could Not Get Asset Valuations",
    "NOT_ADD_INSURANCE" = "Could Not Add Asset Insurance",
    "NOT_GET_INSURANCE" = "Could Not Get Asset Insurance",
    "GENERATE_ASSET_REPORT_NOT_SUPPORTED" = "Selected Field Is Not Supported",
    "NOT_GET_GENERATE_REPORT_STRUCT" = "Could Not Generate Generate Report Struct",
    "NOT_GENERATE_SELECT_STATEMENT" = "Could Not Generate SELECT STATEMENT",
    "NOT_CREATE_MAIL_SUBSCRIPTION" = "Could Not Create Mail Subscription",
    "NOT_GET_DEPRECIATION_TYPE_OF_ASSET" = "Could Not Get Depreciation Type Of Asset",
    "INVALID_DEPRECIATION_TYPE" = "Invalid Depreciation Type",
    "NOT_GET_DEPRECIATION_SCHEDULE" = "Could Not Get Depreciation Schedule Of Asset",
    "NOT_GET_DEPRECIATION_DETAILS" = "Could Not Get Depreciation Details",
    "INVALID_DEPRECIATION_DETAILS" = "Invalid Depreciation Details",
    "NOT_GET_CURRENT_MARKET_VALUE" = "Could Not Get Current Market Value",
    "NOT_DISPOSE_ASSET" = "Could Not Dispose Asset",
    "NOT_ADD_REMARK" = "Could Not Create Asset Remark",
    "NOT_GET_REMARKS" = "Could Not Get Asset Remarks",
    "NOT_GET_GENERATED_REPORTS" = "Could Not Get Generated Reports",
    "FILE_NOT_EXISTS" = "File Does Not Exist",
    "NOT_CREATE_EXCEL_FILE" = "Could Not Create Excel File"
}

export enum Success2 {
    'CREATED_READER_DEVICE' = "Reader Device Created Successfully",
    'UPDATE_READER_DEVICE' = "Reader Device Updated Successfully",
    'SYNC_CONVERTED' = "Synced Converted Assets Succesfully",
    'CREATED_ASSET' = 'Asset Created Successfuly',
    'CREATED_LOCATION' = "Location Created",
    'CREATED_STATUS' = "Asset Status Created",
    "ADDED_USER_MAIL" = "Added User To Mailing List",
    "ADD_VALUATION" = "Valuation Added Succesfully",
    "ADD_INSURANCE" = "Insurance Added Succesfully",
    "GEN_REPORT" = "Generated Report Stored Successfully",
    "DISPOSE_ASSET" = "Disposed Asset Successfully",
    "SET_TIMEOUT" = "Timeout Updated Successfully",
    "CREATED_REMARK" = "Created Asset Remark",
    "FILES_UPLOADED" = "Files Have Been Attached Succesfuly",
    "CUSTOM_REPORT" = "Custom Report Created Succesfuly"
}

export const Succes = {
    '1': 'Asset Created Successfuly',
    '2': "Reports Sent Successfully",
    '3': "Asset Allocated",
    '4': "User Created",
    '5': "Location Created",
    '6': "Site Created",
    '7': "Asset Deleted",
    '8': "Category Created",
    '9': "RFID Reader Created",
    '10': "Antennae Created",
    '11': "Asset Updated",
    '12': 'Category Updated',
    '13': 'GatePass Created',
    '14': 'Location Updated',
    '15': 'Antennae Updated',
    '16': 'RFID Reader Updated',
    '17': "User Updated",
    '18': "GatePass Handled",
    '19': 'Inventory Created',
    "20": "Batch Created",
    '21': "Batch Allocated",
    '22': "Asset Added To Batch",
    '23': "Inventory Updated",
    '24': "Batch Updated",
}
