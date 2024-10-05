const RecordsM = require('../model/Records.m');
const NursesM = require('../model/Nurses.m');
exports.viewDetail = async (req, res, next) => {
    try {
        var ID_Name = req.params.Name;
        var ID = ID_Name.split("-");
        const rs = await NursesM.getByID(ID[0]);
        if (rs[0].schedule == undefined) rs[0].error = "empty";
        let role = "patient";
        if (req.session.Doctor) {
            role = "doctor";
        }
        var nurseId = ID[0]
        let salary = 0;
        if (rs[0].Title == "Y tá") {
            const count = await RecordsM.getCountForNurse(nurseId);
            salary = count * 200000 + 5000000;
        }
        rs[0].salary = salary;
        if (req.session.Username) {
            res.render('detailNurse', { data: rs[0], display1: "d-none", display2: "d-block", role: role, username: req.session.Username });
        }
        else {
            res.render('detailNurse', { data: rs[0], display1: "d-block", display2: "d-none", role: role });
        }
    } catch (err) {
        next(err);
    }
}