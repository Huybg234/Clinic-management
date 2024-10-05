const app = require('express');
const router = app.Router();
const detailC = require('../controllers/doctor-detail.c');
router.route('/:Name')
    .get(detailC.viewDetail) // Use GET if you're retrieving details
    .post(detailC.viewDetail);
module.exports = router;