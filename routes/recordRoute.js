const isAuthenticated = require("../middleware/isAuthenticated");
const {
  createOrUpdateRecord,
  getAllRecords,
  getRecordById,
  deleteRecordById,
} = require("../controllers/recordController");

const router = require("express").Router();
// All Requires

// ROUTE
router
  /**
   * @route base_url/api/v1/record/create-record
   * @method POST
   */
  .post("/create-record", createOrUpdateRecord)
  /**
   * @route base_url/record/api/v1/gel-all-records
   * @method GET
   */
  .get("/gel-all-records/:userId", isAuthenticated, getAllRecords)
  /**
   * @route base_url/record/api/v1/get-record-by-id/:id
   * @method GET
   */
  .get("/get-record-by-id/:id", isAuthenticated, getRecordById)
  /**
   * @route base_url/record/api/v1/delete-record-by-id/:id
   * @method DELETE
   */
  .delete("/delete-record-by=id/:id", isAuthenticated, deleteRecordById);

// Exports
module.exports = router;
