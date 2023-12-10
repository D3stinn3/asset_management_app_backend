const store_otp_in_database = "INSERT INTO UserOTP (userid, otp, created_time) VALUES ($1, $2, $3)";
const get_user_otp_details = "SELECT * FROM UserOTP WHERE userid = $1 ORDER BY id DESC LIMIT 1";
const queries = {
    store_otp_in_database,
    get_user_otp_details
};
export default queries;
//# sourceMappingURL=db.js.map