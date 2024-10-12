const { db } = require('../model/Database.m');
module.exports = {
    getCountForNurse: async (NurseID) => {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1; // Tháng hiện tại (1-12)
        const currentYear = currentDate.getFullYear();   // Lấy năm hiện tại để tránh nhầm lẫn với các năm khác

        const rs = await db.collection('MedicalRecords').find({
            NurseID: NurseID,
            $expr: {
                $and: [
                    { $eq: [{ $month: { $dateFromString: { dateString: "$Date", format: "%d/%m/%Y" } } }, currentMonth] },
                    { $eq: [{ $year: { $dateFromString: { dateString: "$Date", format: "%d/%m/%Y" } } }, currentYear] }
                ]
            }
        }).toArray();
        return rs.length;
    },
    getCountForDoctor: async (ID) => {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        const rs = await db.collection('MedicalRecords').find({
            DoctorID: ID,
            $or: [
                {
                    trang_thai: "1",
                },
                {
                    $expr: {
                        $and: [
                            {
                                $eq: [
                                    { $month: { $dateFromString: { dateString: "$Date", format: "%d/%m/%Y" } } },
                                    currentMonth,
                                ],
                            },
                            {
                                $eq: [
                                    { $year: { $dateFromString: { dateString: "$Date", format: "%d/%m/%Y" } } },
                                    currentYear,
                                ],
                            },
                        ],
                    },
                },
                {
                    $expr: {
                        $lt: [
                            { $dateFromString: { dateString: "$Date", format: "%d/%m/%Y" } },
                            new Date(currentYear, currentMonth - 1, 1), // Ngày đầu tiên của tháng hiện tại
                        ],
                    },
                }
            ]
        }).toArray();
        return rs.length;
    },
    getDiseases: async (month, year) => {
        const rs = await db.collection('MedicalRecords').aggregate([
            {
                $project: {
                    Name: 1,
                    Diagnosis: 1,
                    medical_status: 1,
                    discharge_date: 1,
                    month: { $substr: ["$discharge_date", 5, 2] },
                    year: { $substr: ["$discharge_date", 0, 4] }

                }
            },
            {
                $match: {
                    // medical_status: "khỏi bệnh",       // Only patients who have recovered
                    month: month.toString(),           // Match the given month
                    year: year.toString()              // Match the given year
                }
            },
            {
                $group: {
                    _id: "$Diagnosis",                // Group by Diagnosis
                    distinctPatients: { $addToSet: "$Name" }  // Collect distinct patient names
                }
            },
            {
                $project: {
                    _id: 1,
                    patientCount: { $size: "$distinctPatients" }  // Count the distinct patients
                }
            },
            {
                $sort: { patientCount: -1 }          // Sort by patient count in descending order
            }
        ]).toArray();
        console.log(month);
        console.log(year);
        return rs;
    },
    // CountListDisease: async (month, year) => {
    //     try {
    //         // const startDate = new Date(year, month - 1, 1);
    //         // const endDate = new Date(year, month, 1);
    //         // console.log(startDate);
    //         // console.log(endDate);

    //         const result = await db.collection('MedicalRecords').aggregate([
    //             {
    //                 $addFields: {
    //                     // Convert 'Date' from string format 'DD/MM/YYYY' to a Date object
    //                     formattedDate: {
    //                         $dateFromString: {
    //                             dateString: "$Date",
    //                             format: "%d/%m/%Y"
    //                         }
    //                     }
    //                 }
    //             },
    //             {
    //                 $match: {
    //                     // trang_thai: "1",
    //                     formattedDate: {
    //                         $gte: new Date(year, month - 1, 1),
    //                         $lt: new Date(year, month, 1)
    //                     }
    //                 }
    //             },
    //             {
    //                 $group: {
    //                     _id: "$Diagnosis",
    //                     count: { $sum: 1 }
    //                 }
    //             },
    //             { $sort: { count: -1 } }
    //         ]).toArray();

    //         console.log(result);
    //         return result;
    //     }
    //     catch (err) {
    //         console.error(err);
    //         throw err;
    //     }
    // },
    calculateRevenue: async (month, year) => {
        const startDate = new Date(year, month - 1, 1); // Start of the month
        const endDate = new Date(year, month, 1); // Start of the next month

        // Aggregation for calculating the total revenue
        const result = await db.collection('MedicalRecords').aggregate([
            {
                $addFields: {
                    // Convert 'Date' from string format 'DD/MM/YYYY' to a Date object
                    formattedDate: {
                        $dateFromString: {
                            dateString: "$Date",
                            format: "%d/%m/%Y"
                        }
                    },
                    chi_phi_numeric: { $toDouble: "$chi_phi" }, // Convert chi_phi to number
                    AllTotal_numeric: { $toDouble: "$AllTotal" } // Convert AllTotal to number
                }
            },
            {
                $match: {
                    formattedDate: {
                        $gte: startDate,
                        $lt: endDate
                    }
                }
            },
            {
                $group: {
                    _id: null, // No grouping by specific field
                    totalRevenue: {
                        $sum: {
                            $add: ["$chi_phi_numeric", "$AllTotal_numeric"]
                        }
                    }
                }
            }
        ]).toArray();
        console.log(result);

        return result.length > 0 ? result[0].totalRevenue : 0; // Return total revenue or 0 if no result
    },
    add: async (data) => {
        const rs = await db.collection('MedicalRecords').insertOne(data);
        return rs;
    },
    getByUsername: async (username) => {
        const rs = await db.collection('MedicalRecords').find({ Username: username }).toArray();
        return rs;
    },
    getMaxID: async () => {
        const rs = await db.collection('MedicalRecords').find({}).sort("ID", -1).limit(1).toArray();
        return rs;
    },
    getAll: async () => {
        const rs = await db.collection('MedicalRecords').find({}).toArray();
        return rs;
    },
    getByID: async (ID) => {
        const rs = await db.collection('MedicalRecords').find({ ID: ID }).toArray();
        return rs;
    },
    CountListDisease: async (month, year) => {
        try {
            const result = await db.collection('MedicalRecords').aggregate([
                {
                    $addFields: {
                        formattedDate: {
                            $dateFromString: {
                                dateString: "$Date",
                                format: "%d/%m/%Y"
                            }
                        }
                    }
                },
                {
                    $match: {
                        // Lọc theo tháng và năm yêu cầu
                        formattedDate: {
                            $gte: new Date(year, month - 1, 1),
                            $lt: new Date(year, month, 1)
                        }
                    }
                },
                {
                    // Nhóm theo bệnh nhân và loại chẩn đoán (Diagnosis)
                    $group: {
                        _id: {
                            username: "$Username",
                            diagnosis: "$Diagnosis"
                        },
                        firstVisitDate: { $min: "$formattedDate" }  // Lấy ngày khám đầu tiên
                    }
                },
                {
                    // Sau khi loại bỏ các lần khám trùng, nhóm lại theo loại bệnh
                    $group: {
                        _id: "$_id.diagnosis",  // Chỉ quan tâm đến loại bệnh
                        count: { $sum: 1 }  // Đếm số lượng bệnh nhân khác nhau
                    }
                },
                {
                    $sort: { count: -1 }
                }
            ]).toArray();

            console.log(result);
            return result;
        }
        catch (err) {
            console.error(err);
            throw err;
        }
    }

}