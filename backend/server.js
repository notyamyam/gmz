const express = require("express");
const multer = require("multer");
const path = require("path");
const mysql = require("mysql");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

const fs = require("fs");
const moment = require("moment");
const { type } = require("os");

const app = express();
const port = 5000;
//"http://gmzfoodtrade.shop" ,
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["POST", "GET", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: "Content-Type,Authorization",
  })
);
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
const os = require("os");

// Get the machine's network interfaces (optional, for more dynamic IP resolution)
const networkInterfaces = os.networkInterfaces();
const localIP =
  Object.values(networkInterfaces)
    .flat()
    .find((details) => details.family === "IPv4" && !details.internal)
    ?.address || "localhost";

// const db = mysql.createConnection({
//   host: "srv1154.hstgr.io",
//   user: "u319302750_dbgmzadmin",
//   password: "Dbgmzadmin112024!",
//   database: "u319302750_dbgmz",
// });

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "dbgmz",
});

// const db = mysql.createPool({
//   host: "srv1154.hstgr.io",
//   user: "u319302750_dbgmzadmin",
//   password: "Dbgmzadmin112024!",
//   database: "u319302750_dbgmz",
//   connectionLimit: 10,
// });

// const db = mysql.createPool({
// host: '127.0.0.1',           // Localhost (VPS)
// user: 'u319302750_dbgmzadmin', // Database user
// password: 'Dbgmzadmin112024!', // Database password
// database: 'u319302750_dbgmz', // Database name
// connectionLimit: 10          // Connection limit (adjust if necessary)
// });

db.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }

  console.log("Connected to the database!");

  connection.release();
});

const queryAsync = (sql, params) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) reject(err);
      resolve(results);
    });
  });
};

//===============>LOGIN================>//
const secretKey = "your-secret-key";
app.post("/api/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const sql = `SELECT * FROM tblusers WHERE username = '${username}' AND password = '${password}'`;
  await queryAsync(sql)
    .then((results) => {
      if (results.length > 0) {
        const user = results[0];

        const token = jwt.sign(
          { id: user.id, username: user.username }, // Payload
          secretKey,
          { expiresIn: "1h" }
        );
        res.json({
          message: "Login Success",
          token: token,
          user: user,
        });
      } else {
        res.status(500).json({ message: "Login Failed" });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "Internal Server Error" });
    });
});

app.post("/api/register", async (req, res) => {
  const { username, password, name, location, contactNo, email } = req.body;

  // Check if username already exists
  db.query(
    "SELECT * FROM tblusers WHERE username = ?",
    [username],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Database error" });
      }
      if (result.length > 0) {
        return res.status(400).json({ message: "Username already exists" });
      }
      // Insert user into tblusers table
      const query =
        "INSERT INTO tblusers (username, password, access) VALUES (?, ?, ?)";
      const values = [username, password, 4]; // 4 for regular user access
      db.query(query, values, (err, result) => {
        if (err) {
          return res.status(500).json({ message: "Error registering user" });
        }

        // Insert customer information
        const customerQuery =
          "INSERT INTO tblcustomer (customer_id,name, location, contact_no, email) VALUES (?,?,?,?,?)";
        const customerValues = [
          result.insertId,
          name,
          location,
          contactNo,
          email,
        ];
        db.query(customerQuery, customerValues, (err, customerResult) => {
          if (err) {
            console.log(err);
            return res.status(500).json({ message: "Error adding customer" });
          }

          return res.status(200).json({
            message: "User registered successfully",
            userId: result.insertId,
            customerId: customerResult.insertId,
          });
        });
      });
    }
  );
});

//===============>LOGIN================>//
// app.get("/api/accounts", async (req, res) => {
//   const sql = `SELECT * FROM tblusers `;
//   await queryAsync(sql)
//     .then((results) => {
//       if (results.length > 0) {
//         const user = results;

//         res.json({
//           user: user,
//         });
//       } else {
//         res.status(500).json({ message: "Failed to fetch account." });
//       }
//     })
//     .catch((err) => {
//       console.error(err);
//       res.status(500).json({ message: "Internal Server Error" });
//     });
// });

// app.post("/api/addaccount", async (req, res) => {
//   const username = req.body.username;
//   const password = req.body.password;
//   const access = req.body.access;
//   const sql = `INSERT INTO tblusers (username, password, access) VALUES (?,?,?)`;
//   await queryAsync(sql, [username, password, access])
//     .then((results) => {
//       res.status(201).json({ message: "Success" });
//     })
//     .catch((err) => {
//       console.error(err);
//       res.status(500).json({ message: "Internal Server Error" });
//     });
// });

// app.post("/api/editaccount/:id", async (req, res) => {
//   const id = req.params.id;
//   const username = req.body.username;
//   const password = req.body.password;
//   const access = parseInt(req.body.access);
//   const sql = `UPDATE tblusers SET username = ?, password = ?, access = ? WHERE id = ${id}`;
//   await queryAsync(sql, [username, password, access])
//     .then((results) => {
//       res.status(200).json({ message: "Success", result: results });
//     })
//     .catch((err) => {
//       console.error(err);
//       res.status(500).json({ message: "Internal Server Error" });
//     });
// });

// app.delete("/api/deleteaccount/:id", async (req, res) => {
//   const id = req.params.id;

//   const sql = `DELETE FROM tblusers WHERE id = ${id}`;
//   await queryAsync(sql)
//     .then((results) => {
//       res.status(200).json({ message: "Success", result: results });
//     })
//     .catch((err) => {
//       console.error(err);
//       res.status(500).json({ message: "Internal Server Error" });
//     });
// });

// GET all accounts with customer info if access = 4
app.get("/api/accounts", async (req, res) => {
  const sql = `
    SELECT 
      u.id, u.username, u.password, u.access, 
      c.name AS name, c.location AS location  , c.email as email , c.contact_no
    FROM tblusers u
    LEFT JOIN tblcustomer c ON u.id = c.customer_id
    ORDER BY u.access , u.id ASC;`;

  try {
    const results = await queryAsync(sql);
    if (results.length > 0) {
      res.json({ user: results });
    } else {
      res.status(404).json({ message: "No accounts found." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// POST add new account with optional customer info if access = 4
// POST add new account with optional customer info if access = 4
app.post("/api/addaccount", async (req, res) => {
  const { username, password, access, name, location, email, contact_no } =
    req.body;

  const sql = `INSERT INTO tblusers (username, password, access) VALUES (?, ?, ?)`;
  try {
    const result = await queryAsync(sql, [username, password, access]);

    if (access == 4) {
      // If the role is Customer, add customer info
      const customerSql = `INSERT INTO tblcustomer (customer_id, name, location , contact_no, email) VALUES (?, ?, ?,?, ?)`;
      await queryAsync(customerSql, [
        result.insertId,
        name,
        location,
        contact_no,
        email,
      ]);
    }

    res.status(201).json({ message: "Account added successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add account." });
  }
});

// POST edit an account with optional customer info if access = 4
// POST edit an account with optional customer info if access = 4
app.post("/api/editaccount/:id", async (req, res) => {
  const {
    id,
    username,
    password,
    access,
    name,
    location,
    contact_no,
    email,
    customer_name,
    customer_location,
  } = req.body;

  console.log("editaccount>>", req.body);

  const updateUserSql = `UPDATE tblusers SET username = ?, password = ?, access = ? WHERE id = ?`;
  try {
    // Update main user details
    await queryAsync(updateUserSql, [username, password, access, id]);

    if (access == 4) {
      // Handle Customer-specific details
      const checkCustomerSql = `SELECT * FROM tblcustomer WHERE customer_id = ?`;
      const existingCustomer = await queryAsync(checkCustomerSql, id);

      if (!name) name = customer_name;
      if (!location) location = customer_location;

      if (existingCustomer.length > 0) {
        // Update customer information
        const updateCustomerSql = `
        UPDATE tblcustomer 
        SET name = ?, location = ?, contact_no = ?, email = ? 
        WHERE customer_id = ?`;
        await queryAsync(updateCustomerSql, [
          name,
          location,
          contact_no,
          email,
          id,
        ]);
      } else {
        // Insert new customer record if it doesn't exist
        const insertCustomerSql = `
        INSERT INTO tblcustomer (customer_id, name, location, contact_no, email) 
        VALUES (?, ?, ?, ?, ?)`;
        await queryAsync(insertCustomerSql, [
          id,
          name,
          location,
          contact_no,
          email,
        ]);
      }
    } else {
      // If role is no longer "Customer," remove customer details
      const deleteCustomerSql = `DELETE FROM tblcustomer WHERE customer_id = ?`;
      await queryAsync(deleteCustomerSql, [id]);
    }

    res.status(200).json({ message: "Account updated successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update account." });
  }
});

// DELETE an account and associated customer info if access = 4
// DELETE an account and associated customer info if access = 4
app.delete("/api/deleteaccount/:id", async (req, res) => {
  const id = req.params.id;

  const sql = `DELETE FROM tblusers WHERE id = ?`;
  const deleteCustomerSql = `DELETE FROM tblcustomer WHERE customer_id = ?`;

  try {
    // Delete customer info if exists
    await queryAsync(deleteCustomerSql, [id]);
    // Delete user account
    await queryAsync(sql, [id]);

    res.status(200).json({ message: "Account deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete account." });
  }
});

//////////////=========DOCUMENT============>

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "uploads");
    cb(null, uploadPath); // Files will be saved in the 'uploads' directory
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName); // Save file with a unique name to avoid collisions
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ["application/pdf"];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true); // Accept the file
    } else {
      cb(new Error("Only PDF files are allowed."), false); // Reject the file
    }
  },
});

app.post("/api/documents/upload", upload.single("documentFile"), (req, res) => {
  const today = moment().format("YYYY-MM-DD");
  const {
    documentName,
    category,
    dateEffective,
    dateUploaded,
    expirationDate,
    description,
    isNonExpiry,
  } = req.body;
  console.log(isNonExpiry);
  const nonExpiryValue = isNonExpiry == "true" ? 1 : 0; // Ensure it's a number (1 or 0)

  // Default values for non-expiry documents
  const effectiveDateValue = nonExpiryValue ? null : dateEffective;
  const expirationDateValue = nonExpiryValue ? null : expirationDate;

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }
  console.log(nonExpiryValue);

  if (!nonExpiryValue) {
    if (!dateEffective || !expirationDate) {
      return res.status(400).json({
        error:
          "Effective and expiration dates are required for expiring documents.",
      });
    }

    if (moment(expirationDate).isSameOrBefore(moment(dateEffective))) {
      return res.status(400).json({
        error: "The expiration date must be after the effective date.",
      });
    }
  }

  const filePath = `/uploads/${req.file.filename}`;

  try {
    const sql = `
      INSERT INTO tbldocument 
      (documentName, filePath, category, dateEffective, dateUploaded, expirationDate, description, isArchive, isNonExpiry) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(
      sql,
      [
        documentName,
        filePath,
        category,
        effectiveDateValue,
        today,
        expirationDateValue,
        description,
        0, // isArchive default value
        nonExpiryValue,
      ],
      (err, result) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ error: "Database error." });
        }
        return res.status(201).json({
          message: "Document uploaded successfully.",
          document: result,
        });
      }
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "error", message: error.message });
  }
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(500).json({ error: err.message });
  }
  next();
});

app.get("/api/documents", (req, res) => {
  const sql = `  
SELECT 
    d.*, 
    -- Validity Column: How many months left or expired
    CASE 
        WHEN d.expirationDate IS NULL THEN 'No Expiration Date'
        WHEN d.expirationDate < CURDATE() THEN 'Expired'
        WHEN TIMESTAMPDIFF(MONTH, CURDATE(), d.expirationDate) <= 3 THEN CONCAT(TIMESTAMPDIFF(MONTH, CURDATE(), d.expirationDate), ' months left')
        ELSE CONCAT(TIMESTAMPDIFF(MONTH, CURDATE(), d.expirationDate), ' months left')
    END AS validity,
    
    -- Status Column: 1 = Renew Now, 0 = Expired, 2 = More than 3 months left
    CASE 
        WHEN d.expirationDate IS NULL THEN NULL
        WHEN d.expirationDate < CURDATE() THEN 0   -- Expired
        WHEN TIMESTAMPDIFF(MONTH, CURDATE(), d.expirationDate) <= 3 THEN 1  -- Renew Now
        ELSE 2  -- More than 3 months left
    END AS status
FROM tbldocument d
ORDER BY d.expirationDate ASC;

`;
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        status: "error",
        message: err.message,
      });
    }

    res.status(200).json(results);
  });
});

app.get("/api/documents/view/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "uploads", filename);

  res.sendFile(filePath, (err) => {
    if (err) {
      console.error(err);
      res.status(404).send("File not found.");
    }
  });
});

app.put("/api/documents/:id", upload.single("documentFile"), (req, res) => {
  const { id } = req.params;
  const {
    documentName,
    category,
    dateEffective,
    expirationDate,
    description,
    isNonExpiry,
  } = req.body;

  const nonExpiryValue = isNonExpiry == "true" ? 1 : 0; // Ensure it's a number (1 or 0)

  // Default values for non-expiry documents
  const effectiveDateValue = nonExpiryValue ? null : dateEffective;
  const expirationDateValue = nonExpiryValue ? null : expirationDate;

  let newFilePath = null;
  if (req.file) {
    newFilePath = `/uploads/${req.file.filename}`;
  }

  // Query to get the current file path
  const getFileQuery = `SELECT filePath FROM tbldocument WHERE id = ?`;

  db.query(getFileQuery, [id], (err, rows) => {
    if (err) {
      console.error("Database query error:", err);
      return res
        .status(500)
        .json({ error: "Failed to fetch document details." });
    }

    const oldFilePath = rows[0]?.filePath;

    // Update the database with new values
    const updateQuery = `
      UPDATE tbldocument
      SET 
        documentName = ?, 
        category = ?, 
        dateEffective = ?, 
        expirationDate = ?, 
        description = ?, 
        isNonExpiry = ?
        ${newFilePath ? ", filePath = ?" : ""}
      WHERE id = ?`;

    const queryParams = newFilePath
      ? [
          documentName,
          category,
          effectiveDateValue,
          expirationDateValue,
          description,
          nonExpiryValue,
          newFilePath,
          id,
        ]
      : [
          documentName,
          category,
          effectiveDateValue,
          expirationDateValue,
          description,
          nonExpiryValue,
          id,
        ];

    db.query(updateQuery, queryParams, (updateErr, result) => {
      if (updateErr) {
        console.error("Database update error:", updateErr);
        return res.status(500).json({ error: "Database update failed." });
      }

      // Delete the old file if a new file was uploaded
      if (newFilePath && oldFilePath) {
        const fullOldFilePath = path.join(__dirname, oldFilePath);
        fs.unlink(fullOldFilePath, (unlinkErr) => {
          if (unlinkErr) {
            console.error("Failed to delete old file:", unlinkErr);
          }
        });
      }

      return res
        .status(200)
        .json({ message: "Document updated successfully." });
    });
  });
});

app.delete("/api/documents/:id/:documentName/:user", (req, res) => {
  const { id, documentName, user } = req.params;

  let newFilePath = null;

  // If a new file is uploaded, set the new file path
  if (req.file) {
    newFilePath = `/uploads/${req.file.filename}`;
  }

  // Query to get the current file path
  const getFileQuery = `SELECT documentName, filePath FROM tbldocument WHERE id = ?`;

  db.query(getFileQuery, [id], (err, rows) => {
    if (err) {
      console.error("Database query error:", err);
      return res
        .status(500)
        .json({ error: "Failed to fetch document details." });
    }

    const oldFilePath = rows[0]?.filePath; // Get the current file path from the database

    // Update the database with new values
    const deleteQuery = `
      DELETE FROM tbldocument WHERE id = ${id}`;

    db.query(deleteQuery, (err, result) => {
      if (err) {
        console.error("Database update error:", err);
        return res.status(500).json({ error: "Database delete failed." });
      }

      // Delete the old file if a new file was uploaded and the old file exists
      if (oldFilePath) {
        const fullOldFilePath = path.join(__dirname, oldFilePath); // Construct the full path

        // Check if the file exists before attempting deletion
        fs.access(fullOldFilePath, fs.constants.F_OK, (accessErr) => {
          if (accessErr) {
          } else {
            fs.unlink(fullOldFilePath, (unlinkErr) => {
              if (unlinkErr) {
                console.error("Failed to delete old file:", unlinkErr);
              } else {
                console.log("Old file deleted successfully:", fullOldFilePath);
              }
            });
          }
        });
      }

      const sqlnotif = `INSERT INTO tblnotifications (description, status) VALUES ('${documentName} has been deleted by ${user}.',0)`;

      db.query(sqlnotif, id, (err, result) => {
        if (err) {
          console.error("Error archiving:", err);
          return res.status(500).send("Error archiving document");
        }
      });

      return res.status(200).json({ message: "Document delete successfully." });
    });
  });
});

app.put("/api/documents/:id/archive", async (req, res) => {
  const { id } = req.params;
  const { documentName, user, isArchive, status, archiveValue } = req.body;
  console.log(req.body);
  try {
    // Find the document by ID

    if (!id) {
      return res.status(404).json({ message: "Document not found" });
    }

    const sql = `UPDATE tbldocument SET isArchive = ${archiveValue} WHERE id = ?`;

    db.query(sql, id, (err, result) => {
      if (err) {
        console.error("Error archiving:", err);
        return res.status(500).send("Error archiving document");
      }
      var sqlnotif = `INSERT INTO tblnotifications (description, status) VALUES ('${documentName} has been archived by ${user}.',0)`;
      if (archiveValue == 0) {
        sqlnotif = `INSERT INTO tblnotifications (description, status) VALUES ('${documentName} has been unarchived by ${user}.',0)`;
      }

      db.query(sqlnotif, id, (err, result) => {
        if (err) {
          console.error("Error archiving:", err);
          return res.status(500).send("Error archiving document");
        }
      });
    });
    return res.status(200).json({ message: "Document archived successfully" });
  } catch (error) {
    console.error("Error archiving document:", error);
    res.status(500).json({ message: "Failed to archive document" });
  }
});
// app.get("/api/documents/notifications", (req, res) => {
//   const currentDate = moment().format("YYYY-MM-DD");
//   const oneYearFromNow = moment().add(1, "year").format("YYYY-MM-DD");
//   const threeMonthsFromNow = moment().add(3, "months").format("YYYY-MM-DD");

//   // Modify the query as required
//   const query = `
//     SELECT d.*
//     FROM tbldocument d
//     JOIN tblcategories c ON d.category = c.categoryName
//     WHERE
//       -- Notify legal documents within 1 year of expiration
//       (c.type = 'Legal' AND d.expirationDate BETWEEN '${currentDate}' AND '${oneYearFromNow}')
//       OR
//       -- Notify contracts/agreements 3 months before renewal
//       (c.type = 'Contracts/Agreement' AND d.expirationDate BETWEEN '${currentDate}' AND '${threeMonthsFromNow}')
//       OR
//       -- Notify regular documents expiring in 1 year
//       (c.type = 'Document' AND d.expirationDate BETWEEN '${currentDate}' AND '${oneYearFromNow}')
//   `;

//   db.query(query, (err, results) => {
//     if (err) {
//       console.error("Error fetching notifications:", err);
//       return res.status(500).json({ error: "Failed to fetch notifications." });
//     }

//     return res.status(200).json(results);
//   });
// });

// Endpoint to fetch customer orders
// app.get("/api/documents/notifications", (req, res) => {
//   const currentDate = moment().format("YYYY-MM-DD");
//   const oneYearFromNow = moment().add(1, "year").format("YYYY-MM-DD");
//   const threeMonthsFromNow = moment().add(3, "months").format("YYYY-MM-DD");

//   // Modify the query as required
//   const query = `
//       SELECT d.*, c.type AS categoryType
//       FROM tbldocument d
//       JOIN tblcategories c ON d.category = c.categoryName
//       WHERE
//         -- Notify legal documents within 1 year of expiration
//         (c.type = 'Legal' AND d.expirationDate BETWEEN '${currentDate}' AND '${oneYearFromNow}')
//         OR
//         -- Notify contracts/agreements 3 months before renewal
//         (c.type = 'Contracts/Agreement' AND d.expirationDate BETWEEN '${currentDate}' AND '${threeMonthsFromNow}')
//         OR
//         -- Notify regular documents expiring in 1 year
//         (c.type = 'Document' AND d.expirationDate BETWEEN '${currentDate}' AND '${oneYearFromNow}')
//     `;

//   db.query(query, (err, results) => {
//     if (err) {
//       console.error("Error fetching notifications:", err);
//       return res.status(500).json({ error: "Failed to fetch notifications." });
//     }

//     // Insert new notifications into the tblnotifications table if they don't already exist
//     results.forEach((notif) => {
//       const description = generateNotificationDescription(notif); // Create a descriptive notification message

//       // Check if the notification already exists
//       const checkQuery = `SELECT * FROM tblnotifications WHERE description = ? AND status = 0`;
//       db.query(checkQuery, [description], (checkErr, checkResults) => {
//         if (checkErr) {
//           console.error(
//             "Error checking for duplicate notifications:",
//             checkErr
//           );
//         }

//         if (checkResults.length === 0) {
//           // No duplicate found, insert the new notification
//           const insertQuery = `
//               INSERT INTO tblnotifications (description, status)
//               VALUES (?, ?)
//             `;

//           db.query(insertQuery, [description, 0], (insertErr) => {
//             if (insertErr) {
//               console.error("Error inserting notification:", insertErr);
//             }
//           });
//         }
//       });
//     });

//     return res.status(200).json(results);
//   });
// });

// Endpoint to fetch customer orders
// Endpoint to fetch customer orders
app.get("/api/documents/notifications", (req, res) => {
  const currentDate = moment().format("YYYY-MM-DD");
  const oneYearFromNow = moment().add(1, "year").format("YYYY-MM-DD");
  const threeMonthsFromNow = moment().add(3, "months").format("YYYY-MM-DD");

  // Query to fetch documents that require notifications
  const query = `
    SELECT d.*, c.type AS categoryType
    FROM tbldocument d
    JOIN tblcategories c ON d.category = c.categoryName
    WHERE 
      -- Notify legal documents within 1 year of expiration
      (c.type = 'Legal' AND d.expirationDate BETWEEN '${currentDate}' AND '${oneYearFromNow}')
      OR
      -- Notify contracts/agreements 3 months before renewal
      (c.type = 'Contracts/Agreement' AND d.expirationDate BETWEEN '${currentDate}' AND '${threeMonthsFromNow}')
      OR
      -- Notify regular documents expiring in 1 year
      (c.type = 'Document' AND d.expirationDate BETWEEN '${currentDate}' AND '${oneYearFromNow}')
      OR
      -- Notify for expired documents
      (d.expirationDate < '${currentDate}')
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching notifications:", err);
      return res.status(500).json({ error: "Failed to fetch notifications." });
    }

    results.forEach((notif) => {
      const expirationDate = moment(notif.expirationDate).format("YYYY-MM-DD");
      const description = generateNotificationDescription(
        notif,
        expirationDate
      );

      // Check if the notification already exists
      const checkQuery = `
      SELECT * 
      FROM tblnotifications 
      WHERE description = ? 
      AND expirationDate = ? 
      AND categoryType = ?
    `;

      db.query(
        checkQuery,
        [description, expirationDate, notif.categoryType],
        (checkErr, checkResults) => {
          if (checkErr) {
            console.error(
              "Error checking for duplicate notifications:",
              checkErr
            );
          }

          if (checkResults.length === 0) {
            // No duplicate found, insert the new notification
            const insertQuery = `
            INSERT INTO tblnotifications (description, expirationDate, categoryType, status)
            VALUES (?, ?, ?, ?)
          `;

            // If the document is already expired, mark the status as 1 (urgent)
            const status = notif.expirationDate < currentDate ? 1 : 0;

            db.query(
              insertQuery,
              [description, expirationDate, notif.categoryType, status],
              (insertErr) => {
                if (insertErr) {
                  console.error("Error inserting notification:", insertErr);
                }
              }
            );
          } else {
            // Update the notification if necessary (e.g., if the document just expired)
            const updateQuery = `
          UPDATE tblnotifications 
          SET status = 1 
          WHERE id = ?
        `;

            if (notif.expirationDate < currentDate) {
              db.query(updateQuery, [checkResults[0].id], (updateErr) => {
                if (updateErr) {
                  console.error("Error updating notification:", updateErr);
                }
              });
            }
          }
        }
      );
    });

    return res.status(200).json(results);
  });
});

// Function to generate a detailed notification description
function generateNotificationDescription(notif, expirationDate) {
  const currentDate = moment().format("YYYY-MM-DD");

  if (moment(expirationDate).isBefore(currentDate)) {
    // Notification for already expired documents
    return `${notif.documentName} (${notif.categoryType}) has already expired on ${expirationDate}.`;
  } else if (notif.categoryType === "Legal") {
    return `${notif.documentName} (Legal) is expiring soon on ${expirationDate}.`;
  } else if (notif.categoryType === "Contracts/Agreement") {
    return `${notif.documentName} (Contract/Agreement) needs renewal by ${expirationDate}.`;
  } else {
    return `${notif.documentName} (Document) will expire on ${expirationDate}.`;
  }
}

app.get("/api/documents/getnotifications/:id", (req, res) => {
  const id = req.params.id;
  const query = `
    SELECT * FROM tblnotifications WHERE account_notif = ?
    ORDER BY id DESC
    LIMIT 10;
  `;

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error("Error fetching notifications:", err);
      return res.status(500).json({ error: "Failed to fetch notifications." });
    }

    return res.status(200).json(results);
  });
});

app.post("/api/documents/mark-as-read", (req, res) => {
  const { id } = req.body;

  // Update the status of the notification to 1 (read)
  const query = `UPDATE tblnotifications SET status = 1 WHERE id = ?`;

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error marking notification as read:", err);
      return res
        .status(500)
        .json({ error: "Failed to update notification status." });
    }

    return res.status(200).json({ message: "Notification marked as read." });
  });
});

app.get("/api/customer-orders", (req, res) => {
  const query =
    "SELECT order_id as ID , mop , total_sum_price as Total FROM tblorders_customer WHERE status = 'Transit' GROUP BY order_id";
  db.query(query, (error, results) => {
    if (error) {
      console.error("Error fetching customer orders:", error);
      return res
        .status(500)
        .json({ success: false, message: "Error fetching customer orders." });
    }
    res.status(200).json(results);
  });
});

// Endpoint to fetch out-of-stock items
app.get("/api/out-of-stock-items", (req, res) => {
  const query =
    "SELECT itemName, quantity FROM tblitems WHERE quantity < 15 ORDER BY quantity DESC";
  db.query(query, (error, results) => {
    if (error) {
      console.error("Error fetching out-of-stock items:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching out-of-stock items.",
      });
    }
    res.status(200).json(results);
  });
});

app.get("/api/documentsdashboard", (req, res) => {
  const query = "SELECT documentName , category FROM tbldocument";
  db.query(query, (error, results) => {
    if (error) {
      console.error("Error fetching documents:", error);
      return res
        .status(500)
        .json({ success: false, message: "Error fetching documents." });
    }
    res.status(200).json(results);
  });
});

app.get("/api/toprawmats", (req, res) => {
  const query = `
SELECT
  oi.matId,
  rm.matName,
  s.supplyName,
  SUM(oi.quantity) AS totalOrdered
FROM
  tblorderfromsupplier_items oi
JOIN tblordersfromsupplier od ON oi.orderId = od.orderId
JOIN tblrawmats rm ON oi.matId = rm.matId
JOIN tblsuppliers s ON oi.supplierId = s.supplyId
GROUP BY oi.supplierId , rm.matName, s.supplyName
ORDER BY totalOrdered DESC;

`;
  db.query(query, (error, results) => {
    if (error) {
      console.error("Error fetching raw:", error);
      return res
        .status(500)
        .json({ success: false, message: "Error fetching raw." });
    }
    res.status(200).json(results);
  });
});

app.get("/api/dashboard", async (req, res) => {
  try {
    // Inventory Items query
    const inventoryQuery = `
   SELECT 
    it.ItemName AS Product, 
    it.quantity AS Remaining, 
    COALESCE(SUM(p.actualQuantityProduced), 0) AS totalQuantity 
FROM 
    tblitems it 
LEFT JOIN 
    tblproduction p 
ON 
    it.itemId = p.itemId 
GROUP BY 
    it.itemId, it.ItemName, it.quantity, it.threshold_low
HAVING 
    Remaining < it.threshold_low
ORDER BY 
    Remaining ASC;
    `;

    // Raw Materials query
    const rawMatsQuery = `
   SELECT 
    raw.matName AS Material, 
    COALESCE(SUM(odi.remaining_quantity), 0) AS Remaining
FROM 
    tblrawmats raw
LEFT JOIN 
    tblorderfromsupplier_items odi 
ON 
    raw.matId = odi.matId
GROUP BY 
    raw.matName, raw.matId, raw.threshold_low
HAVING 
    Remaining < raw.threshold_low
ORDER BY 
    Remaining ASC;

    `;

    // Supplier Deliveries query
    const supDeliQuery = `
     SELECT  
        sp.supplyName as Supplier,
        od.totalCost AS totalCost,
        IFNULL(DATE_FORMAT(od.orderDate, '%Y-%m-%d'), 'N/A') AS OrderDate,
        SUM(odi.quantity) AS totalQuantity
      FROM tblordersfromsupplier od
      LEFT JOIN tblorderfromsupplier_items odi ON od.orderId = odi.orderId
			 LEFT JOIN tblsuppliers sp ON sp.supplyId = odi.supplierId
      WHERE odi.quantity IS NOT NULL AND sp.supplyName IS NOT NULL AND od.status = 0
      GROUP BY od.orderId;
    `;

    // Production Dashboard query
    const prodQuery = `
      SELECT pd.staffName , it.itemName AS Product
      FROM tblproduction pd 
      LEFT JOIN tblitems it ON pd.itemId = it.itemId 
      WHERE pd.production_status = 0 
      ORDER BY pd.production_status ASC;
    `;

    const prodMat = `
    SELECT
  oi.matId AS ID,
  rm.matName,
  s.supplyName,
  SUM(oi.quantity) AS totalOrdered
FROM
  tblorderfromsupplier_items oi
JOIN tblordersfromsupplier od ON oi.orderId = od.orderId
JOIN tblrawmats rm ON oi.matId = rm.matId
JOIN tblsuppliers s ON oi.supplierId = s.supplyId
GROUP BY oi.supplierId , rm.matName, s.supplyName
ORDER BY totalOrdered DESC
LIMIT 5;

    `;

    const mostSoldProduct = `
   SELECT it.itemName AS item_name,  
     COALESCE(SUM(sd.quantity), 0) AS TOTALQUANTITY, 
     COALESCE(SUM(sd.total_sum_price), 0) AS TOTALSALES 
FROM tblitems it
LEFT JOIN tblsales sd 
ON it.itemName COLLATE utf8mb4_unicode_ci = sd.item_name COLLATE utf8mb4_unicode_ci 
GROUP BY it.itemName 
ORDER BY 
     COALESCE(SUM(sd.quantity), 0) DESC,  
     CASE WHEN COALESCE(SUM(sd.quantity), 0) = 0 THEN it.itemName END ASC
LIMIT 5;

    `;

    const leastSoldProduct = `
  SELECT it.itemName as item_name,  
     COALESCE(SUM(sd.quantity), 0) AS TOTALQUANTITY, 
     COALESCE(SUM(sd.total_sum_price), 0) AS TOTALSALES 
FROM tblitems it
LEFT JOIN tblsales sd 
ON it.itemName COLLATE utf8mb4_unicode_ci = sd.item_name COLLATE utf8mb4_unicode_ci 
GROUP BY it.itemName 
ORDER BY 
     COALESCE(SUM(sd.quantity), 0) ASC,  
     CASE WHEN COALESCE(SUM(sd.quantity), 0) = 0 THEN it.itemName END ASC
LIMIT 5;

    `;

    // Execute all queries concurrently
    const results = await Promise.all([
      new Promise((resolve, reject) => {
        db.query(inventoryQuery, (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      }),
      new Promise((resolve, reject) => {
        db.query(rawMatsQuery, (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      }),
      new Promise((resolve, reject) => {
        db.query(supDeliQuery, (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      }),
      new Promise((resolve, reject) => {
        db.query(prodQuery, (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      }),
      new Promise((resolve, reject) => {
        db.query(prodMat, (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      }),
      new Promise((resolve, reject) => {
        db.query(mostSoldProduct, (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      }),

      new Promise((resolve, reject) => {
        db.query(leastSoldProduct, (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      }),
    ]);

    // Destructure the results into separate variables
    const [
      inventory,
      rawMaterials,
      supplierDeliveries,
      production,
      productionMaterials,
      mostSoldProducts,
      leastSoldProducts,
    ] = results;

    // Send all data as a single response
    res.json({
      inventory,
      rawMaterials,
      supplierDeliveries,
      production,
      productionMaterials,
      mostSoldProducts,
      leastSoldProducts,
    });
  } catch (error) {
    console.error("Error fetching dashboard data: ", error);
    res.status(500).send("Server Error");
  }
});
/////////////////////////////================= DASHBOARD

//////////////=========DOCUMENT============>

//getting the whole table from inventory
app.get("/api/item", (req, res) => {
  const sql = `
      SELECT it.* ,  COALESCE(SUM(p.actualQuantityProduced), 0) AS totalQuantity  FROM tblitems it LEFT JOIN tblproduction p ON it.itemId = p.itemId GROUP BY it.itemId ORDER BY totalQuantity ASC;
    `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching inventory items:", err);
      return res.status(500).send("Error fetching inventory items");
    }
    return res.json(results);
  });
});

app.get("/api/products", (req, res) => {
  const sql = `
        SELECT 
            p.*,
            i.itemId,
            i.itemName,
            i.price,
            i.quantity,
            i.category,
            i.description,
            COALESCE(SUM(p.actualQuantityProduced), 0) AS totalQuantity  -- Total quantity from tblproduction
        FROM 
            tblitems i
        LEFT JOIN 
            tblproduction p ON i.itemId = p.itemId  
        WHERE p.production_status = 1	
        GROUP BY 
          p.itemId;  
    `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching inventory items:", err);
      return res.status(500).send("Error fetching inventory items");
    }
    return res.json(results);
  });
});

//adding item in inventory
app.post("/api/addItem", (req, res) => {
  const { itemName, price, category, description, materials, threshold } =
    req.body;

  console.log(req.body);
  if (!itemName || !price || !category || !description || !threshold) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (!materials) {
    return res
      .status(400)
      .json({ message: "Materials must be a valid object." });
  }

  // Get a connection from the pool
  db.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting connection:", err);
      return res
        .status(500)
        .json({ message: "Error getting database connection" });
    }

    // Start the transaction
    connection.beginTransaction((transactionErr) => {
      if (transactionErr) {
        console.error("Transaction start error:", transactionErr);
        connection.release(); // Release the connection in case of error
        return res.status(500).json({ message: "Transaction error" });
      }

      // Insert into tblitems
      const insertItemQuery =
        "INSERT INTO tblitems (itemName, price, category, description , quantity , threshold_low) VALUES (?, ?, ?, ? , 0 , ?)";
      connection.query(
        insertItemQuery,
        [itemName, price, category, description, threshold],
        (err, result) => {
          if (err) {
            return connection.rollback(() => {
              console.error("Error inserting item:", err);
              connection.release(); // Release connection after rollback
              res.status(500).json({ message: "Error adding item" });
            });
          }

          const itemId = result.insertId;

          // If no materials, commit the transaction
          if (!materials || materials.length === 0) {
            return connection.commit((err) => {
              if (err) {
                return connection.rollback(() => {
                  console.error("Commit error:", err);
                  connection.release(); // Release connection after rollback
                  res.status(500).json({ message: "Error saving item" });
                });
              }
              connection.release(); // Release connection after commit
              res
                .status(201)
                .json({ message: "Item added successfully", itemId });
            });
          }

          // Insert materials into tblitem_ingredients
          const insertMaterialsQuery =
            "INSERT INTO tblitem_ingredients (itemId, matId) VALUES ?";
          const values = materials.map((matId) => [itemId, matId]);

          connection.query(insertMaterialsQuery, [values], (err) => {
            if (err) {
              return connection.rollback(() => {
                console.error("Error adding materials:", err);
                connection.release(); // Release connection after rollback
                res.status(500).json({ message: "Error adding materials" });
              });
            }

            // Commit the transaction
            connection.commit((err) => {
              if (err) {
                return connection.rollback(() => {
                  console.error("Commit error:", err);
                  connection.release(); // Release connection after rollback
                  res.status(500).json({ message: "Error saving item" });
                });
              }
              connection.release(); // Release connection after commit
              res.status(201).json({
                message: "Item and materials added successfully",
                itemId,
              });
            });
          });
        }
      );
    });
  });
});

//getting specific item in inventory
app.get("/api/updateitem/:id", (req, res) => {
  const sql = "SELECT * FROM tblitems WHERE itemId = ?";
  const id = req.params.id;
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error fetching inventory item:", err);
      return res.status(500).send("Error fetching inventory item");
    }
    if (result.length === 0) {
      return res.status(404).send("Item not found");
    }
    res.json(result[0]);
  });
});

//updating item in inventory
app.put("/api/updateitem/:id", (req, res) => {
  const { id } = req.params;
  const { itemName, price, category, description, materials, threshold } =
    req.body;

  // Get a connection from the pool to start a transaction
  db.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting DB connection:", err);
      return res
        .status(500)
        .json({ message: "Error getting database connection." });
    }

    // Start the transaction
    connection.beginTransaction((transactionErr) => {
      if (transactionErr) {
        connection.release();
        console.error("Transaction start error:", transactionErr);
        return res.status(500).json({ message: "Transaction error" });
      }

      // Step 1: Update item details
      const updateItemQuery = `
        UPDATE tblitems
        SET itemName = ?, price = ?, category = ?, description = ? , threshold_low = ?
        WHERE itemId = ?`;

      connection.query(
        updateItemQuery,
        [itemName, price, category, description, threshold, id],
        (err, result) => {
          if (err) {
            connection.rollback(() => {
              connection.release();
              console.error("Error updating item:", err);
              return res.status(500).json({ message: "Error updating item" });
            });
          }

          // Step 2: Delete old materials
          const deleteMaterialsQuery = `
          DELETE FROM tblitem_ingredients
          WHERE itemId = ?`;

          connection.query(deleteMaterialsQuery, [id], (err) => {
            if (err) {
              connection.rollback(() => {
                connection.release();
                console.error("Error deleting materials:", err);
                return res
                  .status(500)
                  .json({ message: "Error updating materials" });
              });
            }

            // Step 3: Insert new materials
            if (materials && materials.length > 0) {
              const insertMaterialsQuery = `
              INSERT INTO tblitem_ingredients (itemId, matId)
              VALUES ?`;

              const values = materials.map((matId) => [id, matId]);

              connection.query(insertMaterialsQuery, [values], (err) => {
                if (err) {
                  connection.rollback(() => {
                    connection.release();
                    console.error("Error inserting materials:", err);
                    return res
                      .status(500)
                      .json({ message: "Error updating materials" });
                  });
                }

                // Commit transaction
                connection.commit((commitErr) => {
                  if (commitErr) {
                    connection.rollback(() => {
                      connection.release();
                      console.error("Commit error:", commitErr);
                      return res
                        .status(500)
                        .json({ message: "Error saving data" });
                    });
                  }
                  connection.release();
                  res.status(200).json({
                    message: "Item and materials updated successfully",
                  });
                });
              });
            } else {
              // Commit if no materials are provided
              connection.commit((commitErr) => {
                if (commitErr) {
                  connection.rollback(() => {
                    connection.release();
                    console.error("Commit error:", commitErr);
                    return res
                      .status(500)
                      .json({ message: "Error saving data" });
                  });
                }
                connection.release();
                res.status(200).json({
                  message: "Item updated successfully with no materials",
                });
              });
            }
          });
        }
      );
    });
  });
});

app.get("/api/item/:id/materials", (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT rm.matId, rm.matName, rm.category
    FROM tblrawmats rm
    INNER JOIN tblitem_ingredients ii ON rm.matId = ii.matId
    WHERE ii.itemId = ?`;

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error("Error fetching materials:", err);
      return res.status(500).json({ message: "Error fetching materials" });
    }
    res.status(200).json(results);
  });
});

//deleting item in inventory
app.delete("/api/deleteitem/:id", (req, res) => {
  const { id } = req.params;

  // First, check if the item has any associated materials
  const checkMaterialsQuery = `
    SELECT COUNT(*) AS materialCount
    FROM tblitem_ingredients
    WHERE itemId = ?`;

  db.query(checkMaterialsQuery, [id], (err, results) => {
    if (err) {
      console.error("Error checking materials:", err);
      return res.status(500).send("Error checking materials for the item");
    }

    const { materialCount } = results[0];
    if (materialCount > 0) {
      // If materials are associated, prevent deletion
      return res
        .status(400)
        .send(
          "Cannot delete item: materials are associated with this product."
        );
    }

    // If no materials are associated, proceed to delete the item
    const deleteItemQuery = "DELETE FROM tblitems WHERE itemId = ?";

    db.query(deleteItemQuery, [id], (err, result) => {
      if (err) {
        console.error("Error deleting inventory item:", err);
        return res.status(500).send("Error deleting inventory item");
      }

      if (result.affectedRows === 0) {
        return res.status(404).send("Item not found");
      }

      res.send("Item deleted successfully");
    });
  });
});

// Get inventory details from tblInventory by itemId
app.get("/api/inventory/:itemId", (req, res) => {
  const itemId = req.params.itemId;
  const sql = "SELECT * FROM tblInventory WHERE itemId = ?";

  db.query(sql, [itemId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database error: " + err.message });
    }
    if (result.length === 0) {
      return res
        .status(404)
        .json({ error: "No inventory found for this item" });
    }
    res.json(result);
  });
});

// Get inventory details from tblInventory by itemId, joining with tblproduction
app.get("/api/inventory-by-items/:itemId", (req, res) => {
  const itemId = req.params.itemId;
  const sql = `
      SELECT 
            tblinventory.inventoryId,
            tblinventory.quantity,
            tblproduction.productionDate,
            tblinventory.lastUpdated
        FROM tblinventory
        JOIN tblproduction ON tblinventory.productionId = tblproduction.productionId
        WHERE tblproduction.itemId = ?
          AND tblinventory.quantity != 0
    `;

  db.query(sql, [itemId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database error: " + err.message });
    }
    if (result.length === 0) {
      return res
        .status(404)
        .json({ error: "No inventory found for this item" });
    }
    res.json(result);
  });
});

//get info
// app.get('/api/inventory-by-item/:itemId', (req, res) => {
//     const { itemId } = req.params;

//     const sqlQuery = `
//         SELECT
//             inv.inventoryId,
//             inv.productionId,
//             inv.quantity,
//             inv.status,
//             inv.lastUpdated,
//             p.itemId,
//             p.quantityProduced,
//             p.productionDate,
//             p.staffName,
//             i.itemName,
//             i.price,
//             i.category,
//             i.description
//         FROM
//             tblinventory inv
//         JOIN
//             tblproduction p ON inv.productionId = p.productionId
//         JOIN
//             tblitems i ON p.itemId = i.itemId
//         WHERE
//             p.itemId = ?;
//     `;

//     db.query(sqlQuery, [itemId], (err, results) => {
//         if (err) {
//             console.error(err);
//             return res.status(500).json({ error: 'Database query error' });
//         }
//         res.json(results);
//     });
// });

// Route to get raw materials inventory details by matId
app.get("/api/rawmatsinv/:matId", (req, res) => {
  const matId = req.params.matId;

  const query = `
          SELECT odi.orderItemId, raw.matName , raw.category , odi.orderId , odi.totalCost, odi.remaining_quantity , odi.quantity AS OrderedQuantity , odi.quantity_received as ReceivedQuantity ,od.orderDate as dateOrdered , odi.dateReceive as ReceivedDate FROM tblrawmats raw LEFT JOIN tblorderfromsupplier_items odi ON raw.matId = odi.matId LEFT JOIN tblordersfromsupplier od ON odi.orderId = od.orderId WHERE odi.matId = ? AND odi.status = 1;

    `;

  db.query(query, [matId], (error, results) => {
    if (error) {
      console.error("Error fetching raw materials details:", error);
      return res
        .status(500)
        .send("Server error while retrieving raw materials details.");
    }
    res.status(200).json(results);
  });
});

// Route to get all raw materials inventory details
app.get("/api/rawmatsinv", (req, res) => {
  // Query to fetch all raw materials inventory details
  const query = `
        SELECT 
            tblrawmatsinv.inventoryId,
            tblsupdeli.matId,
            tblrawmatsinv.quantity,
            tblsupdeli.date,
            tblrawmatsinv.lastUpdated
        FROM tblrawmatsinv
        JOIN tblsupdeli ON tblrawmatsinv.supDeliId = tblsupdeli.supDeliId
    `;

  db.query(query, (error, results) => {
    if (error) {
      console.error("Error fetching raw materials inventory:", error);
      return res
        .status(500)
        .send("Server error while retrieving raw materials inventory.");
    }
    res.status(200).json(results);
  });
});

app.get("/hello", (req, res) => {});

app.get("/api/rawmats", async (req, res) => {
  try {
    const query = `SELECT 
    odi.orderId,
  raw.matName, 
  raw.category, 
  raw.threshold_low,
  raw.matId, 
  COALESCE(SUM(odi.remaining_quantity), 0) AS total_remaining_quantity
FROM 
  tblrawmats raw
LEFT JOIN 
  tblorderfromsupplier_items odi ON raw.matId = odi.matId

GROUP BY 
  raw.matName, raw.category, raw.matId
  ORDER BY total_remaining_quantity ASC;`;
    db.query(query, (error, results) => {
      if (error) {
        console.error("Error fetching raw materials: ", error);
        res.status(500).send("Server Error");
      } else {
        res.json(results);
      }
    });
  } catch (error) {
    console.error("Error in fetching raw materials: ", error);
    res.status(500).send("Server Error");
  }
});

// Adding item to inventory
app.post("/api/addmats", (req, res) => {
  const { matName, category, threshold } = req.body; // Use matName to match the frontend
  const sql =
    "INSERT INTO tblrawmats (matName, quantity, category, threshold_low) VALUES (?, 0, ?,?)";
  db.query(sql, [matName, category, threshold], (err, result) => {
    if (err) {
      console.error("Error adding inventory item:", err);
      return res.status(500).send("Error adding inventory item");
    }
    res.status(201).send("Inventory item added successfully");
  });
});

// Fetch item by ID
app.get("/api/updatemats/:matId", (req, res) => {
  const { matId } = req.params;
  const sql = "SELECT * FROM tblrawmats WHERE matId = ?"; // Correct table name and field

  db.query(sql, [matId], (err, result) => {
    if (err) {
      console.error("Error fetching inventory item:", err);
      return res.status(500).send("Error fetching inventory item");
    }
    if (result.length === 0) {
      return res.status(404).send("Item not found");
    }
    res.json(result[0]);
  });
});

// Update item by ID
app.put("/api/updatemats/:matId", (req, res) => {
  const { matId } = req.params;
  const { matName, quantity, category, threshold } = req.body;

  const sql =
    "UPDATE tblrawmats SET matName = ?, quantity = ?, category = ? ,threshold_low = ? WHERE matId = ?";

  db.query(sql, [matName, 0, category, threshold, matId], (err, result) => {
    if (err) {
      console.error("Error updating raw material:", err);
      return res.status(500).json({ error: "Database error occurred" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Material not found" });
    }

    // Send success response to frontend
    res.json({ message: "Raw Material updated successfully" });
  });
});

//deleting item in inventory
app.delete("/api/deletemats/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM tblrawmats WHERE matId = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting inventory item:", err);
      return res.status(500).send("Error deleting inventory item");
    }
    if (result.affectedRows === 0) {
      return res.status(404).send("Item not found");
    }
    res.send("Item deleted successfully");
  });
});

app.get("/api/getsuppliersforproduct/:id", (req, res) => {
  const id = req.params.id;
  console.log(id);
  const sqlQuery = `
      SELECT sp.price , s.supplyId, s.supplyName FROM tblsuppliers s LEFT JOIN tblsupplierrawmats sp ON s.supplyId = sp.supplierId WHERE sp.rawMatId = ?;
    `;

  db.query(sqlQuery, [id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database query error" });
    }
    res.json(results);
  });
});

app.get("/api/rawmats-inventory", (req, res) => {
  const sqlQuery = `
        SELECT 
            inv.inventoryId,
            inv.matId,
            inv.quantity,
            inv.status,
            inv.lastUpdated
        FROM 
            tblrawmatsinv inv;
    `;

  db.query(sqlQuery, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database query error" });
    }
    res.json(results);
  });
});

//getting the details for raw mats details in system admin
app.get("/api/rawmats-data/:matId", (req, res) => {
  const { matId } = req.params; // Get the matId from the request parameters

  const query = `
        SELECT 
            r.matId AS rawMatId,
            r.matName AS itemName,
            i.quantity,
            d.cost,
            d.date,
            i.status,
            i.lastUpdated,
            (SELECT s.supplyName FROM tblsuppliers s WHERE d.supplyId = s.supplyId) AS supplierName
        FROM 
            tblrawmatsinv i
        JOIN 
            tblsupdeli d ON d.supDeliId = i.supDeliId  -- Join tblrawmatsinv with tblsupdeli using supDeliId
        JOIN 
            tblrawmats r ON r.matId = d.matId  -- Join tblsupdeli with tblrawmats using matId
        WHERE 
            r.matId = ?  -- Filter by the specific matId
    `;

  db.query(query, [matId], (err, results) => {
    // Pass matId as a parameter
    if (err) {
      console.error("Error fetching raw materials data:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(results);
  });
});

// Deleting the supply delivery
app.delete("/api/deleteSupDeli/:id", (req, res) => {
  const { id } = req.params;

  // Query to get the quantity and matId of the supply delivery to be deleted
  const getQuantitySql =
    "SELECT quantity, matId FROM tblsupdeli WHERE supDeliId = ?";
  db.query(getQuantitySql, [id], (err, results) => {
    if (err) {
      console.error("Error fetching supply delivery quantity:", err);
      return res.status(500).send("Error fetching supply delivery quantity");
    }

    // Check if the supply delivery exists
    if (results.length === 0) {
      return res.status(404).send("Supply delivery not found");
    }

    const { quantity, matId } = results[0];

    // Step 1: Deduct the quantity from tblrawmats
    const updateRawMatSql =
      "UPDATE tblrawmats SET quantity = quantity - ? WHERE matId = ?";
    db.query(updateRawMatSql, [quantity, matId], (err, result) => {
      if (err) {
        console.error("Error updating raw materials quantity:", err);
        return res.status(500).send("Error updating raw materials quantity");
      }

      // Step 2: Delete the corresponding row from tblrawmatsinv
      const deleteRawMatInvSql =
        "DELETE FROM tblrawmatsinv WHERE supDeliId = ?";
      db.query(deleteRawMatInvSql, [id], (err) => {
        if (err) {
          console.error("Error deleting raw materials inventory entry:", err);
          return res
            .status(500)
            .send("Error deleting raw materials inventory entry");
        }

        // Step 3: Delete the supply delivery
        const deleteSql = "DELETE FROM tblsupdeli WHERE supDeliId = ?";
        db.query(deleteSql, [id], (err, result) => {
          if (err) {
            console.error("Error deleting supply delivery:", err);
            return res.status(500).send("Error deleting supply delivery");
          }

          if (result.affectedRows === 0) {
            return res.status(404).send("Supply delivery not found");
          }

          // Successfully deleted the supply delivery, raw materials, and inventory entry
          res.send(
            "Supply delivery, raw materials, and inventory entry deleted successfully"
          );
        });
      });
    });
  });
});

//supplier
// Fetch all suppliers
app.get("/api/supplier", async (req, res) => {
  try {
    const query = `
            SELECT s.supplyId, s.supplyName,  s.contact, 
            GROUP_CONCAT(r.matName) AS products
            FROM tblsuppliers s
            LEFT JOIN tblsupplierrawmats sr ON s.supplyId = sr.supplierId
            LEFT JOIN tblrawmats r ON sr.rawMatId = r.matId
            GROUP BY s.supplyId;
        `;
    db.query(query, (error, results) => {
      if (error) {
        console.error("Error fetching supplier data: ", error);
        res.status(500).send("Server Error");
      } else {
        res.json(results);
      }
    });
  } catch (error) {
    console.error("Error in fetching suppliers: ", error);
    res.status(500).send("Server Error");
  }
});

//getting the details for Supplier details modal in system adminF
app.get("/api/supplier/:id", async (req, res) => {
  const supplyId = req.params.id; // Get the supplyId from the request parameters

  try {
    const [results] = await db.query(
      `
            SELECT s.supplyId, s.supplyName,  s.contact, 
                  GROUP_CONCAT(r.matName) AS products
            FROM tblsuppliers s
            LEFT JOIN tblsupplierrawmats sr ON s.supplyId = sr.supplierId
            LEFT JOIN tblrawmats r ON sr.rawMatId = r.matId
            WHERE s.supplyId = ?
            GROUP BY s.supplyId
        `,
      [supplyId]
    ); // Pass the supplyId as a parameter

    res.json(results);
  } catch (error) {
    console.error("Error fetching supplier details:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/api/addsupplier", async (req, res) => {
  const { supplyName, address, contact, products } = req.body; // Expect products to be an array of { productId, price }

  try {
    // Insert supplier first
    const supplierQuery = `INSERT INTO tblsuppliers (supplyName, address, contact) VALUES (?, ?, ?)`;
    const supplierValues = [supplyName, address, contact];

    db.query(supplierQuery, supplierValues, (error, results) => {
      if (error) {
        console.error("Error adding supplier: ", error);
        return res.status(500).send("Server Error");
      }

      const newSupplierId = results.insertId; // Get the newly inserted supplier ID

      // Check if products array exists and has data
      if (products && products.length > 0) {
        const supplierRawMatsQuery = `
          INSERT INTO tblsupplierrawmats (supplierId, rawMatId, price)
          VALUES ${products.map(() => "(?, ?, ?)").join(", ")}
        `;
        const supplierRawMatsValues = products.flatMap((p) => [
          newSupplierId,
          p.productId,
          p.price,
        ]);

        db.query(supplierRawMatsQuery, supplierRawMatsValues, (err) => {
          if (err) {
            console.error("Error adding raw materials: ", err);
            return res.status(500).send("Server Error");
          }
          res.send("Supplier and raw materials added successfully");
        });
      } else {
        res.send("Supplier added without raw materials");
      }
    });
  } catch (error) {
    console.error("Error in adding supplier: ", error);
    res.status(500).send("Server Error");
  }
});

app.get("/api/supplier/:supplierId/rawmats", (req, res) => {
  const supplierId = req.params.supplierId;

  const query = `
        SELECT rm.matId as rawMatId, rm.matName ,sr.price
        FROM tblsupplierrawmats sr
        JOIN tblrawmats rm ON sr.rawMatId = rm.matId
        WHERE sr.supplierId = ?
    `;

  db.query(query, [supplierId], (err, results) => {
    if (err) {
      console.error("Error fetching supplier raw materials:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json(results);
  });
});

// Update a supplier
app.put("/api/supplier/:id", async (req, res) => {
  const { supplyName, contact, product } = req.body;

  if (!supplyName || !contact) {
    return res.status(400).send("All fields are required");
  }

  const supplierId = req.params.id;

  try {
    const supplierQuery = `
      UPDATE tblsuppliers 
      SET supplyName = ?, contact = ? 
      WHERE supplyId = ?
    `;
    const supplierValues = [supplyName, contact, supplierId];

    db.query(supplierQuery, supplierValues, (error, results) => {
      if (error) {
        console.error("Error updating supplier: ", error);
        return res.status(500).send("Server Error");
      }

      if (results.affectedRows === 0) {
        return res.status(404).send("Supplier not found");
      }

      const deleteQuery = `DELETE FROM tblsupplierrawmats WHERE supplierId = ?`;
      db.query(deleteQuery, [supplierId], (err) => {
        if (err) {
          console.error("Error deleting raw materials: ", err);
          return res.status(500).send("Server Error");
        }

        if (product && product.length > 0) {
          const supplierRawMatsQuery = `
            INSERT INTO tblsupplierrawmats (supplierId, rawMatId, price) 
            VALUES ${product.map(() => "(?, ?, ?)").join(", ")}
          `;
          const supplierRawMatsValues = product.flatMap((p) => [
            supplierId,
            p.rawMatId,
            p.price,
          ]);

          db.query(supplierRawMatsQuery, supplierRawMatsValues, (err) => {
            if (err) {
              console.error("Error adding raw materials: ", err);
              return res.status(500).send("Server Error");
            }
            res.send("Supplier and raw materials updated successfully");
          });
        } else {
          res.send("Supplier updated without raw materials");
        }
      });
    });
  } catch (error) {
    console.error("Error in updating supplier: ", error);
    res.status(500).send("Server Error");
  }
});

// Endpoint to fetch orders with raw materials details
app.get("/api/orders/rawmats", (req, res) => {
  try {
    // Fetch order details
    const query = `
      SELECT 
        o.orderId,
        o.totalCost,
        s.supplyName AS suppName,
        o.orderDate,
        o.status
      FROM 
        tblordersfromsupplier o
      LEFT JOIN tblorderfromsupplier_items odi ON o.orderId = odi.orderId
            JOIN 
        tblsuppliers s ON odi.supplierId = s.supplyId
      GROUP BY odi.orderId
      ORDER BY 
        o.status , o.orderId  ASC;
    `;

    db.query(query, (error, orders) => {
      if (error) {
        console.error("Error fetching orders:", error);
        return res.status(500).send("Server Error");
      }

      if (orders.length === 0) {
        return res.status(404).send("No orders found");
      }

      // Fetch raw materials for each order
      const detailedQueries = orders.map((order) => {
        const rawMatsQuery = `
          SELECT 
            oi.*,
            r.matName,
            r.category,
            s.supplyName
          FROM 
            tblorderfromsupplier_items oi
          JOIN 
            tblrawmats r ON oi.matId = r.matId
            LEFT JOIN tblsuppliers s ON oi.supplierId = s.supplyId
          WHERE 
            oi.orderId = ${order.orderId}
          ORDER BY 
            r.category, r.matName;
        `;

        return new Promise((resolve, reject) => {
          db.query(rawMatsQuery, (error, rawMats) => {
            if (error) {
              reject(error);
            } else {
              resolve({
                orderId: order.orderId,
                rawMats,
              });
            }
          });
        });
      });

      // Resolve all promises to get raw materials for all orders
      Promise.all(detailedQueries)
        .then((allRawMatsDetails) => {
          const response = orders.map((order) => {
            const rawMatsDetails = allRawMatsDetails.find(
              (detail) => detail.orderId === order.orderId
            );
            return {
              ...order,
              rawMats: rawMatsDetails ? rawMatsDetails.rawMats : [],
            };
          });

          res.json(response);
        })
        .catch((error) => {
          console.error("Error fetching raw materials:", error);
          res.status(500).send("Error fetching raw materials");
        });
    });
  } catch (error) {
    console.error("Error in fetching orders:", error);
    res.status(500).send("Server Error");
  }
});

app.put("/api/updateItemAndOrderStatus", async (req, res) => {
  const { username, access, matName, orderItemId, receivedQuantity, orderId } =
    req.body;

  try {
    // 1. Verify that the orderId exists in the tblorders table
    const checkOrderExistsQuery = `
      SELECT COUNT(*) AS orderExists
      FROM tblordersfromsupplier
      WHERE orderId = ?
    `;

    db.query(checkOrderExistsQuery, [orderId], (error, checkResults) => {
      if (error) {
        console.error("Error checking order existence:", error);
        return res.status(500).json({
          success: false,
          message: "Failed to verify order existence",
        });
      }

      if (checkResults[0].orderExists === 0) {
        // If the orderId does not exist
        return res.status(400).json({
          success: false,
          message: "Order ID does not exist",
        });
      }

      // 2. Proceed with updating the item
      const updateItemQuery = `
        UPDATE tblorderfromsupplier_items 
        SET remaining_quantity = ?, 
            quantity_received = ?, 
            status = 1, 
            dateReceive = CURDATE()  -- Set today's date
        WHERE orderItemId = ?
      `;
      const updateItemValues = [
        receivedQuantity,
        receivedQuantity,
        orderItemId,
      ];

      db.query(updateItemQuery, updateItemValues, (error, itemResults) => {
        if (error) {
          console.error("Error updating item:", error);
          return res
            .status(500)
            .json({ success: false, message: "Failed to update item" });
        }

        // 3. Check if all items in the order are received
        const checkOrderQuery = `
          SELECT COUNT(*) AS pendingItems 
          FROM tblorderfromsupplier_items 
          WHERE orderId = ? AND quantity_received IS NULL;
        `;

        db.query(checkOrderQuery, [orderId], (error, checkResults) => {
          if (error) {
            console.error("Error checking order status:", error);
            return res
              .status(500)
              .json({ success: false, message: "Error checking order status" });
          }

          const allItemsReceived = checkResults[0].pendingItems === 0;

          if (allItemsReceived) {
            const updateOrderQuery = `
              UPDATE tblordersfromsupplier 
              SET status = 1 
              WHERE orderId = ?
            `;
            db.query(updateOrderQuery, [orderId], (error, orderResults) => {
              if (error) {
                console.error("Error updating order status:", error);
                return res.status(500).json({
                  success: false,
                  message: "Failed to update order status",
                });
              }

              // Successfully updated order status, create notification
              const notificationDescription = `Order ID ${orderId} has been fully received by ${username}.`;
              const notificationStatus = 0; // Set notifStatus to 0
              const insertNotificationQuery = `
                INSERT INTO tblnotifications (description, status, account_notif)
                VALUES (?, ?, ?)
              `;
              db.query(
                insertNotificationQuery,
                [notificationDescription, notificationStatus, access],
                (err) => {
                  if (err) {
                    return res.status(500).json({
                      success: false,
                      message: "Failed to insert notification",
                      error: err,
                    });
                  }

                  // Successfully committed the transaction
                  return res.json({
                    success: true,
                    allItemsReceived: true,
                    message: "Item and order updated successfully!",
                  });
                }
              );
            });
          } else {
            // Successfully updated item, but not the order
            const notificationDescription = `${matName} in Order ID ${orderId} received by ${username}.`;
            const notificationStatus = 0; // Set notifStatus to 0
            const insertNotificationQuery = `
              INSERT INTO tblnotifications (description, status, account_notif)
              VALUES (?, ?, ?)
            `;
            db.query(
              insertNotificationQuery,
              [notificationDescription, notificationStatus, access],
              (err) => {
                if (err) {
                  return res.status(500).json({
                    success: false,
                    message: "Failed to insert notification",
                    error: err,
                  });
                }

                return res.json({
                  success: true,
                  allItemsReceived: false,
                  message:
                    "Item updated successfully, but order is not complete yet.",
                });
              }
            );
          }
        });
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to update item and order status.",
    });
  }
});

// app.put("/api/updateItemAndOrderStatus", async (req, res) => {
//   const { username,access, orderItemId, receivedQuantity, orderId } = req.body;

//   try {
//     // 1. Verify that the orderId exists in the tblorders table
//     const checkOrderExistsQuery = `
//       SELECT COUNT(*) AS orderExists
//       FROM tblordersfromsupplier
//       WHERE orderId = ?
//     `;

//     db.query(checkOrderExistsQuery, [orderId], (error, checkResults) => {
//       if (error) {
//         console.error("Error checking order existence:", error);
//         return res.status(500).json({
//           success: false,
//           message: "Failed to verify order existence",
//         });
//       }

//       if (checkResults[0].orderExists === 0) {
//         // If the orderId does not exist
//         return res.status(400).json({
//           success: false,
//           message: "Order ID does not exist",
//         });
//       }

//       // 2. Proceed with updating the item
//       const updateItemQuery = `
//         UPDATE tblorderfromsupplier_items
//         SET remaining_quantity = ?,
//             quantity_received = ?,
//             status = 1,
//             dateReceive = CURDATE()  -- Set today's date
//         WHERE orderItemId = ?
//       `;
//       const updateItemValues = [
//         receivedQuantity,
//         receivedQuantity,
//         orderItemId,
//       ];

//       db.query(updateItemQuery, updateItemValues, (error, itemResults) => {
//         if (error) {
//           console.error("Error updating item:", error);
//           return res
//             .status(500)
//             .json({ success: false, message: "Failed to update item" });
//         }

//         // 3. Check if all items in the order are received
//         const checkOrderQuery = `
// SELECT COUNT(*) AS pendingItems
// FROM tblorderfromsupplier_items
// WHERE orderId = ? AND quantity_received IS NULL;

//     `;

//         db.query(checkOrderQuery, [orderId], (error, checkResults) => {
//           if (error) {
//             console.error("Error checking order status:", error);
//             return res
//               .status(500)
//               .json({ success: false, message: "Error checking order status" });
//           }

//           const allItemsReceived = checkResults[0].pendingItems === 0;

//           if (allItemsReceived) {
//             const updateOrderQuery = `
//               UPDATE tblordersfromsupplier
//               SET status = 1
//               WHERE orderId = ?
//             `;
//             db.query(updateOrderQuery, [orderId], (error, orderResults) => {
//               if (error) {
//                 console.error("Error updating order status:", error);
//                 return res.status(500).json({
//                   success: false,
//                   message: "Failed to update order status",
//                 });
//               }

//               // Successfully updated order status
//               return res.json({
//                 success: true,
//                 allItemsReceived: true,
//                 message: "Item and order updated successfully!",
//               });
//             });
//           } else {
//             // Successfully updated item, but not the order
//             return res.json({
//               success: true,
//               allItemsReceived: false,
//               message:
//                 "Item updated successfully, but order is not complete yet.",
//             });
//           }
//         });
//       });
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({
//       success: false,
//       message: "Failed to update item and order status.",
//     });
//   }
// });

//supply delivery
app.get("/api/supDeli", async (req, res) => {
  try {
    // Adjust the query to match your table structure and required fields
    const query = `
      SELECT  
        od.orderId,
        sp.supplyId,
        sp.supplyName,
        od.status,
        od.totalCost AS totalCost,
        MAX(od.orderDate) AS orderDate,  -- Use MAX to get the latest orderDate for each supplier
        SUM(odi.quantity) AS totalQuantity
      FROM tblsuppliers sp
      LEFT JOIN tblordersfromsupplier od ON sp.supplyId = od.supplyId
      LEFT JOIN tblorderfromsupplier_items odi ON od.orderId = odi.orderId
      WHERE odi.quantity IS NOT NULL
      GROUP BY od.orderId, sp.supplyName, od.status, od.totalCost, sp.supplyId
      ORDER BY od.orderId DESC; 
    `;

    db.query(query, (error, results) => {
      if (error) {
        console.error("Error fetching supply deliveries: ", error);
        return res.status(500).send("Server Error");
      }

      // Ensure results have data
      if (results.length > 0) {
        // Create detailed queries for each supplier and order
        const detailedQueries = results.map((supplier) => {
          const productQuery = `
            SELECT 
              sp.supplyName,
              od.totalCost,
              od.orderDate,
              odi.orderId,
              odi.orderItemId,
              odi.status as itemStatus,
              odi.price,
              odi.totalCost AS itemTotal,
              odi.quantity,
              odi.quantity_received,
              odi.remaining_quantity,
              mat.matName,
              mat.matId
            FROM tblsuppliers sp
            LEFT JOIN tblordersfromsupplier od ON sp.supplyId = od.supplyId
            LEFT JOIN tblorderfromsupplier_items odi ON od.orderId = odi.orderId
            LEFT JOIN tblrawmats mat ON mat.matId = odi.matId
            WHERE odi.orderId = ${supplier.orderId}  
              AND sp.supplyId = ${supplier.supplyId}  
              AND odi.quantity IS NOT NULL
              AND mat.matId IS NOT NULL;
          `;

          return new Promise((resolve, reject) => {
            db.query(productQuery, (error, productResults) => {
              if (error) {
                reject(error);
              } else {
                resolve({
                  supplyId: supplier.supplyId,
                  orderId: supplier.orderId, // Ensure we match the correct orderId
                  productDetails: productResults,
                });
              }
            });
          });
        });

        // Resolve all the promises to get all product details
        Promise.all(detailedQueries)
          .then((allProductDetails) => {
            // Combine results with their respective product details
            const response = results.map((supplier) => {
              const productDetails = allProductDetails.find(
                (detail) =>
                  detail.supplyId === supplier.supplyId &&
                  detail.orderId === supplier.orderId
              );
              return {
                ...supplier,
                productDetails: productDetails
                  ? productDetails.productDetails
                  : [], // If no product details, return an empty array
              };
            });

            return res.json(response);
          })
          .catch((error) => {
            console.error("Error fetching product details: ", error);
            return res.status(500).send("Error fetching product details");
          });
      } else {
        res.status(404).send("No deliveries found for the supplier.");
      }
    });
  } catch (error) {
    console.error("Error in fetching supply deliveries: ", error);
    res.status(500).send("Server Error");
  }
});

// Fetch supplier including product array
app.get("/api/supplier/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const query = "SELECT * FROM tblsuppliers WHERE supplyId = ?";
    db.query(query, [id], (err, results) => {
      if (err) {
        console.error("Error fetching supplier:", err);
        return res.status(500).send("Error fetching supplier");
      }
      if (results.length > 0) {
        const supplier = results[0];
        supplier.product = JSON.parse(supplier.product); // Convert JSON string back to array
        res.json(supplier);
      } else {
        res.status(404).send("Supplier not found");
      }
    });
  } catch (error) {
    console.error("Error in fetching supplier:", error);
    res.status(500).send("Error fetching supplier");
  }
});

// Update a supplier
app.put("/api/supplier/:supplyId", (req, res) => {
  // Use 'supplyId' here
  const { supplyId } = req.params; // Use 'supplyId' here
  const { supplyName, contact, address, product } = req.body;
  const sql =
    "UPDATE tblsuppliers SET supplyName = ?, contact = ?, address = ?, product = ? WHERE supplyId = ?";

  db.query(
    sql,
    [supplyName, contact, address, product, supplyId],
    (err, result) => {
      if (err) {
        console.error("Error updating supplier:", err);
        return res.status(500).send("Error updating supplier");
      }
      if (result.affectedRows === 0) {
        return res.status(404).send("Supplier not found");
      }
      res.send("Supplier updated successfully");
    }
  );
});

app.delete("/api/deletesupplier/:id", (req, res) => {
  const supplierId = req.params.id;

  const deleteRawMatsInvQuery = `
    DELETE FROM tblorderfromsupplier_items WHERE orderId IN (SELECT orderId FROM tblordersfromsupplier WHERE supplyId = ?)
  `;
  db.query(deleteRawMatsInvQuery, [supplierId], (err) => {
    if (err) {
      console.error("Error deleting raw materials inventory records:", err);
      return res
        .status(500)
        .send("Error deleting raw materials inventory records");
    }

    // Next, delete records in tblsupdeli that reference the supplierId
    const deleteSupDeliQuery = `
      DELETE FROM tblsupdeli WHERE supplyId = ?
    `;
    db.query(deleteSupDeliQuery, [supplierId], (err) => {
      if (err) {
        console.error("Error deleting supplier delivery records:", err);
        return res.status(500).send("Error deleting supplier delivery records");
      }

      // Then, delete raw materials associated with the supplier
      const deleteRawMaterialsQuery = `
        DELETE FROM tblsupplierrawmats WHERE supplierId = ?
      `;
      db.query(deleteRawMaterialsQuery, [supplierId], (err) => {
        if (err) {
          console.error("Error deleting raw materials:", err);
          return res.status(500).send("Error deleting raw materials");
        }

        // Finally, delete the supplier itself
        const deleteSupplierQuery = `
          DELETE FROM tblsuppliers WHERE supplyId = ?
        `;
        db.query(deleteSupplierQuery, [supplierId], (err, result) => {
          if (err) {
            console.error("Error deleting supplier:", err);
            return res.status(500).send("Error deleting supplier");
          }

          // Check if any rows were affected (supplier exists)
          if (result.affectedRows === 0) {
            return res.status(404).send("Supplier not found");
          }

          res.json({
            message: "Supplier and associated records deleted successfully",
          });
        });
      });
    });
  });
});

app.get("/api/supDeli/:supplierId", async (req, res) => {
  const { supplierId } = req.params;

  try {
    const query = `
      SELECT 
        sr.rawMatId,
        rm.matName,
        sr.price
      FROM 
        tblsupplierrawmats sr
      JOIN 
        tblrawmats rm ON sr.rawMatId = rm.matId
      WHERE 
        sr.supplierId = ?
      ORDER BY 
        rm.matName ASC`; // Order alphabetically by material name for better readability

    db.query(query, [supplierId], (error, results) => {
      if (error) {
        console.error("Error fetching supplier products: ", error);
        return res.status(500).send("Server Error");
      }
      res.json(results);
    });
  } catch (error) {
    console.error("Error in fetching supplier products: ", error);
    res.status(500).send("Server Error");
  }
});

//getting the details for Supplier Details Modal for system admin
app.get("/api/supDeli/:id", async (req, res) => {
  const supplyId = req.params.id;

  try {
    const query = `
            SELECT 
                sd.supDeliId, 
                sd.supplyId, 
                rm.matName, 
                sd.quantity, 
                sd.cost, app.post("/api/addLogs", (req, res) => {
  const { logName, logDescription, logDate } = req.body;
  const sql = "INSERT INTO tbllogs (logName, logDescription, logDate) VALUES (?, ?, ?)";
  db.query(sql, [logName, logDescription, logDate], (err, result) => {
    if (err) {
      console.error("Error adding log:", err);
      return res.status(500).send("Error adding log");
    }
    res.status(201).send("Log added successfully");
  });
});

app.get("/api/logs", (req, res) => {
  const sql = "SELECT * FROM tbllogs";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching logs:", err);
      return res.status(500).send("Error fetching logs");
    }
    res.json(results);
  });
});

app.get("/api/logs/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM tbllogs WHERE logId = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error fetching log:", err);
      return res.status(500).send("Error fetching log");
    }
    if (result.length === 0) {
      return res.status(404).send("Log not found");
    }
    res.json(result[0]);
  });
});

app.put("/api/logs/:id", (req, res) => {
  const id = req.params.id;
  const { logName, logDescription, logDate } = req.body;
  const sql = "UPDATE tbllogs SET logName = ?, logDescription = ?, logDate = ? WHERE logId = ?";
  db.query(sql, [logName, logDescription, logDate, id], (err, result) => {
    if (err) {
      console.error("Error updating log:", err);
      return res.status(500).send("Error updating log");
    }
    if (result.affectedRows === 0) {
      return res.status(404).send("Log not found");
    }
    res.send("Log updated successfully");
  });
});

app.delete("/api/logs/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM tbllogs WHERE logId = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting log:", err);
      return res.status(500).send("Error deleting log");
    }
    if (result.affectedRows === 0) {
      return res.status(404ate 
            FROM 
                tblSupDeli sd 
            JOIN 
                tblrawmats rm ON sd.matId = rm.matId
            WHERE 
                sd.supplyId = ?
            ORDER BY 
                sd.date DESC;
            `; // Add the WHERE clause to filter by supplyId
    // Pass the supplyId as a parameter to the query
    db.query(query, [supplyId], (error, results) => {
      if (error) {
        console.error("Error fetching supply deliveries: ", error);
        res.status(500).send("Server Error");
      }

      return res.json(results);
    });
  } catch (error) {
    console.error("Error in fetching supply deliveries: ", error);
    res.status(500).send("Server Error");
  }
});

// getting products of the suppliers
app.get("/api/supplier/:supplyId/products", (req, res) => {
  const supplyId = req.params.supplyId;

  const query = "SELECT product FROM tblsuppliers WHERE supplyId = ?";
  db.query(query, [supplyId], (error, results) => {
    if (error) {
      console.error("Error fetching supplier products: ", error);
      res.status(500).send("Server Error");
    } else if (results.length > 0) {
      try {
        // Parse the JSON product array
        const products = JSON.parse(results[0].product);
        res.json(products);
      } catch (parseError) {
        console.error("Error parsing product JSON: ", parseError);
        res.status(500).send("Server Error");
      }
    } else {
      res.json([]); // Return empty array if no products are found
    }
  });
});

// Get products for a specific supplier
app.get("/api/suppliers/:supplyId/products", async (req, res) => {
  const supplyId = req.params.supplyId;
  try {
    const query = "SELECT product FROM tblsuppliers WHERE supplyId = ?";
    db.query(query, [supplyId], (error, results) => {
      if (error) {
        console.error("Error fetching products: ", error);
        res.status(500).send("Server Error");
      } else if (results.length === 0) {
        res.status(404).send("Supplier not found");
      } else {
        // Assuming products are stored as a JSON string in the product field
        const products = JSON.parse(results[0].product);
        res.json(products);
      }
    });
  } catch (error) {
    console.error("Error in fetching products: ", error);
    res.status(500).send("Server Error");
  }
});

// Fetch all suppliers
app.get("/api/suppliers", async (req, res) => {
  try {
    const query = "SELECT * FROM tblsuppliers";
    db.query(query, (error, results) => {
      if (error) {
        console.error("Error fetching suppliers: ", error);
        res.status(500).send("Server Error");
      } else {
        // Parse the product field as JSON and handle invalid JSON or null values
        const suppliers = results.map((supplier) => ({
          ...supplier,
          product: supplier.product ? JSON.parse(supplier.product) : [], // Use an empty array if product is null
        }));
        return res.json(suppliers);
      }
    });
  } catch (error) {
    console.error("Error in fetching suppliers: ", error);
    res.status(500).send("Server Error");
  }
});

// Express.js route to get raw materials for a specific supplier
app.get("/api/getrawmaterials/:supplierId", (req, res) => {
  const supplierId = req.params.supplierId;

  // Query to fetch raw material names based on the supplierId
  const query = `
        SELECT r.matName , r.matId , s.price
        FROM tblsupplierrawmats s
        JOIN tblrawmats r ON s.rawMatId = r.matId
        WHERE s.supplierId = ?`;

  db.query(query, [supplierId], (error, results) => {
    if (error) {
      console.error("Error fetching raw materials:", error);
      return res.status(500).send("Error fetching raw materials");
    }

    res.json(results); // Send back the list of raw material names
  });
});

// Add supply delivery
app.post("/api/addsupplydelivery", (req, res) => {
  const { supplyId, matId, quantity, cost, date } = req.body;

  if (!supplyId || !matId || !quantity || !cost || !date) {
    console.error("Missing fields in the request body");
    return res.status(400).send("Bad Request: Missing required fields");
  }

  // Query to insert the new supply delivery into tblSupDeli
  const insertQuery = `
        INSERT INTO tblSupDeli (supplyId, matId, quantity, cost, date) 
        VALUES (?, ?, ?, ?, ?)
    `;
  const insertValues = [supplyId, matId, quantity, cost, date];

  db.query(insertQuery, insertValues, (error, results) => {
    if (error) {
      console.error("Error executing SQL insert query:", error);
      return res.status(500).send("Server Error");
    } else {
      const supDeliId = results.insertId; // Get the newly inserted supDeliId

      // Update the quantity in tblrawmats
      const updateQuery = `
                UPDATE tblrawmats 
                SET quantity = quantity + ? 
                WHERE matid = ?
            `;
      const updateValues = [quantity, matId];

      db.query(updateQuery, updateValues, (updateError, updateResults) => {
        if (updateError) {
          console.error("Error updating quantity in tblrawmats:", updateError);
          return res
            .status(500)
            .send("Server Error: Failed to update raw materials quantity.");
        } else {
          // Insert into tblrawmatsinv using the new supDeliId
          const insertRawMatsInvQuery = `
                        INSERT INTO tblrawmatsinv (supDeliId, quantity, lastUpdated) 
                        VALUES (?, ?, NOW()) 
                    `;
          const insertRawMatsInvValues = [supDeliId, quantity];

          db.query(
            insertRawMatsInvQuery,
            insertRawMatsInvValues,
            (invError, invResults) => {
              if (invError) {
                console.error("Error inserting into tblrawmatsinv:", invError);
                return res
                  .status(500)
                  .send("Server Error: Failed to insert into tblrawmatsinv.");
              } else {
                res
                  .status(200)
                  .send(
                    "Supply delivery added, raw materials quantity updated, and inventory record inserted into tblrawmatsinv."
                  );
              }
            }
          );
        }
      });
    }
  });
});

// app.post("/api/placeOrderDelivery", (req, res) => {
//   const { supplyId, products, totalCost } = req.body;

//   // Check if products are provided
//   if (!products || products.length === 0) {
//     return res.status(400).json({ message: "No products in the order" });
//   }

//   const orderDate = new Date().toISOString().split("T")[0]; // Current date in 'YYYY-MM-DD' format

//   // Loop through each product in the order and insert it into tblsupdeli
//   const query =
//     "INSERT INTO tblsupdeli (supplyId, matId, quantity, cost, date) VALUES ?";
//   const values = products.map((product) => [
//     supplyId,
//     product.productId, // Material ID (matId)
//     product.quantity, // Quantity of the product
//     product.total, // Total cost for the product (quantity * price)
//     orderDate,
//   ]);

//   db.query(query, [values], (err, result) => {
//     if (err) {
//       console.error("Error inserting order:", err);
//       return res.status(500).json({ message: "Failed to place order" });
//     }

//     return res.status(200).json({
//       message: "Order placed successfully",
//       orderId: result.insertId,
//       totalCost: totalCost,
//     });
//   });
// });

// app.post("/api/placeOrderDelivery", (req, res) => {
//   const { supplyId, products, totalCost } = req.body;

//   if (!products || products.length === 0) {
//     return res.status(400).json({ message: "No products in the order" });
//   }

//   const orderDate = new Date().toISOString().split("T")[0]; // Current date in 'YYYY-MM-DD' format

//   // Start transaction to insert order and order items
//   db.beginTransaction((err) => {
//     if (err) {
//       return res.status(500).json({ message: "Failed to start transaction" });
//     }

//     // Insert order into tblorders
//     const insertOrderQuery =
//       "INSERT INTO tblordersfromsupplier (supplyId, totalCost, orderDate , status) VALUES (?, ?, ? , ?)";
//     db.query(
//       insertOrderQuery,
//       [supplyId, totalCost, orderDate, 0],
//       (err, result) => {
//         if (err) {
//           return db.rollback(() => {
//             res
//               .status(500)
//               .json({ message: "Failed to place order", Error: err });
//           });
//         }

//         const orderId = result.insertId;

//         // Insert order items into tblorderfromsupplier_items
//         const insertItemsQuery =
//           "INSERT INTO tblorderfromsupplier_items (orderId, matId, quantity, price, totalCost , status) VALUES ?";
//         const values = products.map((product) => [
//           orderId, // Order ID from tblorders
//           product.productId, // Material ID (matId)
//           product.quantity, // Quantity ordered
//           product.price, // Price per unit
//           product.total, // Total cost for this item
//           0,
//         ]);

//         db.query(insertItemsQuery, [values], (err, result) => {
//           if (err) {
//             console.log(err);
//             return db.rollback(() => {
//               res
//                 .status(500)
//                 .json({ message: "Failed to add items to the order" });
//             });
//           }

//           db.commit((err) => {
//             if (err) {
//               return db.rollback(() => {
//                 res
//                   .status(500)
//                   .json({ message: "Failed to commit transaction" });
//               });
//             }

//             // Successfully committed the transaction
//             res.status(200).json({
//               message: "Order placed successfully",
//               orderId,
//               totalCost,
//             });
//           });
//         });
//       }
//     );
//   });
// });

app.post("/api/placeOrderDelivery", (req, res) => {
  const { username, access, products, totalCost } = req.body;

  if (!products || products.length === 0) {
    return res.status(400).json({ message: "No products in the order" });
  }

  const orderDate = new Date().toISOString().split("T")[0]; // Current date in 'YYYY-MM-DD' format

  // Get a connection from the pool
  db.getConnection((err, connection) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Failed to get a database connection", error: err });
    }

    // Start transaction
    connection.beginTransaction((err) => {
      if (err) {
        connection.release();
        return res
          .status(500)
          .json({ message: "Failed to start transaction", error: err });
      }

      // Insert order into tblorders
      const insertOrderQuery =
        "INSERT INTO tblordersfromsupplier (totalCost, orderDate, status) VALUES (?, ?, ?)";
      connection.query(
        insertOrderQuery,
        [totalCost, orderDate, 0],
        (err, result) => {
          if (err) {
            // Rollback and send response if error occurs
            connection.rollback(() => {
              connection.release();
              if (!res.headersSent) {
                return res
                  .status(500)
                  .json({ message: "Failed to place order", error: err });
              }
            });
            return; // Prevent further code execution
          }

          const orderId = result.insertId; // Get the orderId of the inserted order

          // Insert order items into tblorderfromsupplier_items
          const insertItemsQuery =
            "INSERT INTO tblorderfromsupplier_items (orderId, matId, quantity, price, totalCost, supplierId, status) VALUES ?";

          const values = products.map((product) => [
            orderId, // Order ID from tblorders
            product.productId, // Material ID (matId)
            product.quantity, // Quantity ordered
            product.price, // Price per unit
            product.total, // Total cost for this item
            product.supplierId, // Supplier ID for the product
            0, // Initial status (e.g., 0 for pending)
          ]);

          connection.query(insertItemsQuery, [values], (err, result) => {
            if (err) {
              connection.rollback(() => {
                connection.release();

                if (!res.headersSent) {
                  return res
                    .status(500)
                    .json({ message: "Failed to add items to the order" });
                }
              });
              return; // Prevent further code execution
            }

            // Create the notification description for multiple suppliers and products
            const notificationParts = products.map((product) => {
              return `${product.productName} from ${product.supplierName}`;
            });

            const notificationDescription = `Order for ${notificationParts.join(
              ", "
            )} has been successfully purchased by ${username}.`;

            const notificationStatus = 0; // Assuming status 1 means active or visible notification

            // Insert notification into tblnotifications
            const insertNotificationQuery =
              "INSERT INTO tblnotifications (description, status, account_notif) VALUES (?, ?, ?)";
            connection.query(
              insertNotificationQuery,
              [notificationDescription, notificationStatus, access],
              (err, result) => {
                if (err) {
                  connection.rollback(() => {
                    connection.release();
                    if (!res.headersSent) {
                      return res.status(500).json({
                        message: "Failed to insert notification",
                        error: err,
                      });
                    }
                  });
                  return; // Prevent further code execution
                }

                // Commit the transaction
                connection.commit((err) => {
                  if (err) {
                    // Rollback and send response if commit fails
                    connection.rollback(() => {
                      connection.release();
                      if (!res.headersSent) {
                        return res
                          .status(500)
                          .json({ message: "Failed to commit transaction" });
                      }
                    });
                    return; // Prevent further code execution
                  }

                  // Successfully committed the transaction
                  connection.release(); // Release the connection back to the pool
                  if (!res.headersSent) {
                    return res.status(200).json({
                      message: "Order placed successfully",
                      orderId,
                      totalCost,
                    });
                  }
                });
              }
            );
          });
        }
      );
    });
  });
});

app.post("/api/updateOrderDelivery", (req, res) => {
  const { username, access, supplyId, products, totalCost, orderId } = req.body;

  // Step 1: Check if products array is empty, and if so, delete the order
  if (!products || products.length === 0) {
    const deleteOrderQuery = `
      DELETE FROM tblordersfromsupplier 
      WHERE orderId = ?
    `;
    db.query(deleteOrderQuery, [orderId], (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Failed to delete order", error: err });
      }

      // Create a notification for deleted order
      const deleteNotificationDescription = `Order ID ${orderId} has been deleted by ${username}.`;
      const deleteNotificationStatus = 0; // Assuming status 1 means active
      const insertDeleteNotificationQuery = `
        INSERT INTO tblnotifications (description, status, account_notif)
        VALUES (?, ?, ?)
      `;
      db.query(
        insertDeleteNotificationQuery,
        [deleteNotificationDescription, deleteNotificationStatus, access],
        (err) => {
          if (err) {
            return res.status(500).json({
              message: "Failed to insert notification",
              error: err,
            });
          }

          res.status(200).json({ message: "Order deleted successfully" });
        }
      );
    });
    return; // Exit early if the order is deleted due to no products
  }

  console.log(orderId);
  const checkOrderExistsQuery = `
    SELECT odi.supplierId FROM tblorderfromsupplier_items odi LEFT JOIN tblordersfromsupplier od ON odi.orderId = od.orderId
    WHERE od.orderId = ?
  `;
  db.query(checkOrderExistsQuery, [orderId], (err, results) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .json({ message: "Failed to check if order exists", error: err });
    }

    if (results.length === 0) {
      return res
        .status(400)
        .json({ message: "Order ID does not exist in tblordersfromsupplier" });
    }

    const existingSupplyId = results[0].supplyId;

    // Step 3: Validate products availability in tblorderfromsupplier_items for the given supplyId
    const checkAvailabilityQuery = `
      SELECT oi.matId, oi.quantity, oi.totalCost
      FROM tblorderfromsupplier_items oi
      JOIN tblrawmats rm ON oi.matId = rm.matId
      WHERE oi.orderId = ? 
    `;
    db.query(checkAvailabilityQuery, [orderId], (err, availableProducts) => {
      if (err) {
        return res.status(500).json({
          message: "Failed to check product availability",
          error: err,
        });
      }

      // If no products are available, update status to 2
      if (availableProducts.length === 0) {
        const updateStatusQuery = `
          UPDATE tblordersfromsupplier 
          SET status = 2 
          WHERE orderId = ?
        `;
        db.query(updateStatusQuery, [orderId], (err) => {
          if (err) {
            return res
              .status(500)
              .json({ message: "Failed to update order status", error: err });
          }
        });
      }

      // Step 4: Get a connection from the pool to start a transaction
      db.getConnection((err, connection) => {
        if (err) {
          return res.status(500).json({
            message: "Failed to get a database connection",
            error: err,
          });
        }

        // Start transaction
        connection.beginTransaction((err) => {
          if (err) {
            connection.release();
            return res
              .status(500)
              .json({ message: "Failed to start transaction", error: err });
          }

          // Step 5: Update the total cost in tblordersfromsupplier
          const updateOrderQuery = `
            UPDATE tblordersfromsupplier 
            SET totalCost = ? 
            WHERE orderId = ?
          `;
          connection.query(
            updateOrderQuery,
            [totalCost, orderId],
            (err, result) => {
              if (err) {
                return connection.rollback(() => {
                  connection.release();
                  res.status(500).json({
                    message: "Failed to update order total cost",
                    error: err,
                  });
                });
              }

              const removeProductsQuery = `
              DELETE FROM tblorderfromsupplier_items 
              WHERE orderId = ?
            `;
              connection.query(removeProductsQuery, [orderId], (err) => {
                if (err) {
                  return connection.rollback(() => {
                    connection.release();
                    res.status(500).json({
                      message: "Failed to remove old products",
                      error: err,
                    });
                  });
                }

                // Step 7: Insert new products into tblorderfromsupplier_items
                const insertItemsQuery = `
                INSERT INTO tblorderfromsupplier_items (orderId, matId, quantity, price, totalCost, supplierId, status )
                VALUES ?
              `;
                const values = products.map((product) => [
                  orderId, // Order ID from tblordersfromsupplier
                  product.productId, // Material ID (matId)
                  product.quantity, // Quantity ordered
                  product.price, // Price per unit
                  product.total, // Total cost for this item
                  product.supplierId,
                  0,
                ]);

                connection.query(insertItemsQuery, [values], (err, result) => {
                  if (err) {
                    return connection.rollback(() => {
                      connection.release();
                      res.status(500).json({
                        message: "Failed to add new items to the order",
                        error: err,
                      });
                    });
                  }

                  // Create the notification description for updated order
                  const notificationParts = products.map((product) => {
                    return `${product.productName} from ${product.supplierName}`;
                  });

                  const notificationDescription = `Order ID ${orderId} has been updated with ${notificationParts.join(
                    ", "
                  )} by ${username}.`;

                  const notificationStatus = 0; // Assuming status 1 means active
                  const insertUpdateNotificationQuery = `
                    INSERT INTO tblnotifications (description, status, account_notif)
                    VALUES (?, ?, ?)
                  `;
                  connection.query(
                    insertUpdateNotificationQuery,
                    [notificationDescription, notificationStatus, access],
                    (err) => {
                      if (err) {
                        return connection.rollback(() => {
                          connection.release();
                          res.status(500).json({
                            message: "Failed to insert notification",
                            error: err,
                          });
                        });
                      }

                      // Step 8: Commit the transaction
                      connection.commit((err) => {
                        if (err) {
                          return connection.rollback(() => {
                            connection.release();
                            res.status(500).json({
                              message: "Failed to commit transaction",
                              error: err,
                            });
                          });
                        }

                        // Successfully committed the transaction
                        connection.release(); // Release the connection back to the pool
                        res.status(200).json({
                          message: "Order updated successfully",
                          orderId,
                          totalCost,
                        });
                      });
                    }
                  );
                });
              });
            }
          );
        });
      });
    });
  });
});

app.put("/api/updateOrderDelivery/:id", (req, res) => {
  const { id } = req.params; // Order ID to update
  const { supplyId, products, totalCost } = req.body;

  if (!products || products.length === 0) {
    return res.status(400).json({ message: "No products in the order" });
  }

  // Get a connection from the pool to start a transaction
  db.getConnection((err, connection) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Failed to get a database connection", error: err });
    }

    // Start transaction
    connection.beginTransaction((err) => {
      if (err) {
        connection.release();
        return res
          .status(500)
          .json({ message: "Failed to start transaction", error: err });
      }

      // Step 1: Update order in tblorders
      const updateOrderQuery = `
        UPDATE tblordersfromsupplier 
        SET  totalCost = ?, status = 0 
        WHERE orderId = ?
      `;
      connection.query(updateOrderQuery, [totalCost, id], (err, result) => {
        if (err) {
          return connection.rollback(() => {
            connection.release();
            res
              .status(500)
              .json({ message: "Failed to update order", error: err });
          });
        }

        // Step 2: Delete existing items for the order
        const deleteItemsQuery = `
          DELETE FROM tblorderfromsupplier_items 
          WHERE orderId = ?
        `;
        connection.query(deleteItemsQuery, [id], (err, result) => {
          if (err) {
            return connection.rollback(() => {
              connection.release();
              res.status(500).json({
                message: "Failed to delete existing items",
                error: err,
              });
            });
          }

          // Step 3: Insert updated items into tblorderfromsupplier_items
          const insertItemsQuery = `
            INSERT INTO tblorderfromsupplier_items (orderId, matId, quantity, price, totalCost, supplierId,status)
            VALUES ?
          `;
          const values = products.map((product) => [
            id, // Existing Order ID
            product.productId, // Material ID (matId)
            product.quantity, // Quantity ordered
            product.price, // Price per unit
            product.total,
            product.supplierId,
            0, // Initial status (e.g., 0 for pending)
          ]);

          connection.query(insertItemsQuery, [values], (err, result) => {
            if (err) {
              return connection.rollback(() => {
                connection.release();
                res.status(500).json({
                  message: "Failed to add updated items to the order",
                  error: err,
                });
              });
            }

            // Step 4: Commit the transaction
            connection.commit((err) => {
              if (err) {
                return connection.rollback(() => {
                  connection.release();
                  res.status(500).json({
                    message: "Failed to commit transaction",
                    error: err,
                  });
                });
              }

              // Successfully committed the transaction
              connection.release(); // Release the connection back to the pool
              res.status(200).json({
                message: "Order updated successfully",
                orderId: id,
                totalCost,
              });
            });
          });
        });
      });
    });
  });
});

app.get("/api/supplydelivery/:deliveryId", (req, res) => {
  const { deliveryId } = req.params;
  const query = "SELECT * FROM tblSupDeli WHERE supdeliId = ?";
  db.query(query, [deliveryId], (error, results) => {
    if (error) {
      console.error("Error fetching supply delivery:", error);
      res.status(500).send("Server Error");
    } else if (results.length === 0) {
      res.status(404).send("Supply delivery not found");
    } else {
      res.json(results[0]);
    }
  });
});

app.put("/api/updatesupplydelivery/:supDeliId", (req, res) => {
  const { supDeliId } = req.params; // The supply delivery ID from the URL parameter
  const { supplyId, matId, quantity, cost } = req.body; // Extracting values from the request body

  // Query to get the original quantity of the supply delivery
  const getOriginalQuantityQuery = `
        SELECT quantity FROM tblSupDeli WHERE supDeliId = ?;
    `;

  // Query to update the supply delivery record in tblSupDeli
  const updateDeliveryQuery = `
        UPDATE tblSupDeli 
        SET supplyId = ?, matId = ?, quantity = ?, cost = ? 
        WHERE supDeliId = ?;
    `;

  // Query to update the quantity of raw materials in tblRawMats
  const updateRawMatsQuery = `
        UPDATE tblrawmats 
        SET quantity = quantity + ? 
        WHERE matId = ?;
    `;

  // Query to update the raw materials inventory in tblrawmatsinv
  const updateRawMatsInvQuery = `
        UPDATE tblrawmatsinv
        SET quantity = quantity + ?, lastupdated = NOW()
        WHERE supDeliId = ?;
    `;

  // Get the original quantity of the supply delivery to calculate the difference
  db.query(getOriginalQuantityQuery, [supDeliId], (error, results) => {
    if (error) {
      console.error("Error fetching original quantity:", error);
      return res.status(500).send("Server Error");
    }

    const originalQuantity = results[0]?.quantity;
    if (originalQuantity === undefined) {
      return res.status(404).send("Supply delivery not found.");
    }

    const quantityDifference = quantity - originalQuantity;

    // Step 1: Update the supply delivery record
    db.query(
      updateDeliveryQuery,
      [supplyId, matId, quantity, cost, supDeliId],
      (error) => {
        if (error) {
          console.error("Error updating supply delivery:", error);
          return res.status(500).send("Error updating supply delivery");
        }

        // Step 2: Update the raw materials quantity in tblRawMats
        db.query(updateRawMatsQuery, [quantityDifference, matId], (error) => {
          if (error) {
            console.error("Error updating raw materials quantity:", error);
            return res
              .status(500)
              .send("Error updating raw materials quantity");
          }

          // Step 3: Update the raw materials inventory in tblrawmatsinv
          db.query(
            updateRawMatsInvQuery,
            [quantityDifference, supDeliId],
            (error) => {
              if (error) {
                console.error("Error updating raw materials inventory:", error);
                return res
                  .status(500)
                  .send("Error updating raw materials inventory");
              }

              // Successfully updated the supply delivery, raw materials, and inventory
              res
                .status(200)
                .send(
                  "Supply delivery, raw materials, and inventory updated successfully."
                );
            }
          );
        });
      }
    );
  });
});

app.get("/api/inventory-data/:itemId", async (req, res) => {
  const itemId = req.params.itemId;

  try {
    const query = `
            SELECT 
            p.*,
          
            i.itemName,
            i.price,
            i.quantity,
            i.category,
            i.description,
            COALESCE(SUM(p.actualQuantityProduced), 0) AS totalQuantity  -- Total quantity from tblproduction
        FROM 
            tblitems i
        LEFT JOIN 
            tblproduction p ON i.itemId = p.itemId  
        WHERE i.itemId = ? AND p.production_status = 1	
        GROUP BY 
          p.productionId;  
        `;

    db.query(query, [itemId], (error, results) => {
      if (error) {
        console.error("Error fetching inventory details:", error);
        return res.status(500).json({ error: "Database query error" });
      }
      res.status(200).json(results);
    });
  } catch (error) {
    console.error("Server error fetching inventory details:", error);
    res.status(500).send("Server error");
  }
});

app.get("/api/categories", (req, res) => {
  const query = "SELECT * FROM tblcategories";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching categories:", err);
      return res.status(500).send("Server error");
    }

    // Group categories by type
    const groupedCategories = results.reduce((acc, category) => {
      if (!acc[category.type]) {
        acc[category.type] = [];
      }
      acc[category.type].push(category);
      return acc;
    }, {});

    res.json(groupedCategories);
  });
});

app.post("/api/categories", (req, res) => {
  const { categoryName, type } = req.body;
  const query = "INSERT INTO tblcategories (categoryName, type) VALUES (?, ?)";
  db.query(query, [categoryName, type], (err, results) => {
    if (err) {
      console.error("Error creating category:", err);
      return res.status(500).send("Server error");
    }
    res.status(201).json({ message: "Category created", id: results.insertId });
  });
});

// API Route: Update Category
app.put("/api/categories/:id", (req, res) => {
  const { id } = req.params;
  const { categoryName, type } = req.body;
  const query =
    "UPDATE tblcategories SET categoryName = ?, type = ? WHERE id = ?";
  db.query(query, [categoryName, type, id], (err, results) => {
    if (err) {
      console.error("Error updating category:", err);
      return res.status(500).send("Server error");
    }
    res.json({ message: "Category updated" });
  });
});

// API Route: Delete Category
app.delete("/api/categories/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM tblcategories WHERE id = ?";
  db.query(query, [id], (err) => {
    if (err) {
      console.error("Error deleting category:", err);
      return res.status(500).send("Server error");
    }
    res.json({ message: "Category deleted" });
  });
});

// API Route: Get Inventory Categories
app.get("/api/categories/inventory", (req, res) => {
  const query = "SELECT * FROM tblcategories WHERE type = 'Inventory'";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching inventory categories:", err);
      res.status(500).send("Server error");
    } else {
      res.json(results);
    }
  });
});

app.get("/api/categories/document", (req, res) => {
  const query =
    "SELECT * FROM tblcategories WHERE type IN ('Document', 'Contracts/Agreement', 'Legal')";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching inventory categories:", err);
      res.status(500).send("Server error");
    } else {
      res.json(results);
    }
  });
});

// API Route: Get RawMaterials Categories
app.get("/api/categories/rawMaterials", (req, res) => {
  const query = "SELECT * FROM tblcategories WHERE type = 'RawMaterial'";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching inventory categories:", err);
      res.status(500).send("Server error");
    } else {
      res.json(results);
    }
  });
});

app.put("/api/production/complete/:productionId", async (req, res) => {
  const { productionId } = req.params;
  const { username, access, producedQuantity } = req.body;

  // Get a connection from the pool to start a transaction
  db.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting DB connection:", err);
      return res.status(500).send("Error getting database connection.");
    }

    // Start the transaction
    connection.beginTransaction(async (transactionErr) => {
      if (transactionErr) {
        connection.release();
        console.error("Transaction start error:", transactionErr);
        return res.status(500).send("Error starting transaction.");
      }

      try {
        // Step 1: Fetch production details to validate
        const getProductionSql = `
          SELECT productionId, itemId, quantityProduced, actualQuantityProduced
          FROM tblproduction
          WHERE productionId = ? AND production_status = 0;`;

        const [production] = await new Promise((resolve, reject) => {
          connection.query(getProductionSql, [productionId], (err, results) => {
            if (err) reject(err);
            resolve(results);
          });
        });

        if (!production) {
          return res
            .status(404)
            .json({ message: "Production not found or already completed." });
        }

        const { itemId, quantityProduced, actualQuantityProduced } = production;

        // Validation: Check that the actual quantity produced is not greater than the quantity produced
        if (producedQuantity > quantityProduced) {
          return res.status(400).json({
            message:
              "Actual quantity produced cannot be greater than the quantity produced.",
          });
        }

        // Step 2: Update production status and actual quantity produced
        const updateProductionSql = `
          UPDATE tblproduction
          SET actualQuantityProduced = ?, production_status = 1 , quantityProducedStorage = ?
          WHERE productionId = ?;`;

        await new Promise((resolve, reject) => {
          connection.query(
            updateProductionSql,
            [producedQuantity, producedQuantity, productionId],
            (err) => {
              if (err) reject(err);
              resolve();
            }
          );
        });

        // Step 3: Update item quantity
        const updateItemQuantitySql = `
          UPDATE tblitems
          SET quantity = quantity + ?
          WHERE itemId = ?;`;

        await new Promise((resolve, reject) => {
          connection.query(
            updateItemQuantitySql,
            [producedQuantity, itemId],
            (err) => {
              if (err) reject(err);
              resolve();
            }
          );
        });

        const insertNotificationSql = `
        INSERT INTO tblnotifications (description, status, account_notif)
        VALUES (?, 0, ?);`;

        const notificationBody = `Production ID ${productionId} has been completed by ${username}.`;

        await new Promise((resolve, reject) => {
          connection.query(
            insertNotificationSql,
            [notificationBody, access],
            (err) => {
              if (err) reject(err);
              resolve();
            }
          );
        });
        connection.commit((commitErr) => {
          if (commitErr) {
            connection.rollback(() => {
              connection.release();
              console.error("Transaction commit error:", commitErr);
              return res.status(500).send("Error committing transaction.");
            });
          }

          // Successfully committed the transaction
          connection.release(); // Release the connection back to the pool
          res
            .status(200)
            .json({ message: "Production completed successfully." });
        });
      } catch (err) {
        console.error("Error during production completion:", err);
        connection.rollback(() => {
          connection.release();
          res.status(500).send("Error during production completion.");
        });
      }
    });
  });
});

app.get("/api/production", (req, res) => {
  const query = `
  SELECT pd.*, it.itemName 
  FROM tblproduction pd 
  LEFT JOIN tblitems it ON pd.itemId = it.itemId 
  ORDER BY pd.productionId DESC;
`;

  db.query(query, (err, results) => {
    if (err) return res.status(500).send(err);

    // Use Promise.all to handle multiple async queries
    const fetchMaterials = results.map((data) => {
      return new Promise((resolve, reject) => {
        const sql = `
        SELECT pd.productionId, mu.quantityUsed, rm.matName, rm.category 
        FROM tblproduction pd 
        LEFT JOIN tblproductionmaterialused mu ON pd.productionId = mu.productionId 
        LEFT JOIN tblorderfromsupplier_items odi ON mu.orderItemId = odi.orderItemId 
        LEFT JOIN tblrawmats rm ON odi.matId = rm.matId 
        WHERE pd.productionId = ?;
      `;
        db.query(sql, [data.productionId], (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve({ ...data, materials: result });
          }
        });
      });
    });

    Promise.all(fetchMaterials)
      .then((updatedResults) => {
        res.json(updatedResults); // Send the updated data with materials
      })
      .catch((err) => {
        res.status(500).send(err); // Handle any errors that occur during fetching materials
      });
  });
});

// GET: Fetch a single production record by productionId
app.get("/api/production/:id", (req, res) => {
  const { id } = req.params;
  const query = "SELECT * FROM tblproduction WHERE productionId = ?";
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

app.post("/api/produce", (req, res) => {
  const { username, access, itemId, itemName, quantityToProduce, staffName } =
    req.body;
  const productionDate = new Date();

  // Get a connection from the pool to start a transaction
  db.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting DB connection:", err);
      return res.status(500).send("Error getting database connection.");
    }

    // Start the transaction
    connection.beginTransaction(async (transactionErr) => {
      if (transactionErr) {
        connection.release();
        console.error("Transaction start error:", transactionErr);
        return res.status(500).send("Error starting transaction.");
      }

      try {
        // Step 1: Fetch required materials
        const getMaterialsSql = `
          SELECT r.matId, r.matName, COALESCE(SUM(odi.remaining_quantity), 0) AS availableQuantity,
                odi.orderItemId, odi.remaining_quantity
          FROM tblitem_ingredients i
          LEFT JOIN tblorderfromsupplier_items odi ON i.matId = odi.matId
          LEFT JOIN tblrawmats r ON i.matId = r.matId
          WHERE i.itemId = ?
          GROUP BY i.matId;`;

        const materials = await new Promise((resolve, reject) => {
          connection.query(getMaterialsSql, [itemId], (err, results) => {
            if (err) reject(err);
            resolve(results);
          });
        });

        // Check material availability
        const insufficientMaterials = [];
        const materialUpdates = [];
        materials.forEach((material) => {
          const requiredQuantity = quantityToProduce; // Assume 1:1 ratio for simplicity
          if (material.availableQuantity < requiredQuantity) {
            insufficientMaterials.push({
              matId: material.matId,
              matName: material.matName,
              availableQuantity: material.availableQuantity,
              requiredQuantity,
            });
          } else {
            materialUpdates.push({
              matId: material.matId,
              usedQuantity: requiredQuantity,
              matName: material.matName,
            });
          }
        });

        if (insufficientMaterials.length > 0) {
          return connection.rollback(() => {
            connection.release();
            res.status(400).json({
              message: "Insufficient materials to produce the product.",
              insufficientMaterials,
            });
          });
        }

        const materialBatchMappings = []; // To track materials used with their orderItemId

        // Step 2: Deduct materials and update order items
        for (const material of materialUpdates) {
          let remainingToDeduct = material.usedQuantity;

          const orderItemsSql = `
            SELECT orderItemId, remaining_quantity
            FROM tblorderfromsupplier_items
            WHERE matId = ? AND remaining_quantity > 0
            ORDER BY orderItemId ASC;`;

          const orderItems = await new Promise((resolve, reject) => {
            connection.query(
              orderItemsSql,
              [material.matId],
              (err, results) => {
                if (err) reject(err);
                resolve(results);
              }
            );
          });

          for (const orderItem of orderItems) {
            if (remainingToDeduct <= 0) break;

            const quantityToDeduct = Math.min(
              remainingToDeduct,
              orderItem.remaining_quantity
            );

            const updateOrderItemSql = `
              UPDATE tblorderfromsupplier_items
              SET remaining_quantity = remaining_quantity - ?
              WHERE orderItemId = ?;`;

            await new Promise((resolve, reject) => {
              connection.query(
                updateOrderItemSql,
                [quantityToDeduct, orderItem.orderItemId],
                (err) => {
                  if (err) reject(err);
                  resolve();
                }
              );
            });

            // Track the used material in materialBatchMappings
            materialBatchMappings.push({
              matId: material.matId,
              matName: material.matName,
              orderItemId: orderItem.orderItemId,
              quantityUsed: quantityToDeduct,
            });

            remainingToDeduct -= quantityToDeduct;
          }

          const updateRawMaterialSql = `
            UPDATE tblrawmats
            SET quantity = quantity - ?
            WHERE matId = ?;`;

          await new Promise((resolve, reject) => {
            connection.query(
              updateRawMaterialSql,
              [material.usedQuantity, material.matId],
              (err) => {
                if (err) reject(err);
                resolve();
              }
            );
          });
        }

        // Step 3: Insert the production record
        const insertProductionSql = `
          INSERT INTO tblproduction (itemId, quantityProduced, productionDate, staffName, production_status)
          VALUES (?, ?, ?, ?, ?);`;

        const productionStatus = 0; // Assuming 1 means "produced"
        const insertProductionResult = await new Promise((resolve, reject) => {
          connection.query(
            insertProductionSql,
            [
              itemId,
              quantityToProduce,
              productionDate,
              staffName,
              productionStatus,
            ],
            (err, result) => {
              if (err) reject(err);
              resolve(result);
            }
          );
        });

        const productionId = insertProductionResult.insertId;

        // Step 4: Insert records into tblproductionmaterialused for each material used
        for (const batch of materialBatchMappings) {
          const insertProductionMaterialUsedSql = `
            INSERT INTO tblproductionmaterialused (productionId, orderItemId, quantityUsed)
            VALUES (?, ?, ?);`;

          await new Promise((resolve, reject) => {
            connection.query(
              insertProductionMaterialUsedSql,
              [productionId, batch.orderItemId, batch.quantityUsed],
              (err) => {
                if (err) reject(err);
                resolve();
              }
            );
          });
        }

        // Step 5: Log materials used in `tblproductionmateriallogs`
        const materialLogDescription = materialBatchMappings
          .map(
            (batch) =>
              `Used ${batch.quantityUsed} units of ${batch.matName} (Batch: ${batch.orderItemId})`
          )
          .join(", ");

        const insertMaterialLogSql = `
          INSERT INTO tblproductionmateriallogs (dateLogged, description , productionId)
          VALUES (?, ? , ?);`;

        await new Promise((resolve, reject) => {
          connection.query(
            insertMaterialLogSql,
            [productionDate, materialLogDescription, productionId],
            (err) => {
              if (err) reject(err);
              resolve();
            }
          );
        });

        const notificationDescription = `Successfully produced ${quantityToProduce} units of  ${itemName}. Materials used: ${materialBatchMappings
          .map(
            (batch) =>
              `${batch.matName} (${batch.quantityUsed} units, Batch: ${batch.orderItemId})`
          )
          .join(", ")}.`;
        const insertSuccessNotificationSql = `
          INSERT INTO tblnotifications (description, status, account_notif)
          VALUES (?, 0, ?);`;

        await new Promise((resolve, reject) => {
          connection.query(
            insertSuccessNotificationSql,
            [notificationDescription, access],
            (err) => {
              if (err) reject(err);
              resolve();
            }
          );
        });
        connection.commit((commitErr) => {
          if (commitErr) {
            connection.rollback(() => {
              connection.release();
              console.error("Transaction commit error:", commitErr);
              return res.status(500).send("Error committing transaction.");
            });
          }

          // Successfully committed the transaction
          connection.release(); // Release the connection back to the pool
          res.status(200).send({
            message: "Production recorded successfully.",
            productionId,
            materialBatchMappings,
          });
        });
      } catch (err) {
        console.error("Error during production process:", err);
        connection.rollback(() => {
          connection.release();
          res.status(500).send("Error during production process.");
        });
      }
    });
  });
});

// Update Production and Adjust Item Quantity in tblitems and tblinventory
app.put("/api/updateProduction/:productionId", (req, res) => {
  const { productionId } = req.params;
  const { username, access, itemName, itemId, quantityProduced, staffName } =
    req.body;
  const productionDate = new Date();
  console.log(req.body);
  // Get a connection from the pool
  db.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting connection:", err);
      return res.status(500).send("Error getting database connection.");
    }

    // Start the transaction
    connection.beginTransaction(async (transactionErr) => {
      if (transactionErr) {
        console.error("Transaction start error:", transactionErr);
        connection.release(); // Release the connection in case of error
        return res.status(500).send("Error starting transaction.");
      }

      try {
        // Step 1: Fetch old production details (old quantity and itemId)
        const getOldProductionSql = `
          SELECT quantityProduced, itemId , productionId 
          FROM tblproduction WHERE productionId = ?;`;
        const oldProduction = await new Promise((resolve, reject) => {
          connection.query(
            getOldProductionSql,
            [productionId],
            (err, results) => {
              if (err) reject(err);
              resolve(results[0]);
            }
          );
        });

        if (!oldProduction) {
          return connection.rollback(() => {
            connection.release(); // Release the connection after rollback
            res.status(404).send("Production record not found.");
          });
        }

        const { quantityProduced: oldQuantityProduced, itemId: oldItemId } =
          oldProduction;

        // Check if the quantityProduced is the same as the old one
        const isQuantitySame = oldQuantityProduced == quantityProduced;
        const isItemIdSame = oldItemId == itemId;

        // If both itemId and quantityProduced are the same, skip updating materials and production record
        if (isQuantitySame && isItemIdSame) {
          connection.release(); // Release connection after skipping update
          return res.status(200).send({
            message: "No changes detected, production update skipped.",
            productionId,
          });
        }

        // Step 2: Get materials used for the production
        const getUsedMaterialsSql = `
          SELECT pdu.productionMatId , odi.orderItemId , odi.matId, pdu.quantityUsed, mat.matName 
          FROM tblproductionmaterialused pdu 
          LEFT JOIN tblorderfromsupplier_items odi ON pdu.orderItemId = odi.orderItemId 
          LEFT JOIN tblrawmats mat ON mat.matId = odi.matId  
          WHERE productionId = ?;`;

        const usedMaterials = await new Promise((resolve, reject) => {
          connection.query(
            getUsedMaterialsSql,
            [productionId],
            (err, results) => {
              if (err) reject(err);
              resolve(results);
            }
          );
        });

        console.log("usedmaterial === >", usedMaterials);
        for (const material of usedMaterials) {
          const revertMaterialSql = `
            UPDATE tblorderfromsupplier_items 
            SET remaining_quantity = remaining_quantity + ? 
            WHERE orderItemId = ?;`;

          await new Promise((resolve, reject) => {
            connection.query(
              revertMaterialSql,
              [material.quantityUsed, material.orderItemId],
              (err) => {
                if (err) reject(err);
                resolve();
              }
            );
          });

          const deleteMaterialSql = `
            DELETE FROM tblproductionmaterialused WHERE productionMatId = ?;`;

          await new Promise((resolve, reject) => {
            connection.query(
              deleteMaterialSql,
              [material.productionMatId],
              (err) => {
                if (err) reject(err);
                resolve();
              }
            );
          });

          const materialLogDescription = `Reverted ${material.quantityUsed} units of material: ${material.matName}`;
          const insertMaterialLogSql = `
            INSERT INTO tblproductionmateriallogs (productionId,dateLogged, description) 
            VALUES (?,?, ?);`;

          await new Promise((resolve, reject) => {
            connection.query(
              insertMaterialLogSql,
              [productionId, productionDate, materialLogDescription],
              (err) => {
                if (err) reject(err);
                resolve();
              }
            );
          });
        }

        const getMaterialsSql = `
          SELECT r.matId, r.matName, COALESCE(SUM(odi.remaining_quantity), 0) AS availableQuantity, 
          odi.orderItemId, odi.remaining_quantity 
          FROM tblitem_ingredients i
          LEFT JOIN tblorderfromsupplier_items odi ON i.matId = odi.matId
          LEFT JOIN tblrawmats r ON i.matId = r.matId
          WHERE i.itemId = ?
          GROUP BY i.matId;`;

        const materials = await new Promise((resolve, reject) => {
          connection.query(getMaterialsSql, [itemId], (err, results) => {
            if (err) reject(err);
            resolve(results);
          });
        });

        const insufficientMaterials = [];
        const materialUpdates = [];
        materials.forEach((material) => {
          const requiredQuantity = quantityProduced; // Assuming 1:1 ratio for simplicity
          if (material.availableQuantity < requiredQuantity) {
            insufficientMaterials.push({
              matId: material.matId,
              matName: material.matName,
              availableQuantity: material.availableQuantity,
              requiredQuantity,
            });
          } else {
            materialUpdates.push({
              matId: material.matId,
              usedQuantity: requiredQuantity,
              matName: material.matName,
            });
          }
        });

        if (insufficientMaterials.length > 0) {
          return connection.rollback(() => {
            connection.release(); // Release connection after rollback
            res.status(400).json({
              message: "Insufficient materials to produce the product.",
              insufficientMaterials,
            });
          });
        }

        const materialBatchMappings = []; // To track materials used with their orderItemId

        // Deduct materials and update order items
        for (const material of materialUpdates) {
          let remainingToDeduct = material.usedQuantity;

          const orderItemsSql = `
            SELECT orderItemId, remaining_quantity
            FROM tblorderfromsupplier_items
            WHERE matId = ? AND remaining_quantity > 0
            ORDER BY orderItemId ASC;`;

          const orderItems = await new Promise((resolve, reject) => {
            connection.query(
              orderItemsSql,
              [material.matId],
              (err, results) => {
                if (err) reject(err);
                resolve(results);
              }
            );
          });

          for (const orderItem of orderItems) {
            if (remainingToDeduct <= 0) break;

            const quantityToDeduct = Math.min(
              remainingToDeduct,
              orderItem.remaining_quantity
            );

            const updateOrderItemSql = `
              UPDATE tblorderfromsupplier_items
              SET remaining_quantity = remaining_quantity - ?
              WHERE orderItemId = ?;`;

            await new Promise((resolve, reject) => {
              connection.query(
                updateOrderItemSql,
                [quantityToDeduct, orderItem.orderItemId],
                (err) => {
                  if (err) reject(err);
                  resolve();
                }
              );
            });

            // Track the used material in materialBatchMappings
            materialBatchMappings.push({
              matId: material.matId,
              matName: material.matName,
              orderItemId: orderItem.orderItemId,
              quantityUsed: quantityToDeduct,
            });

            remainingToDeduct -= quantityToDeduct;
          }

          const updateRawMaterialSql = `
            UPDATE tblrawmats
            SET quantity = quantity - ?
            WHERE matId = ?;`;

          await new Promise((resolve, reject) => {
            connection.query(
              updateRawMaterialSql,
              [material.usedQuantity, material.matId],
              (err) => {
                if (err) reject(err);
                resolve();
              }
            );
          });
        }

        // Step 4: Update the production record
        const updateProductionSql = `
          UPDATE tblproduction
          SET itemId = ?, quantityProduced = ?, staffName = ?
          WHERE productionId = ?;`;

        await new Promise((resolve, reject) => {
          connection.query(
            updateProductionSql,
            [itemId, quantityProduced, staffName, productionId],
            (err) => {
              if (err) reject(err);
              resolve();
            }
          );
        });

        // Insert records into tblproductionmaterialused for each material used
        for (const batch of materialBatchMappings) {
          const insertProductionMaterialUsedSql = `
            INSERT INTO tblproductionmaterialused (productionId, orderItemId, quantityUsed)
            VALUES (?, ?, ?);`;

          await new Promise((resolve, reject) => {
            connection.query(
              insertProductionMaterialUsedSql,
              [productionId, batch.orderItemId, batch.quantityUsed],
              (err) => {
                if (err) reject(err);
                resolve();
              }
            );
          });
        }

        // Log materials used in tblproductionmateriallogs
        const materialLogDescription = materialBatchMappings
          .map(
            (batch) =>
              `Used ${batch.quantityUsed} units of ${batch.matName} (Batch: ${batch.orderItemId})`
          )
          .join(", ");

        const insertMaterialLogSql = `
          INSERT INTO tblproductionmateriallogs (productionId, dateLogged, description)
          VALUES (?,?, ?);`;

        await new Promise((resolve, reject) => {
          connection.query(
            insertMaterialLogSql,
            [productionId, productionDate, materialLogDescription],
            (err) => {
              if (err) reject(err);
              resolve();
            }
          );
        });

        const productionUpdateMessage = `Production of ${itemName} is updated.`;
        const insertNotificationSql = `
          INSERT INTO tblnotifications (description, status , account_notif) VALUES (?,  0 , ?);`;
        await new Promise((resolve, reject) => {
          connection.query(
            insertNotificationSql,
            [productionUpdateMessage, access],
            (err) => {
              if (err) reject(err);
              resolve();
            }
          );
        });
        connection.commit((commitErr) => {
          if (commitErr) {
            console.error("Transaction commit error:", commitErr);
            connection.rollback(() => {
              connection.release(); // Release connection after rollback
              res.status(500).send("Error committing transaction.");
            });
          } else {
            connection.release(); // Release the connection after commit
            res.status(200).send({
              message: "Production updated successfully.",
              productionId,
              materialBatchMappings,
            });
          }
        });
      } catch (err) {
        console.error("Error during production update:", err);
        connection.rollback(() => {
          connection.release(); // Release the connection after rollback
          res.status(500).send("Error during production update process.");
        });
      }
    });
  });
});

// DELETE: Delete a production record by productionId
app.delete("/api/production/:id/:username/:access", async (req, res) => {
  const id = req.params.id;
  const username = req.params.username;
  const access = req.params.access;
  db.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting connection:", err);
      return res.status(500).send("Error getting database connection.");
    }

    // Begin the transaction on the connection
    connection.beginTransaction(async (transactionErr) => {
      if (transactionErr) {
        console.error("Transaction start error:", transactionErr);
        connection.release(); // Release connection in case of error
        return res.status(500).send("Error starting transaction.");
      }

      try {
        // Step 1: Verify production exists and check `production_status`
        const getProductionSql = `
          SELECT productionId, itemId, quantityProduced, production_status
          FROM tblproduction
          WHERE productionId = ?;`;

        const productionResult = await new Promise((resolve, reject) => {
          connection.query(getProductionSql, [id], (err, results) => {
            if (err) reject(err);
            resolve(results);
          });
        });

        if (productionResult.length === 0) {
          return res
            .status(404)
            .json({ message: "Production record not found" });
        }

        const { productionId, itemId, quantityProduced, production_status } =
          productionResult[0];

        // Prevent deletion if production_status is not 0
        if (production_status !== 0) {
          return res.status(400).json({
            message:
              "Production cannot be deleted because it is already finalized.",
          });
        }

        // Step 2: Get material usage details from tblproductionmaterialused
        const getUsedMaterialsSql = `
          SELECT orderItemId, quantityUsed
          FROM tblproductionmaterialused
          WHERE productionId = ?;`;

        const usedMaterials = await new Promise((resolve, reject) => {
          connection.query(getUsedMaterialsSql, [id], (err, results) => {
            if (err) reject(err);
            resolve(results);
          });
        });

        // Debugging the used materials query result
        console.log("Used materials for production:", usedMaterials);

        // Step 3: Reverse `remaining_quantity` for each material batch
        const updateOrderItemSql = `
          UPDATE tblorderfromsupplier_items
          SET remaining_quantity = remaining_quantity + ?
          WHERE orderItemId = ?;`; // Adding a check for valid remaining quantity

        for (const material of usedMaterials) {
          const { orderItemId, quantityUsed } = material;

          // Debugging the material being updated
          console.log(
            `Reverting ${quantityUsed} units for orderItemId: ${orderItemId}`
          );

          // Ensure we don't over-reduce the remaining_quantity
          await new Promise((resolve, reject) => {
            connection.query(
              updateOrderItemSql,
              [quantityUsed, orderItemId, quantityUsed],
              (err, result) => {
                if (err) reject(err);
                console.log(
                  `Updated remaining quantity for orderItemId ${orderItemId}:`,
                  result
                );
                resolve();
              }
            );
          });
        }

        // Step 4: Delete material usage records from `tblproductionmaterialused`
        const deleteUsedMaterialsSql = `
          DELETE FROM tblproductionmaterialused
          WHERE productionId = ?;`;

        await new Promise((resolve, reject) => {
          connection.query(deleteUsedMaterialsSql, [id], (err) => {
            if (err) reject(err);
            resolve();
          });
        });

        // Step 6: Delete production record from `tblproduction`
        const deleteProductionSql = `
          DELETE FROM tblproduction
          WHERE productionId = ?;`;

        await new Promise((resolve, reject) => {
          connection.query(deleteProductionSql, [id], (err) => {
            if (err) reject(err);
            resolve();
          });
        });

        const logDeletionSql = `
      INSERT INTO tblproductionmateriallogs (productionId,dateLogged, description) 
      VALUES (?,?, ?);`;
        const logDescription = `Deleted production ID ${id} and reverted materials.`;
        await new Promise((resolve, reject) => {
          connection.query(
            logDeletionSql,
            [id, new Date(), logDescription],
            (err) => {
              if (err) reject(err);
              resolve();
            }
          );
        });

        const insertNotificationSql = `
        INSERT INTO tblnotifications (description, status , account_notif) 
        VALUES (?, 0 ,?);`;
        const notificationMessage = `Production #${id} deleted by ${username}. All related materials have been reverted.`;
        await new Promise((resolve, reject) => {
          connection.query(
            insertNotificationSql,
            [notificationMessage, access],
            (err) => {
              if (err) reject(err);
              resolve();
            }
          );
        });
        connection.commit((commitErr) => {
          if (commitErr) {
            //  '   console.error("Transaction commit error:", commitErr);'
            connection.rollback(() => {
              connection.release(); // Release connection on commit error
              return res.status(500).send("Error committing transaction.");
            });
          }
          connection.release(); // Release connection after commit
          res.status(200).json({
            message:
              "Production record deleted, and materials restored successfully.",
          });
        });
      } catch (err) {
        console.error("Error during production deletion:", err);
        connection.rollback(() => {
          connection.release(); // Release connection on error
          res.status(500).send("Error during production deletion.");
        });
      }
    });
  });
});

// Combined Data API Endpoint for
// app.get('/api/combined-data', (req, res) => {
//     const sqlQuery = `
//         SELECT
//             p.productionId,
//             i.itemName,
//             inv. quantity,
//             p.productionDate AS date,
//             p.staffName AS staff,
//             inv.status,
//             inv.lastUpdated
//         FROM
//             tblproduction p
//         JOIN
//             tblinventory inv ON p.productionId = inv.productionId
//         JOIN
//             tblitems i ON p.itemId = i.itemId;
//     `;

//     db.query(sqlQuery, (err, results) => {
//         if (err) {
//             console.error(err);
//             return res.status(500).json({ error: 'Database query error' });
//         }
//         res.json(results);
//     });
// });

//sales admin
//order
// Route to get all orders with product details
app.get("/api/orders", (req, res) => {
  const query = `
        SELECT 
            o.orderId, 
            o.customerName, 
            o.date, 
            o.location, 
            o.modeOfPayment, 
            o.paymentStatus, 
            o.status, 
            o.price, 
            o.quantity as OrderedQuantities,
            GROUP_CONCAT(i.itemName SEPARATOR ', ') AS itemNames,
            GROUP_CONCAT(i.quantity SEPARATOR ', ') AS remainingQuantities
          
        FROM 
            tblorders AS o
        LEFT JOIN 
            tblitems AS i ON o.itemId = i.itemId
        GROUP BY 
            o.orderId
        ORDER BY 
            o.date DESC;

    `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching orders:", err);
      res.status(500).json({ message: "Failed to fetch orders" });
    } else {
      res.json(results);
    }
  });
});

// Fetch items for the dropdown
app.get("/api/items", (req, res) => {
  const query = "SELECT itemId, itemName, price FROM tblitems"; // Adjust the table name as needed
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching items" });
    }
    res.json(results);
  });
});

// Route to add a new order
app.post("/api/orders", (req, res) => {
  const {
    customerName,
    date,
    price,
    status,
    lastUpdateDate,
    location,
    paymentStatus,
    modeOfPayment,
    orderProducts,
  } = req.body;

  // Check if orderProducts is an array
  if (!Array.isArray(orderProducts)) {
    return res.status(400).send("orderProducts must be an array");
  }

  // 1. Insert the order into tblorders
  const orderQuery = `
        INSERT INTO tblorders (customerName, date, price, status, lastUpdateDate, location, paymentStatus, modeOfPayment)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

  const orderData = [
    customerName,
    date,
    price,
    status,
    lastUpdateDate,
    location,
    paymentStatus,
    modeOfPayment,
  ];

  db.query(orderQuery, orderData, (err, result) => {
    if (err) {
      console.error("Error inserting order:", err);
      return res.status(500).send("Error inserting order");
    }

    // Get the orderId of the newly inserted order
    const orderId = result.insertId;

    // 2. Insert each product with inventoryId into tblorderproducts
    const orderProductsQuery = `
            INSERT INTO tblorderproducts (orderId, itemId, quantity, inventoryId)
            VALUES ?
        `;

    const orderProductsData = orderProducts.map((product) => [
      orderId, // The orderId we just inserted
      product.itemId, // Product itemId
      product.quantity, // Product quantity
      product.batch, // Product batch (corresponding to inventoryId)
    ]);

    // Insert the order products into the database
    db.query(orderProductsQuery, [orderProductsData], (err, result) => {
      if (err) {
        console.error("Error inserting order products:", err);
        return res.status(500).send("Error inserting order products");
      }

      // Success response
      res.status(201).send({ message: "Order added successfully" });
    });
  });
});

// Route to update an existing order
app.put("/api/orders/:orderId", (req, res) => {
  const { orderId } = req.params;
  const {
    customerName,
    date,
    price,
    status,
    lastUpdateDate,
    location,
    paymentStatus,
    modeOfPayment,
    orderProducts,
  } = req.body;

  // Validate the incoming data
  if (
    !orderId ||
    !customerName ||
    !date ||
    !price ||
    !status ||
    !lastUpdateDate ||
    !location ||
    !paymentStatus ||
    !modeOfPayment
  ) {
    return res.status(400).send("Missing required fields");
  }

  // 1. Update the order details in tblorders
  const updateOrderQuery = `
        UPDATE tblorders 
        SET customerName = ?, date = ?, price = ?, status = ?, lastUpdateDate = ?, 
            location = ?, paymentStatus = ?, modeOfPayment = ? 
        WHERE orderId = ?`;

  const updateOrderData = [
    customerName,
    date,
    price,
    status,
    lastUpdateDate,
    location,
    paymentStatus,
    modeOfPayment,
    orderId,
  ];

  db.query(updateOrderQuery, updateOrderData, (err, result) => {
    if (err) {
      console.error("Error updating order:", err);
      return res.status(500).send("Error updating order");
    }

    // 2. Delete all products associated with the orderId in tblorderproducts
    const deleteProductsQuery = `DELETE FROM tblorders WHERE orderId = ?`;
    db.query(deleteProductsQuery, [orderId], (err, result) => {
      if (err) {
        console.error("Error deleting products:", err);
        return res.status(500).send("Error deleting products");
      }

      // 3. Add the updated order products
      if (orderProducts && orderProducts.length > 0) {
        const insertProductsQuery = `INSERT INTO tblorderproducts (orderId, itemId, quantity) VALUES ?`;
        const insertProductsData = orderProducts.map((product) => [
          orderId,
          product.itemId,
          product.quantity,
        ]);

        db.query(insertProductsQuery, [insertProductsData], (err, result) => {
          if (err) {
            console.error("Error inserting products:", err);
            return res.status(500).send("Error inserting products");
          }

          res.status(200).send("Order updated successfully");
        });
      } else {
        // No products to insert, just respond
        res.status(200).send("Order updated successfully");
      }
    });
  });
});

// Route to delete an order
app.delete("/api/orders/:orderId", (req, res) => {
  const orderId = req.params.orderId;

  const deleteOrderQuery = `DELETE FROM tblorders WHERE orderId = ?`;
  const deleteOrderProductsQuery = `DELETE FROM tblorders WHERE orderId = ?`;

  db.query(deleteOrderProductsQuery, [orderId], (err) => {
    if (err) {
      console.error("Error deleting order products:", err);
      return res.status(500).send("Error deleting order products");
    }

    db.query(deleteOrderQuery, [orderId], (err) => {
      if (err) {
        console.error("Error deleting order:", err);
        return res.status(500).send("Error deleting order");
      }
      res.send({ message: "Order deleted successfully" });
    });
  });
});

// Route to update an existing order
app.put("/api/orders/:orderId", (req, res) => {
  const { orderId } = req.params;
  const {
    itemId,
    customerName,
    date,
    location,
    modeOfPayment,
    paymentStatus,
    price,
    quantity,
    status,
  } = req.body;

  // SQL query to update an order with the provided details
  const query = `
        UPDATE tblorders 
        SET itemId = ?, customerName = ?, date = ?, location = ?, modeOfPayment = ?, 
            paymentStatus = ?, price = ?, quantity = ?, status = ?
        WHERE orderId = ?`;

  db.query(
    query,
    [
      itemId,
      customerName,
      date,
      location,
      modeOfPayment,
      paymentStatus,
      price,
      quantity,
      status,
      orderId,
    ],
    (error, results) => {
      if (error) {
        console.error("Error updating order:", error);
        return res
          .status(500)
          .json({ error: "An error occurred while updating the order." });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ error: "Order not found." });
      }

      res.json({ message: "Order updated successfully" });
    }
  );
});

app.get("/api/preparingOrders", async (req, res) => {
  try {
    // Base query to select orders with status 'preparing'
    const query =
      'SELECT * FROM tblorders WHERE status = "preparing" order by tblorders.date';

    db.query(query, (err, results) => {
      if (err) {
        console.error("Error fetching orders:", err);
        return res.status(500).json({ error: "Error fetching orders" }); // Changed message to match
      }
      res.json(results); // Send the results as JSON
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/deliveryOrders", async (req, res) => {
  try {
    // Base query to select orders with status 'on delivery'
    const query =
      'SELECT * FROM tblorders WHERE status = "on delivery" order by tblorders.date';

    db.query(query, (err, results) => {
      if (err) {
        console.error("Error fetching orders:", err);
        return res.status(500).json({ error: "Error fetching orders" }); // Changed message to match
      }
      res.json(results); // Send the results as JSON
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/sales", async (req, res) => {
  try {
    // Base query to select orders with status 'delivered'
    const query = "SELECT * FROM tblorders ORDER BY date";

    db.query(query, (err, results) => {
      if (err) {
        console.error("Error fetching orders:", err);
        return res.status(500).json({ error: "Error fetching orders" }); // Changed message to match
      }

      const data = [];

      results.map((res) => {
        if (res.status === "delivered") {
          data.push(res);
        }
      });

      return res.json(data);
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/cancelled", async (req, res) => {
  try {
    const query = "SELECT * FROM tblorders ORDER BY date ASC";

    db.query(query, (err, results) => {
      if (err) {
        console.error("Error fetching orders:", err);
        return res.status(500).json({ error: "Error fetching orders" }); // Changed message to match
      }
      const data = [];
      results.map((res) => {
        if (res.status === "cancelled") {
          data.push(res);
        }
      });

      return res.json(data);
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Delete an order
app.delete("/api/orders/:id", (req, res) => {
  const orderId = req.params.id;
  const query = "DELETE FROM tblorders WHERE orderId = ?";
  db.query(query, [orderId], (err, result) => {
    if (err) {
      console.error("Error deleting order:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ message: "Order deleted successfully" });
  });
});

//production mats logs
// Fetch all production material logs
// Fetch production material logs
app.get("/api/production-material-logs", (req, res) => {
  const query = `
        SELECT 
            logs.logId, 
            logs.dateLogged, 
            logs.description, 
            logs.productionId,
            GROUP_CONCAT(mats.matName SEPARATOR ', ') AS matNames,
            GROUP_CONCAT(logMats.quantity SEPARATOR ', ') AS quantities
          
        FROM 
            tblproductionmateriallogs logs
        LEFT JOIN 
            tblmatlogsmats logMats ON logs.logId = logMats.logId
        LEFT JOIN 
            tblrawmats mats ON logMats.matId = mats.matId
        GROUP BY 
            logs.logId
          ORDER BY logs.logId DESC;
    `;

  db.query(query, (error, results) => {
    if (error) {
      console.error("Database query error:", error);
      return res.status(500).json({ error: "Database query failed" });
    }
    res.json(results);
  });
});

// Add production material log
app.post("/api/addproductionlog", async (req, res) => {
  const { description, dateLogged, materials } = req.body;

  try {
    // Insert production log entry into tblproductionmateriallogs
    const logQuery = `INSERT INTO tblproductionmateriallogs (description, dateLogged) VALUES (?, ?)`;
    const logValues = [
      description,
      dateLogged || new Date().toISOString().split("T")[0],
    ]; // Use today's date if not provided

    db.query(logQuery, logValues, (error, results) => {
      if (error) {
        console.error("Error adding production log: ", error);
        return res.status(500).send("Server Error");
      }

      const newLogId = results.insertId; // Get the inserted log's ID

      // Now insert the material-log associations into tblmatlogsmats
      if (materials && materials.length > 0) {
        // Ensure all materials are valid and present in tblrawmats
        const validMaterials = materials.filter(
          (m) => m.materialId && m.inventoryId
        ); // Filter out invalid materials

        if (validMaterials.length > 0) {
          const materialLogQuery = `
                        INSERT INTO tblmatlogsmats (logId, matId, inventoryId, quantity) 
                        VALUES ${validMaterials
                          .map(() => "(?, ?, ?, ?)")
                          .join(", ")}
                    `;
          const materialLogValues = validMaterials.flatMap((m) => [
            newLogId,
            m.materialId,
            m.inventoryId,
            m.quantity,
          ]);

          db.query(materialLogQuery, materialLogValues, (err) => {
            if (err) {
              console.error("Error adding materials to production log: ", err);
              return res.status(500).send("Server Error");
            }

            // Update the quantities in tblrawmatsinv and tblrawmats after materials have been added to tblmatlogsmats
            const updatePromises = validMaterials.map((material) => {
              return new Promise((resolve, reject) => {
                // Update tblrawmatsinv
                const updateRawMatInvQuery = `
                                    UPDATE tblrawmatsinv
                                    SET quantity = quantity - ?
                                    WHERE inventoryId = ? AND quantity >= ?
                                `;
                const updateRawMatInvValues = [
                  material.quantity,
                  material.inventoryId,
                  material.quantity,
                ];

                db.query(
                  updateRawMatInvQuery,
                  updateRawMatInvValues,
                  (updateInvError, updateInvResults) => {
                    if (updateInvError) {
                      console.error(
                        "Error updating raw material inventory quantity: ",
                        updateInvError
                      );
                      return reject(updateInvError);
                    }

                    if (updateInvResults.affectedRows === 0) {
                      console.warn(
                        `Inventory ID ${material.inventoryId} has insufficient quantity.`
                      );
                      return reject(
                        `Inventory ID ${material.inventoryId} has insufficient quantity.`
                      );
                    }

                    // Update tblrawmats based on matId
                    const updateRawMatQuery = `
                                        UPDATE tblrawmats
                                        SET quantity = quantity - ?
                                        WHERE matId = ? AND quantity >= ?
                                    `;
                    const updateRawMatValues = [
                      material.quantity,
                      material.materialId,
                      material.quantity,
                    ];

                    db.query(
                      updateRawMatQuery,
                      updateRawMatValues,
                      (updateMatError, updateMatResults) => {
                        if (updateMatError) {
                          console.error(
                            "Error updating raw materials quantity: ",
                            updateMatError
                          );
                          return reject(updateMatError);
                        }

                        if (updateMatResults.affectedRows === 0) {
                          console.warn(
                            `Mat ID ${material.materialId} has insufficient quantity.`
                          );
                          return reject(
                            `Mat ID ${material.materialId} has insufficient quantity.`
                          );
                        }

                        resolve();
                      }
                    );
                  }
                );
              });
            });

            // Execute all update promises and send a response after all updates are complete
            Promise.all(updatePromises)
              .then(() => {
                res.send(
                  "Production log and materials added successfully, and quantities updated."
                );
              })
              .catch((updateError) => {
                console.error(
                  "Error updating raw materials inventory: ",
                  updateError
                );
                res
                  .status(500)
                  .send(
                    "Error updating raw materials inventory due to insufficient quantities."
                  );
              });
          });
        } else {
          res.status(400).send("No valid materials provided.");
        }
      } else {
        res.send("Production log added without materials.");
      }
    });
  } catch (error) {
    console.error("Error in adding production log: ", error);
    res.status(500).send("Server Error");
  }
});

app.post("/api/updateproductionlog", async (req, res) => {
  const { description, dateLogged, materials, logId } = req.body;

  try {
    // Step 1: Get existing materials for the log
    const existingMaterialsQuery = `SELECT matId, quantity, inventoryId FROM tblmatlogsmats WHERE logId = ?`;
    const [existingMaterials] = await new Promise((resolve, reject) => {
      db.query(existingMaterialsQuery, [logId], (error, results) => {
        if (error) return reject(error);
        resolve([results]);
      });
    });

    // Step 2: Update the production log entry in tblproductionmateriallogs
    const logQuery = `UPDATE tblproductionmateriallogs SET description = ?, dateLogged = ? WHERE logId = ?`;
    const logValues = [
      description,
      dateLogged || new Date().toISOString().split("T")[0],
      logId,
    ];

    db.query(logQuery, logValues, (error) => {
      if (error) {
        console.error("Error updating production log: ", error);
        return res.status(500).send("Server Error");
      }

      // Step 3: Add old quantities back to tblrawmats (resetting old log quantities)
      const rawMatResetPromises = existingMaterials.map(
        ({ matId, quantity }) => {
          return new Promise((resolve, reject) => {
            const addOldQuantityQuery = `
                        UPDATE tblrawmats
                        SET quantity = quantity + ?
                        WHERE matId = ?`;
            db.query(addOldQuantityQuery, [quantity, matId], (error) => {
              if (error) return reject(error);
              resolve();
            });
          });
        }
      );

      // Step 4: Update tblrawmatsinv by adding the old materials (using inventoryId)
      const rawMatInvResetPromises = existingMaterials.map(
        ({ inventoryId, quantity }) => {
          return new Promise((resolve, reject) => {
            const addOldQuantityToInvQuery = `
                        UPDATE tblrawmatsinv
                        SET quantity = quantity + ?
                        WHERE inventoryId = ?`;
            db.query(
              addOldQuantityToInvQuery,
              [quantity, inventoryId],
              (error) => {
                if (error) return reject(error);
                resolve();
              }
            );
          });
        }
      );

      // Execute all reset promises
      Promise.all([...rawMatResetPromises, ...rawMatInvResetPromises])
        .then(() => {
          // Step 5: Remove existing materials from tblmatlogsmats
          const deleteQuery = `DELETE FROM tblmatlogsmats WHERE logId = ?`;
          db.query(deleteQuery, [logId], (deleteError) => {
            if (deleteError) {
              console.error("Error deleting existing materials: ", deleteError);
              return res.status(500).send("Server Error");
            }

            // Step 6: Insert updated materials into tblmatlogsmats
            if (materials && materials.length > 0) {
              const validMaterials = materials.filter(
                (m) => m.matId && !isNaN(m.quantity)
              );
              if (validMaterials.length > 0) {
                const materialLogQuery = `
                                    INSERT INTO tblmatlogsmats (logId, matId, quantity, inventoryId)
                                    VALUES ${validMaterials
                                      .map(() => "(?, ?, ?, ?)")
                                      .join(", ")}`;
                const materialLogValues = validMaterials.flatMap((m) => [
                  logId,
                  m.matId,
                  m.quantity,
                  m.inventoryId,
                ]);

                db.query(materialLogQuery, materialLogValues, (err) => {
                  if (err) {
                    console.error(
                      "Error adding materials to updated production log: ",
                      err
                    );
                    return res.status(500).send("Server Error");
                  }

                  // Step 7: Subtract new quantities from tblrawmats
                  const rawMatSubtractPromises = validMaterials.map(
                    ({ matId, quantity }) => {
                      return new Promise((resolve, reject) => {
                        const subtractNewQuantityQuery = `
                                                UPDATE tblrawmats
                                                SET quantity = quantity - ?
                                                WHERE matId = ?`;
                        db.query(
                          subtractNewQuantityQuery,
                          [quantity, matId],
                          (error) => {
                            if (error) return reject(error);
                            resolve();
                          }
                        );
                      });
                    }
                  );

                  // Step 8: Update tblrawmatsinv by subtracting the new materials (using inventoryId)
                  const rawMatInvSubtractPromises = validMaterials.map(
                    ({ inventoryId, quantity }) => {
                      return new Promise((resolve, reject) => {
                        const subtractNewQuantityFromInvQuery = `
                                                UPDATE tblrawmatsinv
                                                SET quantity = quantity - ?
                                                WHERE inventoryId = ?`;
                        db.query(
                          subtractNewQuantityFromInvQuery,
                          [quantity, inventoryId],
                          (error) => {
                            if (error) return reject(error);
                            resolve();
                          }
                        );
                      });
                    }
                  );

                  // Execute all subtraction promises
                  Promise.all([
                    ...rawMatSubtractPromises,
                    ...rawMatInvSubtractPromises,
                  ])
                    .then(() =>
                      res.send(
                        "Production log and materials updated successfully"
                      )
                    )
                    .catch((error) => {
                      console.error("Error updating raw materials: ", error);
                      res.status(500).send("Server Error");
                    });
                });
              } else {
                res.status(400).send("No valid materials provided.");
              }
            } else {
              res.send("Production log updated without materials.");
            }
          });
        })
        .catch((error) => {
          console.error(
            "Error updating raw materials in tblrawmats and tblrawmatsinv: ",
            error
          );
          res.status(500).send("Server Error");
        });
    });
  } catch (error) {
    console.error("Error updating production log: ", error);
    res.status(500).send("Server Error");
  }
});

// Delete material log and update raw materials
app.delete("/api/deletemateriallog/:logId", async (req, res) => {
  const { logId } = req.params;

  try {
    // Step 1: Retrieve materials associated with the log
    const getMaterialsQuery = `SELECT matId, quantity, inventoryId FROM tblmatlogsmats WHERE logId = ?`;
    const [materials] = await new Promise((resolve, reject) => {
      db.query(getMaterialsQuery, [logId], (error, results) => {
        if (error) return reject(error);
        resolve([results]);
      });
    });

    if (materials.length === 0) {
      return res.status(404).send("No materials found for this log");
    }

    // Step 2: Update tblrawmats quantities based on removed materials
    const rawMatUpdates = materials.map(
      ({ matId, quantity }) =>
        new Promise((resolve, reject) => {
          const updateRawMatQuery = `
                UPDATE tblrawmats
                SET quantity = quantity + ?
                WHERE matId = ?`;
          db.query(updateRawMatQuery, [quantity, matId], (error) => {
            if (error) return reject(error);
            resolve();
          });
        })
    );

    // Step 3: Update tblrawmatsinv by adding the old quantity back (using inventoryId)
    const rawMatInvUpdates = materials.map(
      ({ inventoryId, quantity }) =>
        new Promise((resolve, reject) => {
          const updateRawMatInvQuery = `
                UPDATE tblrawmatsinv
                SET quantity = quantity + ?
                WHERE inventoryId = ?`;
          db.query(updateRawMatInvQuery, [quantity, inventoryId], (error) => {
            if (error) return reject(error);
            resolve();
          });
        })
    );

    // Wait for all raw materials and raw materials inventory updates to complete
    await Promise.all([...rawMatUpdates, ...rawMatInvUpdates]);

    // Step 4: Delete associated materials from tblmatlogsmats
    const deleteMaterialsQuery = `DELETE FROM tblmatlogsmats WHERE logId = ?`;
    await new Promise((resolve, reject) => {
      db.query(deleteMaterialsQuery, [logId], (error) => {
        if (error) return reject(error);
        resolve();
      });
    });

    // Step 5: Delete the production log entry from tblproductionmateriallogs
    const deleteLogQuery = `DELETE FROM tblproductionmateriallogs WHERE logId = ?`;
    await new Promise((resolve, reject) => {
      db.query(deleteLogQuery, [logId], (error) => {
        if (error) return reject(error);
        resolve();
      });
    });

    res.send("Production log and associated materials deleted successfully");
  } catch (error) {
    console.error("Error deleting material log: ", error);
    res.status(500).send("Server Error");
  }
});

//all the dashboard for quickchart

//sales order  per day summary
app.get("/api/sales/summary", (req, res) => {
  const { range, startDate, endDate } = req.query;

  let query = "";
  let queryParams = []; // Initialize query parameters array

  if (range === "week") {
    // Query for "This Week" range
    query = `
            SELECT 
                WEEKDAY(date) AS day_of_week,  -- 0 = Monday, 1 = Tuesday, ..., 6 = Sunday
                COUNT(*) AS order_count
            FROM 
                tblorders
            WHERE 
                status = "delivered" 
                AND date >= CURDATE() - INTERVAL WEEKDAY(CURDATE()) DAY  -- Start from the most recent Monday
                AND date < CURDATE() + INTERVAL (7 - WEEKDAY(CURDATE())) DAY  -- Extend to the upcoming Sunday (inclusive)
            GROUP BY 
                WEEKDAY(date)
            ORDER BY 
                WEEKDAY(date);

        `;
  }

  if (range === "month") {
    // Query for "This Month" range
    query = `
            SELECT 
                DAY(date) AS day_of_month,  -- Get the day of the month
                COUNT(*) AS order_count
            FROM 
                tblorders
            WHERE 
                status = "delivered" 
                AND MONTH(date) = MONTH(CURDATE()) 
                AND YEAR(date) = YEAR(CURDATE())
            GROUP BY 
                DAY(date)
            ORDER BY 
                DAY(date);
        `;
  }

  if (range === "year") {
    // Query for "This Year" range
    query = `
            SELECT 
                MONTH(date) AS month_of_year,  -- Get the month of the year
                COUNT(*) AS order_count
            FROM 
                tblorders
            WHERE 
                status = "delivered" 
                AND YEAR(date) = YEAR(CURDATE())
            GROUP BY 
                MONTH(date)
            ORDER BY 
                MONTH(date);
        `;
  }

  if (range === "custom") {
    // Query for custom date range
    query = `
            SELECT 
                DAY(date) AS day_of_month,  -- Get the day of the month
                COUNT(*) AS order_count
            FROM 
                tblorders
            WHERE 
                status = "delivered" 
                AND DATE(date) BETWEEN ? AND ?
            GROUP BY 
                DAY(date)
            ORDER BY 
                DAY(date);
        `;
    queryParams = [startDate, endDate]; // Add startDate and endDate to query parameters
  }

  // Execute the query
  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).json({ error: "Database query failed" });
    }

    // Send the results back as JSON
    res.json(results);
  });
});

/*
SALES
*/ /*
 */

// ** DASHBOARD ** //
app.get("/api/sales/current-year", (req, res) => {
  const query = `
  SELECT MONTH(STR_TO_DATE(SUBSTRING_INDEX(time_return, ' ', 1), '%m-%d-%Y')) 
  AS month, SUM(total_sum_price) AS total_sales 
  FROM ( SELECT DISTINCT order_id, total_sum_price, time_return FROM tblsales ) 
  AS distinct_sales WHERE YEAR(STR_TO_DATE(SUBSTRING_INDEX(time_return, ' ', 1), '%m-%d-%Y')) = YEAR(CURDATE()) 
  GROUP BY MONTH(STR_TO_DATE(SUBSTRING_INDEX(time_return, ' ', 1), '%m-%d-%Y')) 
  ORDER BY MONTH(STR_TO_DATE(SUBSTRING_INDEX(time_return, ' ', 1), '%m-%d-%Y'));
`;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching sales data:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    // Prepare response with all months (default 0 for missing months)
    const salesData = Array(12).fill(0); // 12 months, all initialized to 0
    results.forEach((row) => {
      salesData[row.month - 1] = row.total_sales;
    });

    res.json(salesData);
  });
});

app.get("/api/sales_dashboard/", (req, res) => {
  const sql = `SELECT DISTINCT *
              FROM tblsales
              GROUP BY order_id
              ORDER BY time_return DESC, order_id DESC
              LIMIT 10;
              `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching orders:", err);
      return res
        .status(500)
        .json({ status: "error", message: "Internal server error" });
    }

    if (!result || result.length === 0) {
      return res
        .status(200)
        .json({ status: "success", res: "No preparing orders found." });
    }

    const orders = [];

    // Use async function inside a loop to handle multiple queries
    const fetchProductsForOrder = (order) => {
      return new Promise((resolve, reject) => {
        const productSql = `SELECT *
                            FROM tblsales 
                            WHERE order_id = ? 
                            ORDER BY order_id DESC;`;

        db.query(productSql, [order.order_id], (err, products) => {
          if (err) {
            return reject(err);
          }
          resolve({ ...order, products });
        });
      });
    };

    const fetchAllOrders = async () => {
      try {
        const ordersWithProducts = await Promise.all(
          result.map((order) => fetchProductsForOrder(order))
        );

        return res
          .status(200)
          .json({ status: "success", res: ordersWithProducts });
      } catch (err) {
        console.error("Error fetching products:", err);
        return res
          .status(500)
          .json({ status: "error", message: "Internal server error" });
      }
    };

    fetchAllOrders();
  });
});

app.get("/api/sales_today/", (req, res) => {
  const sql = `SELECT 
            SUM(total_sum_price) AS daily_total_sales
            FROM (
                SELECT 
                    order_id, 
                    total_sum_price
                FROM tblsales
                WHERE DATE(STR_TO_DATE(time_return, '%m-%d-%Y %H:%i')) = CURDATE()
                GROUP BY order_id
            ) AS distinct_orders;
              `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching orders:", err);
      return res
        .status(500)
        .json({ status: "error", message: "Internal server error" });
    }

    if (!result || result.length === 0) {
      return res
        .status(200)
        .json({ status: "success", message: "No sales today." });
    }

    // Assuming the result contains a column `daily_total_sales`
    const dailyTotalSales = result[0].daily_total_sales;

    return res.status(200).json({
      status: "success",
      daily_total_sales: dailyTotalSales,
    });
  });
});

app.get("/api/expensethismonth/", (req, res) => {
  const sql = `SELECT 
IFNULL(SUM(totalCost), 0) AS TotalCostThisMonth
FROM 
tblordersfromsupplier
WHERE 
MONTH(orderDate) = MONTH(CURRENT_DATE())
AND YEAR(orderDate) = YEAR(CURRENT_DATE());
              `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching orders:", err);
      return res
        .status(500)
        .json({ status: "error", message: "Internal server error" });
    }

    if (!result || result.length === 0) {
      return res
        .status(200)
        .json({ status: "success", message: "No supplier expense." });
    }

    // Assuming the result contains a column `daily_total_sales`
    const dailyTotalSales = result[0].TotalCostThisMonth;

    return res.status(200).json({
      status: "success",
      expense: dailyTotalSales,
    });
  });
});

app.get("/api/sales_month/", (req, res) => {
  const sql = `SELECT 
            SUM(total_sum_price) AS monthly_total_sales
        FROM (
            SELECT 
                order_id, 
                total_sum_price
            FROM tblsales
            WHERE DATE_FORMAT(STR_TO_DATE(time_return, '%m-%d-%Y %H:%i'), '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')
            GROUP BY order_id
        ) AS distinct_orders;
              `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching orders:", err);
      return res
        .status(500)
        .json({ status: "error", message: "Internal server error" });
    }

    if (!result || result.length === 0) {
      return res
        .status(200)
        .json({ status: "success", message: "No sales today." });
    }

    console.log(result);

    // Assuming the result contains a column `monthly_total_sales`
    const thisMonthTotalSales = result[0].monthly_total_sales;

    return res.status(200).json({
      status: "success",
      thisMonth_total_sales: thisMonthTotalSales,
    });
  });
});

// ** DASHBOARD ** //

//** ORDERS **/

//FETCH PENDING ORDERS  with specific product per order (product object)
app.get("/api/pending_Orders/", (req, res) => {
  const sql = `SELECT DISTINCT *
              FROM tblorders_customer 
              WHERE status = "PENDING" 
              GROUP BY order_id
              ORDER BY date DESC, order_id DESC;`;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching orders:", err);
      return res
        .status(500)
        .json({ status: "error", message: "Internal server error" });
    }

    if (!result || result.length === 0) {
      return res
        .status(200)
        .json({ status: "success", res: "No pending orders found." });
    }

    const orders = [];

    // Use async function inside a loop to handle multiple queries
    const fetchProductsForOrder = (order) => {
      return new Promise((resolve, reject) => {
        const productSql = `SELECT *
                            FROM tblorders_customer 
                            WHERE order_id = ? 
                            ORDER BY order_id DESC;`;

        db.query(productSql, [order.order_id], (err, products) => {
          if (err) {
            return reject(err);
          }
          resolve({ ...order, products });
        });
      });
    };

    const fetchAllOrders = async () => {
      try {
        const ordersWithProducts = await Promise.all(
          result.map((order) => fetchProductsForOrder(order))
        );

        return res
          .status(200)
          .json({ status: "success", res: ordersWithProducts });
      } catch (err) {
        console.error("Error fetching products:", err);
        return res
          .status(500)
          .json({ status: "error", message: "Internal server error" });
      }
    };

    fetchAllOrders();
  });
});
//for updating status to PREPARING
//

app.post("/api/status_preparing/", async (req, res) => {
  const { orderId } = req.body;
  console.log("Order ID: ", orderId);

  try {
    // Step 1: Check if order quantities are valid
    const checkQuery = `
    SELECT 
        oc.itemId AS itemId,
        i.itemName AS item_name,
        oc.quantity AS order_quantity,
        i.quantity AS item_quantity,
        CASE
            WHEN oc.quantity > i.quantity THEN '0'
            ELSE '1'
        END AS comparison_result
    FROM tblorders_customer oc
    JOIN tblitems i ON oc.itemId = i.itemId
    WHERE oc.order_id = ?;
  `;

    db.query(checkQuery, [orderId], async (err, rows) => {
      if (err) {
        console.error("Error checking item quantities:", err);
        return res.status(500).json({ message: "Internal server error" });
      }

      // Step 2: Check if any item has insufficient stock (comparison_result = '0')
      const invalidItem = rows.find((row) => row.comparison_result === "0");
      if (invalidItem) {
        return res.status(400).json({
          message: `Insufficient stock: ${invalidItem.item_name} <br>Available Stock Now: ${invalidItem.item_quantity} <br>Customer Ordered: ${invalidItem.order_quantity}`,
        });
      }

      // Function to deduct from tblproduction
      const deductFromProduction = async (item) => {
        let remainingQuantity = item.order_quantity;

        while (remainingQuantity > 0) {
          const selectProductionQuery = `
          SELECT productionId, actualQuantityProduced
          FROM tblproduction
          WHERE itemId = ?
          AND actualQuantityProduced > 0
          ORDER BY productionId ASC
          LIMIT 1;
        `;

          const productionRow = await new Promise((resolve, reject) => {
            db.query(selectProductionQuery, [item.itemId], (err, rows) => {
              if (err) return reject(err);
              resolve(rows[0]); // Get the first row
            });
          });

          if (!productionRow) {
            console.warn(
              `No production record available to deduct for item ${item.item_name}`
            );
            break; // No more rows to deduct from
          }

          const { productionId, actualQuantityProduced } = productionRow;

          // Determine deduction amount
          const deduction = Math.min(remainingQuantity, actualQuantityProduced);
          remainingQuantity -= deduction;

          const updateProductionQuery = `
          UPDATE tblproduction
          SET actualQuantityProduced = actualQuantityProduced - ?
          WHERE productionId = ?;
        `;

          await new Promise((resolve, reject) => {
            db.query(
              updateProductionQuery,
              [deduction, productionId],
              (err, result) => {
                if (err) return reject(err);
                resolve(result);
              }
            );
          });

          console.log(
            `Deducted ${deduction} from productionId ${productionId}, remaining quantity: ${remainingQuantity}`
          );
        }

        if (remainingQuantity > 0) {
          console.warn(
            `Order quantity exceeds available production for item ${item.item_name}`
          );
          throw new Error(
            `Insufficient production for item ${item.item_name}, remaining quantity: ${remainingQuantity}`
          );
        }
      };

      // Step 3: Deduct quantities from tblitems and tblproduction
      const deductPromises = rows.map(async (item) => {
        // Deduct from tblitems
        const updateStockQuery = `
        UPDATE tblitems
        SET quantity = quantity - ?
        WHERE itemId = ?;
      `;

        await new Promise((resolve, reject) => {
          db.query(
            updateStockQuery,
            [item.order_quantity, item.itemId],
            (err) => {
              if (err) return reject(err);
              resolve();
            }
          );
        });

        // Deduct from tblproduction
        await deductFromProduction(item);
      });

      try {
        await Promise.all(deductPromises);

        // Step 4: Update the order status to "Preparing"
        const updateOrderQuery = `
        UPDATE tblorders_customer 
        SET status = "Preparing" 
        WHERE order_id = ?;
      `;

        db.query(updateOrderQuery, [orderId], (err, result) => {
          if (err) {
            console.error("Error updating order status:", err);
            return res.status(500).json({ message: "Internal server error" });
          }

          return res.status(200).json({
            status: "success",
            message: "Order set to Preparing and stock updated.",
          });
        });
      } catch (err) {
        console.error("Error during stock and production deduction:", err);
        return res
          .status(500)
          .json({ message: "Internal server error during stock update." });
      }
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ message: "Unexpected error occurred." });
  }
});

app.post("/api/decline_order/", async (req, res) => {
  const { orderId, remarks } = req.body;
  try {
    const query = `UPDATE tblorders_customer SET status = "Decline", remarks = ? WHERE order_id = ?`;
    await db.query(query, [remarks, orderId], (err, result) => {
      if (err) {
        console.error("Error executing query:", err);
        return res.status(500).json({ message: "Internal server error" });
      }

      return res.status(200).json({ status: "success", res: result });
    });
  } catch (error) {
    console.error("Error fetching customer name:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
//** ORDERS **/

//** PREPARING MODULE **//

// FETCH PREPARING ORDERS
app.get("/api/preparing_Orders/", (req, res) => {
  const sql = `SELECT DISTINCT *
              FROM tblorders_customer 
              WHERE status = "PREPARING" 
              GROUP BY order_id
              ORDER BY date DESC, order_id DESC;`;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching orders:", err);
      return res
        .status(500)
        .json({ status: "error", message: "Internal server error" });
    }

    if (!result || result.length === 0) {
      return res
        .status(200)
        .json({ status: "success", res: "No preparing orders found." });
    }

    const orders = [];

    // Use async function inside a loop to handle multiple queries
    const fetchProductsForOrder = (order) => {
      return new Promise((resolve, reject) => {
        const productSql = `SELECT *
                            FROM tblorders_customer 
                            WHERE order_id = ? 
                            ORDER BY order_id DESC;`;

        db.query(productSql, [order.order_id], (err, products) => {
          if (err) {
            return reject(err);
          }
          resolve({ ...order, products });
        });
      });
    };

    const fetchAllOrders = async () => {
      try {
        const ordersWithProducts = await Promise.all(
          result.map((order) => fetchProductsForOrder(order))
        );

        return res
          .status(200)
          .json({ status: "success", res: ordersWithProducts });
      } catch (err) {
        console.error("Error fetching products:", err);
        return res
          .status(500)
          .json({ status: "error", message: "Internal server error" });
      }
    };

    fetchAllOrders();
  });
});

//for updating status to PREPARED
app.post("/api/status_prepared/", async (req, res) => {
  const { orderId } = req.body;
  console.log(orderId);
  try {
    const query = `UPDATE tblorders_customer SET status = "Prepared" WHERE order_id = ?`;
    await db.query(query, [orderId], (err, result) => {
      if (err) {
        console.error("Error executing query:", err);
        return res.status(500).json({ message: "Internal server error" });
      }

      return res.status(200).json({ status: "success", res: result });
    });
  } catch (error) {
    console.error("Error fetching customer name:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
//* PREPARING MODULE **//

//* PREPARED MODULE **//
app.get("/api/prepared_Orders/", (req, res) => {
  const sql = `SELECT DISTINCT *
              FROM tblorders_customer 
              WHERE status = "PREPARED" 
              GROUP BY order_id
              ORDER BY date DESC, order_id DESC;`;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching orders:", err);
      return res
        .status(500)
        .json({ status: "error", message: "Internal server error" });
    }

    if (!result || result.length === 0) {
      return res
        .status(200)
        .json({ status: "success", res: "No prepared orders found." });
    }

    const orders = [];

    // Use async function inside a loop to handle multiple queries
    const fetchProductsForOrder = (order) => {
      return new Promise((resolve, reject) => {
        const productSql = `SELECT *
                            FROM tblorders_customer 
                            WHERE order_id = ? 
                            ORDER BY order_id DESC;`;

        db.query(productSql, [order.order_id], (err, products) => {
          if (err) {
            return reject(err);
          }
          resolve({ ...order, products });
        });
      });
    };

    const fetchAllOrders = async () => {
      try {
        const ordersWithProducts = await Promise.all(
          result.map((order) => fetchProductsForOrder(order))
        );

        return res
          .status(200)
          .json({ status: "success", res: ordersWithProducts });
      } catch (err) {
        console.error("Error fetching products:", err);
        return res
          .status(500)
          .json({ status: "error", message: "Internal server error" });
      }
    };

    fetchAllOrders();
  });
});

// FETCH ALL VEHICLE
app.get("/api/vehicle/", (req, res) => {
  const sql = `SELECT DISTINCT vehicle_type FROM tblvehicle WHERE vehicle_available = 1 ORDER BY vehicle_type `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching modes of payment:", err);
      return res
        .status(500)
        .json({ status: "error", message: "Internal server error" });
    }
    if (!result || result.length === 0) {
      return res
        .status(404)
        .json({ status: "error", res: "No riders available." });
    }
    return res.status(200).json({ status: "success", res: result });
  });
});

// FETCH AVAILABLE VEHICLE (SELECTED VEHICLE TYPE)
app.post("/api/avail_vehicles", async (req, res) => {
  const type = req.body.type;

  try {
    const query =
      "SELECT * FROM tblvehicle WHERE vehicle_type = ? AND vehicle_available = 1";
    db.query(query, [type], (err, result) => {
      if (err) {
        console.error(">>>", err);
        return res
          .status(500)
          .json({ status: "error", message: "Internal server error" });
      }
      if (!result || result.length === 0) {
        return res
          .status(404)
          .json({ status: "error", res: "No riders available." });
      }

      console.log(result);
      return res.status(200).json({ status: "success", res: result });
    });
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//for updating status to ready
app.post("/api/assign_courier/", async (req, res) => {
  const { orderId } = req.body;
  console.log(orderId);
  try {
    const query = `UPDATE tblorders_customer SET status = "READY" WHERE order_id = ?`;
    await db.query(query, [orderId], (err, result) => {
      if (err) {
        console.error("Error executing query:", err);
        return res.status(500).json({ message: "Internal server error" });
      }

      return res.status(200).json({ status: "success", res: result });
    });
  } catch (error) {
    console.error("Error fetching customer name:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//for updating status READY
app.post("/api/status_ready/", async (req, res) => {
  const { orderId, selectedVehicle } = req.body;

  try {
    const query = `UPDATE tblorders_customer SET status = "Ready" , vehicle_plate = ? WHERE order_id = ?`;
    await db.query(query, [selectedVehicle, orderId], (err, result) => {
      if (err) {
        console.error("Error executing query:", err);
        return res.status(500).json({ message: "Internal server error" });
      }

      return res.status(200).json({ status: "success", res: result });
    });
  } catch (error) {
    console.error("Error fetching customer name:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
//* PREPARED MODULE **//

//** READY TO GO MODULE *//

app.get("/api/courier_ready/", (req, res) => {
  const sql = `SELECT DISTINCT v.vehicle_plate, v.rider, v.vehicle_type, v.vehicle_available
              FROM tblorders_customer c
              JOIN tblvehicle v ON c.vehicle_plate = v.vehicle_plate
              WHERE c.status = "READY";`;

  db.query(sql, async (err, result) => {
    if (err) {
      console.error("Error fetching vehicles:", err);
      return res
        .status(500)
        .json({ status: "error", message: "Internal server error" });
    }

    if (!result || result.length === 0) {
      return res.status(200).json({
        status: "success",
        message: "No couriers are available to proceed.",
      });
    }

    try {
      // For each vehicle_plate, fetch the orders and associated products
      const ordersWithProducts = await Promise.all(
        result.map(async (vehicle) => {
          const orderSql = `SELECT DISTINCT order_id, customer_id, customer_loc, customer_name, total_sum_price
                            FROM tblorders_customer
                            WHERE vehicle_plate = ?
                            AND status = "READY"
                            ORDER BY order_id DESC`;

          const orders = await new Promise((resolve, reject) => {
            db.query(orderSql, [vehicle.vehicle_plate], (err, orders) => {
              if (err) {
                return reject(err);
              }
              resolve(orders);
            });
          });

          // Fetch products for each order
          const enrichedOrders = await Promise.all(
            orders.map(async (order) => {
              const productSql = `SELECT * 
                                  FROM tblorders_customer 
                                  WHERE order_id = ? 
                                  AND status = "READY"`;

              const products = await new Promise((resolve, reject) => {
                db.query(productSql, [order.order_id], (err, products) => {
                  if (err) {
                    return reject(err);
                  }
                  resolve(products);
                });
              });

              return {
                order_id: order.order_id,
                customer_id: order.customer_id,
                customer_loc: order.customer_loc,
                customer_name: order.customer_name,
                total_sum_price: order.total_sum_price,
                products,
              };
            })
          );

          // Add the enriched order data to the vehicle
          return {
            vehicle_plate: vehicle.vehicle_plate,
            rider: vehicle.rider,
            vehicle_type: vehicle.vehicle_type,
            vehicle_available: vehicle.vehicle_available,
            orders: enrichedOrders,
          };
        })
      );

      // Respond with the fully enriched data
      return res
        .status(200)
        .json({ status: "success", res: ordersWithProducts });
    } catch (err) {
      console.error("Error fetching orders/products:", err);
      return res
        .status(500)
        .json({ status: "error", message: "Internal server error" });
    }
  });
});

app.post("/api/status_transit/", async (req, res) => {
  const { plate } = req.body;

  const date_and_time = new Date();

  // Convert to Manila time (Asia/Manila timezone)
  const options = {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, // Use 24-hour format
  };

  const manilaTime = new Intl.DateTimeFormat("en-PH", options).format(
    date_and_time
  );

  // Manually replace the slashes (/) with hyphens (-) and remove the comma ","
  const formattedDateTime = manilaTime.replace(
    /(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2})/g,
    "$1-$2-$3 $4:$5"
  );

  try {
    // Update the status and set the current time in tblorders_customer
    const query1 = `
      UPDATE tblorders_customer 
      SET status = "Transit", time_out = ?
      WHERE vehicle_plate = ?`;

    await db.query(query1, [formattedDateTime, plate], (err, result1) => {
      if (err) {
        console.error("Error updating order status and time_out:", err);
        return res.status(500).json({ message: " Internal server error" });
      }

      // Update vehicle_available in tblvehicle
      const query2 = `UPDATE tblvehicle SET vehicle_available = 0 WHERE vehicle_plate = ?`;

      db.query(query2, [plate], (err, result2) => {
        if (err) {
          console.error("Error updating vehicle availability:", err);
          return res.status(500).json({ message: "Internal server error" });
        }

        return res.status(200).json({
          status: "success",
          message:
            "Order status, time_out, and vehicle availability updated successfully.",
        });
      });
    });
  } catch (error) {
    console.error("Error in status_transit API:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ** READY TO GO MODULE **//

// ** TRANSIT ** //

//fetch transit
app.get("/api/transit/", (req, res) => {
  const sql = `SELECT DISTINCT v.vehicle_plate, v.rider, v.vehicle_type, v.vehicle_available
              FROM tblorders_customer c
              JOIN tblvehicle v ON c.vehicle_plate = v.vehicle_plate
              WHERE c.status = "Transit";`;

  db.query(sql, async (err, result) => {
    if (err) {
      console.error("Error fetching vehicles:", err);
      return res
        .status(500)
        .json({ status: "error", message: "Internal server error" });
    }

    if (!result || result.length === 0) {
      return res
        .status(200)
        .json({ status: "success", message: "No transit orders found." });
    }

    try {
      // For each vehicle_plate, fetch the orders and associated products
      const ordersWithProducts = await Promise.all(
        result.map(async (vehicle) => {
          const orderSql = `SELECT DISTINCT order_id, customer_id, customer_loc, customer_name,total_sum_price, time_out, mop
                            FROM tblorders_customer
                            WHERE vehicle_plate = ?
                            AND status = "Transit"
                            ORDER BY order_id DESC`;

          const orders = await new Promise((resolve, reject) => {
            db.query(orderSql, [vehicle.vehicle_plate], (err, orders) => {
              if (err) {
                return reject(err);
              }
              resolve(orders);
            });
          });

          // Fetch products for each order
          const enrichedOrders = await Promise.all(
            orders.map(async (order) => {
              const productSql = `SELECT * 
                                  FROM tblorders_customer 
                                  WHERE order_id = ? 
                                  AND status = "Transit"`;

              const products = await new Promise((resolve, reject) => {
                db.query(productSql, [order.order_id], (err, products) => {
                  if (err) {
                    return reject(err);
                  }
                  resolve(products);
                });
              });

              return {
                order_id: order.order_id,
                mop: order.mop,
                customer_id: order.customer_id,
                customer_loc: order.customer_loc,
                customer_name: order.customer_name,
                total_sum_price: order.total_sum_price,
                time_out: order.time_out,
                products,
              };
            })
          );

          // Add the enriched order data to the vehicle
          return {
            vehicle_plate: vehicle.vehicle_plate,
            rider: vehicle.rider,
            vehicle_type: vehicle.vehicle_type,
            vehicle_available: vehicle.vehicle_available,
            orders: enrichedOrders,
          };
        })
      );

      // Respond with the fully enriched data
      return res
        .status(200)
        .json({ status: "success", res: ordersWithProducts });
    } catch (err) {
      console.error("Error fetching orders/products:", err);
      return res
        .status(500)
        .json({ status: "error", message: "Internal server error" });
    }
  });
});

//fetch done delivery
app.get("/api/returned_courier/", (req, res) => {
  const sql = `SELECT DISTINCT v.vehicle_plate, v.rider, v.vehicle_type, v.vehicle_available
              FROM tblorders_customer c
              JOIN tblvehicle v ON c.vehicle_plate = v.vehicle_plate
              WHERE c.status = "SALES";`;

  db.query(sql, async (err, result) => {
    if (err) {
      console.error("Error fetching vehicles:", err);
      return res
        .status(500)
        .json({ status: "error", message: "Internal server error" });
    }

    if (!result || result.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "No pending orders found." });
    }

    try {
      // For each vehicle_plate, fetch the orders and associated products
      const ordersWithProducts = await Promise.all(
        result.map(async (vehicle) => {
          const orderSql = `SELECT DISTINCT order_id, customer_loc, customer_name,total_sum_price, time_out, mop
                            FROM tblorders_customer
                            WHERE vehicle_plate = ?
                            AND status = "SALES"
                            ORDER BY order_id DESC`;

          const orders = await new Promise((resolve, reject) => {
            db.query(orderSql, [vehicle.vehicle_plate], (err, orders) => {
              if (err) {
                return reject(err);
              }
              resolve(orders);
            });
          });

          // Fetch products for each order
          const enrichedOrders = await Promise.all(
            orders.map(async (order) => {
              const productSql = `SELECT * 
                                  FROM tblorders_customer 
                                  WHERE order_id = ? 
                                  AND status = "SALES"`;

              const products = await new Promise((resolve, reject) => {
                db.query(productSql, [order.order_id], (err, products) => {
                  if (err) {
                    return reject(err);
                  }
                  resolve(products);
                });
              });

              return {
                order_id: order.order_id,
                mop: order.mop,
                customer_loc: order.customer_loc,
                customer_name: order.customer_name,
                total_sum_price: order.total_sum_price,
                time_out: order.time_out,
                products,
              };
            })
          );

          // Add the enriched order data to the vehicle
          return {
            vehicle_plate: vehicle.vehicle_plate,
            rider: vehicle.rider,
            vehicle_type: vehicle.vehicle_type,
            vehicle_available: vehicle.vehicle_available,
            orders: enrichedOrders,
          };
        })
      );

      // Respond with the fully enriched data
      return res
        .status(200)
        .json({ status: "success", res: ordersWithProducts });
    } catch (err) {
      console.error("Error fetching orders/products:", err);
      return res
        .status(500)
        .json({ status: "error", message: "Internal server error" });
    }
  });
});

app.post("/api/insertSales/", async (req, res) => {
  try {
    const { plate } = req.body;

    const date_and_time = new Date();

    // Convert to Manila time (Asia/Manila timezone)
    const options = {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // Use 24-hour format
    };

    const manilaTime = new Intl.DateTimeFormat("en-PH", options).format(
      date_and_time
    );

    // Manually replace the slashes (/) with hyphens (-) and remove the comma ","
    const formattedDateTime = manilaTime.replace(
      /(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2})/g,
      "$1-$2-$3 $4:$5"
    );

    if (!plate) {
      return res
        .status(400)
        .json({ status: "error", message: "Vehicle plate is required" });
    }

    const selectQuery =
      "SELECT * FROM tblorders_customer WHERE vehicle_plate = ?";
    const orders = await new Promise((resolve, reject) => {
      db.query(selectQuery, [plate], (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });

    if (orders.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No orders found for the given vehicle plate.",
      });
    }

    const insertQuery = "INSERT INTO tblsales SET ?";
    console.log("INSERTED: ", insertQuery);

    await Promise.all(
      orders.map((order) => {
        const {
          status,
          rider,
          vehicle_type,
          vehicle_available,
          remarks,
          ...ordersWithProducts
        } = order;

        ordersWithProducts.time_return = formattedDateTime;

        return new Promise((resolve, reject) => {
          db.query(insertQuery, ordersWithProducts, (err, result) => {
            if (err) {
              return reject(err);
            }
            resolve(result);
          });
        });
      })
    );

    const deleteQuery =
      "DELETE FROM tblorders_customer WHERE vehicle_plate = ?";
    await new Promise((resolve, reject) => {
      db.query(deleteQuery, [plate], (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });

    const updateQuery =
      "UPDATE tblvehicle SET vehicle_available = 1 WHERE vehicle_plate = ?";
    await new Promise((resolve, reject) => {
      db.query(updateQuery, [plate], (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });

    return res.status(200).json({ status: "success", message: "Orders done." });
  } catch (error) {
    console.error("Error inserting sales: ", error);
    return res.status(500).json({ status: "error", message: error.message });
  }
});

// Fetch courier done delivery
app.get("/api/fetchDoneCourier/", (req, res) => {
  const sql = `SELECT DISTINCT 
                ts.time_return, 
                ts.vehicle_plate, 
                tv.rider, 
                tv.vehicle_type
            FROM 
                tblsales ts
            JOIN 
                tblvehicle tv
            ON 
                ts.vehicle_plate = tv.vehicle_plate
            ORDER BY time_return DESC;`;

  db.query(sql, async (err, result) => {
    if (err) {
      console.error("Error fetching vehicles:", err);
      return res
        .status(500)
        .json({ status: "error", message: "Internal server error" });
    }

    if (!result || result.length === 0) {
      return res
        .status(200)
        .json({ status: "success", message: "No transit orders found." });
    }

    try {
      // For each distinct vehicle_plate and time_return, fetch the orders and products
      const ordersWithProducts = await Promise.all(
        result.map(async (vehicle) => {
          const orderSql = `SELECT DISTINCT order_id, customer_loc, customer_name, total_sum_price, time_out, time_return, mop
                            FROM tblsales
                            WHERE vehicle_plate = ? AND time_return = ?
                            ORDER BY order_id DESC`;

          const orders = await new Promise((resolve, reject) => {
            db.query(
              orderSql,
              [vehicle.vehicle_plate, vehicle.time_return],
              (err, orders) => {
                if (err) {
                  return reject(err);
                }
                resolve(orders);
              }
            );
          });

          // Fetch products for each order
          const enrichedOrders = await Promise.all(
            orders.map(async (order) => {
              const productSql = `SELECT * 
                                  FROM tblsales 
                                  WHERE order_id = ?`;

              const products = await new Promise((resolve, reject) => {
                db.query(productSql, [order.order_id], (err, products) => {
                  if (err) {
                    return reject(err);
                  }
                  resolve(products);
                });
              });

              return {
                order_id: order.order_id,
                mop: order.mop,
                customer_loc: order.customer_loc,
                customer_name: order.customer_name,
                total_sum_price: order.total_sum_price,
                time_out: order.time_out,
                products,
              };
            })
          );

          // Add the enriched order data to the vehicle
          return {
            vehicle_plate: vehicle.vehicle_plate,
            rider: vehicle.rider,
            vehicle_type: vehicle.vehicle_type,
            time_return: vehicle.time_return,
            orders: enrichedOrders,
          };
        })
      );

      // Respond with the fully enriched data
      return res
        .status(200)
        .json({ status: "success", res: ordersWithProducts });
    } catch (err) {
      console.error("Error fetching orders/products:", err);
      return res
        .status(500)
        .json({ status: "error", message: "Internal server error" });
    }
  });
});

// ** TRANSIT ** //

// ** SALES MODULE ** //

app.get("/api/sales_order/", (req, res) => {
  const sql = `SELECT DISTINCT *
              FROM tblsales 
              GROUP BY order_id
              ORDER BY time_return DESC, order_id DESC;
              `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching orders:", err);
      return res
        .status(500)
        .json({ status: "error", message: "Internal server error" });
    }

    if (!result || result.length === 0) {
      return res
        .status(200)
        .json({ status: "success", res: "No preparing orders found." });
    }

    const orders = [];

    // Use async function inside a loop to handle multiple queries
    const fetchProductsForOrder = (order) => {
      return new Promise((resolve, reject) => {
        const productSql = `SELECT *
                            FROM tblsales 
                            WHERE order_id = ? 
                            ORDER BY order_id DESC;`;

        db.query(productSql, [order.order_id], (err, products) => {
          if (err) {
            return reject(err);
          }
          resolve({ ...order, products });
        });
      });
    };

    const fetchAllOrders = async () => {
      try {
        const ordersWithProducts = await Promise.all(
          result.map((order) => fetchProductsForOrder(order))
        );

        return res
          .status(200)
          .json({ status: "success", res: ordersWithProducts });
      } catch (err) {
        console.error("Error fetching products:", err);
        return res
          .status(500)
          .json({ status: "error", message: "Internal server error" });
      }
    };

    fetchAllOrders();
  });
});

// ** SALES MODULE ** //

//DECLINE MODULE
app.get("/api/decline_orders/", (req, res) => {
  const sql = `SELECT DISTINCT *
              FROM tblorders_customer 
              WHERE status = "Decline" 
              GROUP BY order_id
              ORDER BY date DESC, order_id DESC;`;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching orders:", err);
      return res
        .status(500)
        .json({ status: "error", message: "Internal server error" });
    }

    if (!result || result.length === 0) {
      return res
        .status(200)
        .json({ status: "success", res: "No pending orders found." });
    }

    const orders = [];

    // Use async function inside a loop to handle multiple queries
    const fetchProductsForOrder = (order) => {
      return new Promise((resolve, reject) => {
        const productSql = `SELECT *
                            FROM tblorders_customer 
                            WHERE order_id = ? 
                            ORDER BY order_id DESC;`;

        db.query(productSql, [order.order_id], (err, products) => {
          if (err) {
            return reject(err);
          }
          resolve({ ...order, products });
        });
      });
    };

    const fetchAllOrders = async () => {
      try {
        const ordersWithProducts = await Promise.all(
          result.map((order) => fetchProductsForOrder(order))
        );

        return res
          .status(200)
          .json({ status: "success", res: ordersWithProducts });
      } catch (err) {
        console.error("Error fetching products:", err);
        return res
          .status(500)
          .json({ status: "error", message: "Internal server error" });
      }
    };

    fetchAllOrders();
  });
});

//CANCELLED MODULE
app.get("/api/cancelled_orders/", (req, res) => {
  const sql = `SELECT DISTINCT *
              FROM tblorders_customer 
              WHERE status = "Cancelled" 
              GROUP BY order_id
              ORDER BY date DESC, order_id DESC;`;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching orders:", err);
      return res
        .status(500)
        .json({ status: "error", message: "Internal server error" });
    }

    if (!result || result.length === 0) {
      return res
        .status(200)
        .json({ status: "success", res: "No pending orders found." });
    }

    const orders = [];

    // Use async function inside a loop to handle multiple queries
    const fetchProductsForOrder = (order) => {
      return new Promise((resolve, reject) => {
        const productSql = `SELECT *
                            FROM tblorders_customer 
                            WHERE order_id = ? 
                            ORDER BY order_id DESC;`;

        db.query(productSql, [order.order_id], (err, products) => {
          if (err) {
            return reject(err);
          }
          resolve({ ...order, products });
        });
      });
    };

    const fetchAllOrders = async () => {
      try {
        const ordersWithProducts = await Promise.all(
          result.map((order) => fetchProductsForOrder(order))
        );

        return res
          .status(200)
          .json({ status: "success", res: ordersWithProducts });
      } catch (err) {
        console.error("Error fetching products:", err);
        return res
          .status(500)
          .json({ status: "error", message: "Internal server error" });
      }
    };

    fetchAllOrders();
  });
});

/* NOTIFICATION */
app.get("/api/fetch_notif", (req, res) => {
  const sql = `SELECT *
  FROM tblnotifications 
  WHERE account_notif = 3
  ORDER BY id DESC;`;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error occured (api/fetch_notif): ", err);
      return res
        .status(500)
        .json({ status: "error", message: "Internal server error" });
    }

    if (!result || result.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "No notification found." });
    }
    return res.status(200).json({ status: "success", res: result });
  });
});

app.post("/api/mark-as-read-notif", (req, res) => {
  const { id } = req.body;

  // Update the status of the notification to 1 (read)
  const query = `UPDATE tblnotifications SET status = 1 WHERE id = ?`;

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error marking notification as read:", err);
      return res
        .status(500)
        .json({ error: "Failed to update notification status." });
    }

    return res.status(200).json({ message: "Notification marked as read." });
  });
});

app.post("/api/insert_notif/", (req, res) => {
  const { orderId, userId } = req.body;
  console.log("INSERT NOTIF: ", orderId, userId);

  const description = `Order Accepted (${orderId})`;
  const status = 0;
  const account_notif = 4;

  try {
    const query = `INSERT INTO 
    tblnotifications (description, status, account_notif, customer_id) 
    VALUES 
    (?, ?, ?, ?)`;

    db.query(
      query,
      [description, status, account_notif, userId],
      (err, result) => {
        if (err) {
          console.error("Error occured (/insert_notif): ", err);
          return res.status(500).json({ message: "Internal server error" });
        }

        return res.status(200).json({
          status: "success",
          message: "Notification inserted successfully",
          data: {
            id: result.insertId,
            affectedRows: result.affectedRows,
          },
        });
      }
    );
  } catch (error) {
    console.error("Error occured (/insert_notif): ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/insert_notif_decline/", (req, res) => {
  const { orderId, userId } = req.body;
  console.log("INSERT NOTIF: ", orderId, userId);

  const description = `Sorry, your order ${orderId} was declined.`;
  const status = 0;
  const account_notif = 4;

  try {
    const query = `INSERT INTO 
    tblnotifications (description, status, account_notif, customer_id) 
    VALUES 
    (?, ?, ?, ?)`;

    db.query(
      query,
      [description, status, account_notif, userId],
      (err, result) => {
        if (err) {
          console.error("Error occured (/insert_notif_decline): ", err);
          return res.status(500).json({ message: "Internal server error" });
        }

        return res.status(200).json({
          status: "success",
          data: {
            id: result.insertId,
            affectedRows: result.affectedRows,
          },
        });
      }
    );
  } catch (error) {
    console.error("Error occured (/insert_notif_decline): ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/insert_notif_transit/", (req, res) => {
  const orders = req.body; // Array of orders
  console.log("Received orders:", orders);

  try {
    const query = `INSERT INTO tblnotifications (description, status, account_notif, customer_id) VALUES (?, ?, ?, ?)`;

    // Loop through all orders and insert them into the database
    const insertPromises = orders.map((order) => {
      const description = `Your order is on the way (${order.order_id}).`;
      const status = 0; // Example status
      const account_notif = 4; // Example account notification ID

      // Insert each order into the database
      return new Promise((resolve, reject) => {
        db.query(
          query,
          [description, status, account_notif, order.customer_id],
          (err, result) => {
            if (err) {
              console.error("Error inserting order:", err);
              reject(err); // Reject if there's an error
            } else {
              resolve(result); // Resolve if the insertion is successful
            }
          }
        );
      });
    });

    // Wait for all insertions to complete
    Promise.all(insertPromises)
      .then((results) => {
        // After all inserts are done, send the response
        res.status(200).json({
          status: "success",
          data: {
            affectedRows: results.length, // Total number of affected rows
          },
        });
      })
      .catch((error) => {
        // If any insert failed, handle the error
        res.status(500).json({ message: "Error inserting data", error });
      });
  } catch (error) {
    console.error("Error occurred:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/insert_notif_done/", (req, res) => {
  const orders = req.body; // Array of orders
  console.log("NOTIF DONE: ",orders);

  try {
    const query = `INSERT INTO tblnotifications (description, status, account_notif, customer_id) VALUES (?, ?, ?, ?)`;

    // Loop through all orders and insert them into the database
    const insertPromises = orders.map((order) => {
      const description = `Order completed (${order.order_id}), Thanks for the order!`;
      const status = 0; // Example status
      const account_notif = 4; // Example account notification ID

      // Insert each order into the database
      return new Promise((resolve, reject) => {
        db.query(
          query,
          [description, status, account_notif, order.customer_id],
          (err, result) => {
            if (err) {
              console.error("Error inserting order:", err);
              reject(err); // Reject if there's an error
            } else {
              resolve(result); // Resolve if the insertion is successful
            }
          }
        );
      });
    });

    // Wait for all insertions to complete
    Promise.all(insertPromises)
      .then((results) => {
        // After all inserts are done, send the response
        res.status(200).json({
          status: "success",
          data: {
            affectedRows: results.length, // Total number of affected rows
          },
        });
      })
      .catch((error) => {
        // If any insert failed, handle the error
        res.status(500).json({ message: "Error inserting data", error });
      });
  } catch (error) {
    console.error("Error occurred:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

/*
SALES
*/
/*
CUSTOMER
*/

//FETCH MODE OF PAYMENT TABLE
app.get("/api/fetchmop/", (req, res) => {
  const sql = `SELECT * FROM tbl_mop`;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching modes of payment:", err);
      return res
        .status(500)
        .json({ status: "error", message: "Internal server error" });
    }
    if (!result || result.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "No modes of payment found." });
    }
    return res.status(200).json({ status: "success", res: result });
  });
});

app.get("/api/api-get-customer-info/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const sql = `
  SELECT c.name, c.location
  FROM tblusers u 
  LEFT JOIN tblcustomer c ON c.customer_id = u.id 
  WHERE u.id = '${userId}'
`;
    await db.query(sql, (err, result) => {
      return res.status(200).json({ status: "success", res: result[0] });
    });
  } catch (error) {
    console.error("Error fetching customer name:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/api-items", async (req, res) => {
  try {
    const sql = `SELECT * FROM tblitems WHERE quantity != 0`;
    await db.query(sql, (err, result) => {
      return res.status(200).json({ status: "success", res: result });
    });
  } catch (error) {
    console.error("Error fetching customer name:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/api-insert-to-cart", async (req, res) => {
  const isOrdered = "0";
  const {
    selectedProduct,
    itemName,
    price,
    description,
    quantity,
    totalPrice,
    customerId,
    customerName,
    customerLoc,
  } = req.body;

  // if (
  //   !itemId ||
  //   !itemName ||
  //   !price ||
  //   !description ||
  //   !quantity ||
  //   !totalPrice
  // ) {
  //   return res.status(400).json({ message: "All fields are required." });
  // }
  try {
    const sql = `INSERT INTO tblcart 
    (item_id, item_name, price, description, qty, total_price, isOrdered, customer_id, customer_name, customer_loc) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    await db.query(
      sql,
      [
        selectedProduct,
        itemName,
        price,
        description,
        quantity,
        totalPrice,
        isOrdered,
        customerId,
        customerName,
        customerLoc,
      ],
      (err, result) => {
        if (err) {
          return res.status(500).json({ message: err });
        }

        return res.status(200).json({
          message: "Added to cart successfully.",
          status: "success",
          res: result,
        });
      }
    );
  } catch (error) {
    console.error("Error fetching customer name:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/mycart/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const sql = `SELECT item_id, item_name, description, price, 
    SUM(qty) AS qty,
    SUM(total_price) AS total_price
    FROM tblcart 
    WHERE isOrdered = "0" 
    AND customer_id = ${userId} 
    GROUP BY item_name, price;`;

    await db.query(sql, (err, result) => {
      return res.status(200).json({ status: "success", res: result });
    });
  } catch (error) {
    console.error("Error fetching customer name:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//REMOVE ITEM IN CART
// DELETE Route to delete an item using request body
app.delete("/api/remove-prod-cart", async (req, res) => {
  const { item_id, user_id } = req.body; // get item_id and user_id

  try {
    const query = `DELETE FROM tblcart WHERE item_id = ? AND customer_id = ?`; // Parameterized query
    await db.query(query, [item_id, user_id], (err, result) => {
      // console.log(err);
      if (err) {
        return res.status(500).json({
          status: "failed",
          message: "Error removing product from cart",
        });
      }
      return res
        .status(200)
        .json({ status: "success", message: "Product removed from cart" });
    });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//checkout
app.post("/api/checkout_cus", async (req, res) => {
  const {
    userId,
    payment,
    refNo,
    cartItems,
    totalSum,
    customerId,
    customerName,
    customerLoc,
  } = req.body;

  // Validate required fields
  if (!userId || !cartItems || cartItems.length === 0) {
    return res.status(400).json({ message: "Invalid data provided." });
  }

  // Check if payment method exists in tbl_mop
  const checkPaymentSql = `SELECT * FROM tbl_mop WHERE mop = ?`;

  try {
    db.query(checkPaymentSql, [payment], (err, rows) => {
      if (err) {
        console.error("Error checking payment method:", err);
        return res.status(500).json({ message: "Internal server error." });
      }

      if (rows.length === 0) {
        console.log("Invalid mode of payment.");
        return res.status(400).json({ message: "Invalid mode of payment." });
      }

      const paymentInfo = rows[0]; // Assume one row matches the query

      // If attached_file is 0, allow refNo to be null or empty
      if (paymentInfo.attach_file === 0 && (!refNo || refNo.trim() === "")) {
        console.log(
          "Reference number validation skipped due to payment method settings."
        );

        // Proceed with order insertion
        insertOrder(
          cartItems,
          payment,
          null,
          totalSum,
          customerId,
          customerName,
          customerLoc,
          res
        );
      } else {
        // Validate refNo only if attached_file is not 0
        const checkRefNoSql = `SELECT * FROM tblorders_customer WHERE ref_no = ?`;

        db.query(checkRefNoSql, [refNo], async (err, rows) => {
          if (err) {
            console.error("Error checking refNo:", err);
            return res.status(500).json({ message: "Internal server error." });
          }

          if (rows.length > 0) {
            return res.status(400).json({
              message:
                "Reference number already used. Please use a different one.",
            });
          }

          // Proceed with order insertion as refNo is valid
          insertOrder(
            cartItems,
            payment,
            refNo,
            totalSum,
            customerId,
            customerName,
            customerLoc,
            res
          );
        });
      }
    });
  } catch (error) {
    console.error("Error during checkout:", error);
    res.status(500).json({ message: "Checkout failed. Please try again." });
  }

  // Helper function to handle order insertion
  function insertOrder(
    cartItems,
    payment,
    refNo,
    totalSum,
    customerId,
    customerName,
    customerLoc,
    res
  ) {
    const order_id = `ORD-${Date.now()}`;
    const currentDate = new Date()
      .toLocaleDateString("en-PH", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\//g, "-");
    const defaultStatus = "Pending";

    const insertOrderPromises = cartItems.map((item) => {
      const sql = `
    INSERT INTO tblorders_customer (
      order_id,
      mop,
      ref_no,
      itemId,
      item_name,
      description,
      price,
      quantity,
      total_price,
      total_sum_price,
      status,
      date,
      customer_id,
      customer_name,
      customer_loc
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
      return new Promise((resolve, reject) => {
        db.query(
          sql,
          [
            order_id,
            payment,
            refNo,
            item.item_id,
            item.item_name,
            item.description,
            item.price,
            item.qty,
            item.total_price,
            totalSum,
            defaultStatus,
            currentDate,
            customerId,
            customerName,
            customerLoc,
          ],
          (err, result) => {
            if (err) {
              reject("Error inserting order: " + err);
            } else {
              resolve(result);
            }
          }
        );
      });
    });

    Promise.all(insertOrderPromises)
      .then(() => {
        const description = `New order place (${order_id}).`;
        const status = 0;
        const account_notif = 3;

        const insertToNotif = `INSERT INTO tblnotifications (description, status, account_notif, customer_id)
        VALUES (?, ?, ?, ?)`;

        db.query(
          insertToNotif,
          [description, status, account_notif, customerId],
          (err, result) => {
            if (err) {
              console.error("Error inserting notification:", err);
            } else {
              console.log("Notification inserted successfully:", result);
            }
          }
        );

        const clearCartSql = `DELETE FROM tblcart WHERE customer_id = ?`;
        db.query(clearCartSql, [customerId], (err) => {
          if (err) {
            console.error("Error clearing cart:", err);
          }
        });

        res.status(200).json({ message: "Order placed successfully." });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).json({ message: "Failed to place order." });
      });
  }
});

//fetch orders of customer (tblorder_customer) PENDING AND COMPLETED
app.get("/api/orders_customer/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const sql = `SELECT DISTINCT *
    FROM tblorders_customer
    WHERE customer_id = ${userId} 
      AND status NOT IN ('Cancelled', 'Decline')
    GROUP BY order_id
    ORDER BY date DESC, order_id DESC;
    `;

    db.query(sql, (err, result) => {
      if (err) {
        console.error("Error fetching orders:", err);
        return res
          .status(500)
          .json({ status: "error", message: "Internal server error" });
      }

      if (!result || result.length === 0) {
        return res
          .status(200)
          .json({ status: "success", res: "No pending orders found." });
      }

      const orders = [];

      // Use async function inside a loop to handle multiple queries
      const fetchProductsForOrder = (order) => {
        return new Promise((resolve, reject) => {
          const productSql = `SELECT *
                FROM tblorders_customer 
                WHERE order_id = ? 
                ORDER BY order_id DESC;`;

          db.query(productSql, [order.order_id], (err, products) => {
            if (err) {
              return reject(err);
            }
            resolve({ ...order, products });
          });
        });
      };

      const fetchAllOrders = async () => {
        try {
          const ordersWithProducts = await Promise.all(
            result.map((order) => fetchProductsForOrder(order))
          );

          return res
            .status(200)
            .json({ status: "success", res: ordersWithProducts });
        } catch (err) {
          console.error("Error fetching products:", err);
          return res
            .status(500)
            .json({ status: "error", message: "Internal server error" });
        }
      };

      fetchAllOrders();
    });
  } catch (error) {
    console.error("Error fetching customer name:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/orders_customer_cancelled/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const sql = `SELECT DISTINCT order_id, mop, ref_no, total_sum_price, status, date 
                FROM tblorders_customer 
                WHERE customer_id = ${userId} 
                AND status = "Cancelled"
                ORDER BY order_id ASC;`;

    await db.query(sql, (err, result) => {
      return res.status(200).json({ status: "success", res: result });
    });
  } catch (error) {
    console.error("Error fetching customer name:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// fetch products of order
app.get("/api/orders_products/:userId", (req, res) => {
  const { userId } = req.body;

  const sql = `SELECT DISTINCT *
  FROM tblorders_customer 
  WHERE status = "PENDING" 
  GROUP BY order_id
  ORDER BY date DESC, order_id DESC;`;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching orders:", err);
      return res
        .status(500)
        .json({ status: "error", message: "Internal server error" });
    }

    if (!result || result.length === 0) {
      return res
        .status(200)
        .json({ status: "success", res: "No pending orders found." });
    }

    const orders = [];

    // Use async function inside a loop to handle multiple queries
    const fetchProductsForOrder = (order) => {
      return new Promise((resolve, reject) => {
        const productSql = `SELECT *
                FROM tblorders_customer 
                WHERE order_id = ? 
                ORDER BY order_id DESC;`;

        db.query(productSql, [order.order_id], (err, products) => {
          if (err) {
            return reject(err);
          }
          resolve({ ...order, products });
        });
      });
    };

    const fetchAllOrders = async () => {
      try {
        const ordersWithProducts = await Promise.all(
          result.map((order) => fetchProductsForOrder(order))
        );

        return res
          .status(200)
          .json({ status: "success", res: ordersWithProducts });
      } catch (err) {
        console.error("Error fetching products:", err);
        return res
          .status(500)
          .json({ status: "error", message: "Internal server error" });
      }
    };

    fetchAllOrders();
  });
});

//fetch completed orders
app.get("/api/completed_orders/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const sql = `SELECT DISTINCT *
    FROM tblsales
    WHERE customer_id = ${userId} 
    GROUP BY order_id
    ORDER BY date DESC, order_id DESC;
    `;

    db.query(sql, (err, result) => {
      if (err) {
        console.error("Error fetching orders:", err);
        return res
          .status(500)
          .json({ status: "error", message: "Internal server error" });
      }

      if (!result || result.length === 0) {
        return res
          .status(200)
          .json({ status: "success", res: "No pending orders found." });
      }

      const orders = [];

      // Use async function inside a loop to handle multiple queries
      const fetchProductsForOrder = (order) => {
        return new Promise((resolve, reject) => {
          const productSql = `SELECT *
                FROM tblsales 
                WHERE order_id = ? 
                ORDER BY order_id DESC;`;

          db.query(productSql, [order.order_id], (err, products) => {
            if (err) {
              return reject(err);
            }
            resolve({ ...order, products });
          });
        });
      };

      const fetchAllOrders = async () => {
        try {
          const ordersWithProducts = await Promise.all(
            result.map((order) => fetchProductsForOrder(order))
          );

          return res
            .status(200)
            .json({ status: "success", res: ordersWithProducts });
        } catch (err) {
          console.error("Error fetching products:", err);
          return res
            .status(500)
            .json({ status: "error", message: "Internal server error" });
        }
      };

      fetchAllOrders();
    });
  } catch (error) {
    console.error("Error fetching customer name:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//fetch deline orders
app.get("/api/decline_orders/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const sql = `SELECT DISTINCT *
    FROM tblorders_customer
    WHERE customer_id = ${userId} 
      AND status = 'Decline'
    GROUP BY order_id
    ORDER BY date DESC, order_id DESC;
    `;

    db.query(sql, (err, result) => {
      if (err) {
        console.error("Error fetching orders:", err);
        return res
          .status(500)
          .json({ status: "error", message: "Internal server error" });
      }

      if (!result || result.length === 0) {
        return res
          .status(200)
          .json({ status: "success", res: "No pending orders found." });
      }

      const orders = [];

      // Use async function inside a loop to handle multiple queries
      const fetchProductsForOrder = (order) => {
        return new Promise((resolve, reject) => {
          const productSql = `SELECT *
                FROM tblorders_customer 
                WHERE order_id = ? 
                ORDER BY order_id DESC;`;

          db.query(productSql, [order.order_id], (err, products) => {
            if (err) {
              return reject(err);
            }
            resolve({ ...order, products });
          });
        });
      };

      const fetchAllOrders = async () => {
        try {
          const ordersWithProducts = await Promise.all(
            result.map((order) => fetchProductsForOrder(order))
          );

          return res
            .status(200)
            .json({ status: "success", res: ordersWithProducts });
        } catch (err) {
          console.error("Error fetching products:", err);
          return res
            .status(500)
            .json({ status: "error", message: "Internal server error" });
        }
      };

      fetchAllOrders();
    });
  } catch (error) {
    console.error("Error fetching customer name:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// fetch cancelled orders
app.get("/api/cancelled_orders/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const sql = `SELECT DISTINCT *
    FROM tblorders_customer
    WHERE customer_id = ${userId} 
      AND status = 'Cancelled'
    GROUP BY order_id
    ORDER BY date DESC, order_id DESC;
    `;

    db.query(sql, (err, result) => {
      if (err) {
        console.error("Error fetching orders:", err);
        return res
          .status(500)
          .json({ status: "error", message: "Internal server error" });
      }

      if (!result || result.length === 0) {
        return res
          .status(200)
          .json({ status: "success", res: "No pending orders found." });
      }

      const orders = [];

      // Use async function inside a loop to handle multiple queries
      const fetchProductsForOrder = (order) => {
        return new Promise((resolve, reject) => {
          const productSql = `SELECT *
                FROM tblorders_customer 
                WHERE order_id = ? 
                ORDER BY order_id DESC;`;

          db.query(productSql, [order.order_id], (err, products) => {
            if (err) {
              return reject(err);
            }
            resolve({ ...order, products });
          });
        });
      };

      const fetchAllOrders = async () => {
        try {
          const ordersWithProducts = await Promise.all(
            result.map((order) => fetchProductsForOrder(order))
          );

          return res
            .status(200)
            .json({ status: "success", res: ordersWithProducts });
        } catch (err) {
          console.error("Error fetching products:", err);
          return res
            .status(500)
            .json({ status: "error", message: "Internal server error" });
        }
      };

      fetchAllOrders();
    });
  } catch (error) {
    console.error("Error fetching customer name:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/cancelling_order/", async (req, res) => {
  const { orderId, remarks } = req.body;
  try {
    const query = `UPDATE tblorders_customer SET status = "Cancelled", remarks = ? WHERE order_id = ?`;
    await db.query(query, [remarks, orderId], (err, result) => {
      if (err) {
        console.error("Error executing query:", err);
        return res.status(500).json({ message: "Internal server error" });
      }

      return res.status(200).json({ status: "success", res: result });
    });
  } catch (error) {
    console.error("Error fetching customer name:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//fetch notif customer
app.post("/api/fetch_notif_customer", async (req, res) => {
  const { userId } = req.body;

  const sql = `SELECT * FROM tblnotifications 
  WHERE customer_id = ? AND account_notif = 4
  ORDER BY id DESC;`;

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error("Error fetching orders:", err);
      return res
        .status(500)
        .json({ status: "error", message: "Internal server error" });
    }

    if (!result || result.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "No notification found." });
    }
    return res.status(200).json({ status: "success", res: result });
  });
});

app.post("/api/order_addNotif", async (req, res) => {});

/*
CUSTOMER
*/
/*
REPORTS
*/

app.get("/api/reports", (req, res) => {
  const { reportType, startDate, endDate } = req.query;

  let sql = "";
  switch (reportType) {
    case "product":
      sql = `
      SELECT 
        it.itemId AS ID, 
        it.itemName AS PRODUCT, 
        it.price AS PRICE, 
        it.category AS CATEGORY, 
        it.description AS DESCRIPTION, 
        COALESCE(SUM(p.actualQuantityProduced), 0) AS QUANTITY,
        CAST(DATE_FORMAT(p.productionDate, '%Y-%m-%d') AS CHAR) AS DATE  
      FROM 
        tblitems it
      LEFT JOIN 
        tblproduction p ON it.itemId = p.itemId
      ${
        startDate && endDate
          ? `WHERE p.productionDate BETWEEN '${startDate}' AND '${endDate}'`
          : ""
      }
      GROUP BY 
        it.itemId
      ORDER BY DATE DESC;
    `;
      break;

    case "rawMaterials":
      sql = `
      SELECT 
        raw.matId AS ID,
        raw.matName AS MATERIAL, 
        raw.category AS CATEGORY, 
        COALESCE(SUM(odi.remaining_quantity), 0) AS QUANTITY,
        CAST(DATE_FORMAT(odi.dateReceive, '%Y-%m-%d') AS CHAR) AS DATE  
      FROM tblrawmats raw
      LEFT JOIN tblorderfromsupplier_items odi ON raw.matId = odi.matId
      ${
        startDate && endDate
          ? `WHERE odi.dateReceive BETWEEN '${startDate}' AND '${endDate}'`
          : ""
      }
      GROUP BY raw.matName, raw.category, raw.matId
      ORDER BY DATE DESC;
    `;
      break;

    case "documents":
      sql = `
      SELECT 
        d.documentName AS DOCUMENT, 
        d.category AS CATEGORY,  
        d.description AS DESCRIPTION, 
        CAST(DATE_FORMAT(d.dateEffective, '%Y-%m-%d') AS CHAR) AS EFFECTIVITY,  
        CAST(DATE_FORMAT(d.expirationDate, '%Y-%m-%d') AS CHAR) AS EXPIRATION,  
        CASE 
            WHEN d.expirationDate IS NULL THEN 'No Expiration Date'
            WHEN d.expirationDate < CURDATE() THEN 'Expired'
            WHEN TIMESTAMPDIFF(MONTH, CURDATE(), d.expirationDate) <= 3 THEN CONCAT(TIMESTAMPDIFF(MONTH, CURDATE(), d.expirationDate), ' months left')
            ELSE CONCAT(TIMESTAMPDIFF(MONTH, CURDATE(), d.expirationDate), ' months left')
        END AS VALIDITY
      FROM 
        tbldocument d
      ${
        startDate && endDate
          ? `WHERE d.expirationDate BETWEEN '${startDate}' AND '${endDate}'`
          : ""
      }
      ORDER BY 
        d.expirationDate DESC;
    `;
      break;

    case "sales":
      sql = `
        SELECT 
          sl.order_id AS ID, 
          sl.customer_name AS CUSTOMER, 
          sl.customer_loc AS LOCATION, 
          sl.item_name AS ITEM,   
          sl.total_price AS TOTAL,
          sl.mop AS MOP,  
          sl.date AS DATE 
        FROM tblsales sl
        ${
          startDate && endDate
            ? `WHERE STR_TO_DATE(sl.date, '%m-%d-%Y') BETWEEN '${startDate}' AND '${endDate}'`
            : ""
        }
        ORDER BY sl.order_id DESC;
      `;
      break;

    default:
      return res.status(400).send("Invalid report type");
  }

  db.query(sql, (err, results) => {
    if (err) {
      console.error(`Error fetching ${reportType} data:`, err);
      return res.status(500).send("Error fetching report data");
    }

    res.json(results);
  });
});

// app.get("/api/reports", (req, res) => {
//   const { reportType, startDate, endDate } = req.query;

//   if (!startDate || !endDate) {
//     return res.status(400).send("Start date and end date are required.");
//   }

//   let sql = "";
//   switch (reportType) {
//     case "product":
//       sql = `
//         SELECT
//           it.itemId AS ID,
//           it.itemName AS PRODUCT,
//           it.price AS PRICE,
//           it.category AS CATEGORY,
//           it.description AS DESCRIPTION,
//           COALESCE(SUM(p.actualQuantityProduced), 0) AS QUANTITY,
//           DATE(p.productionDate) AS DATE
//         FROM tblitems it
//         LEFT JOIN tblproduction p ON it.itemId = p.itemId
//         WHERE p.productionDate BETWEEN ? AND ?
//         GROUP BY it.itemId
//         ORDER BY DATE DESC;
//       `;
//       break;

//     case "rawMaterials":
//       sql = `
//         SELECT
//           raw.matId AS ID,
//           raw.matName AS MATERIAL,
//           raw.category AS CATEGORY,
//           COALESCE(SUM(odi.remaining_quantity), 0) AS QUANTITY,
//           DATE(odi.dateReceive) AS DATE
//         FROM tblrawmats raw
//         LEFT JOIN tblorderfromsupplier_items odi ON raw.matId = odi.matId
//         WHERE odi.dateReceive BETWEEN ? AND ?
//         GROUP BY raw.matId
//         ORDER BY DATE DESC;
//       `;
//       break;

//     case "documents":
//       sql = `
//         SELECT
//           d.documentName AS DOCUMENT,
//           d.category AS CATEGORY,
//           d.description AS DESCRIPTION,
//           DATE(d.dateEffective) AS EFFECTIVITY,
//           DATE(d.expirationDate) AS EXPIRATION,
//           CASE
//               WHEN d.expirationDate IS NULL THEN 'No Expiration Date'
//               WHEN d.expirationDate < CURDATE() THEN 'Expired'
//               WHEN TIMESTAMPDIFF(MONTH, CURDATE(), d.expirationDate) <= 3 THEN CONCAT(TIMESTAMPDIFF(MONTH, CURDATE(), d.expirationDate), ' months left')
//               ELSE CONCAT(TIMESTAMPDIFF(MONTH, CURDATE(), d.expirationDate), ' months left')
//           END AS VALIDITY
//         FROM tbldocument d
//         WHERE d.dateEffective BETWEEN ? AND ?
//         ORDER BY d.expirationDate DESC;
//       `;
//       break;

//     case "sales":
//       sql = `
//         SELECT
//           sl.order_id AS ID,
//           sl.customer_name AS CUSTOMER,
//           sl.customer_loc AS LOCATION,
//           sl.item_name AS ITEM,
//           sl.total_price AS TOTAL,
//           sl.mop AS MOP,
//           DATE(sl.date) AS DATE
//         FROM tblsales sl
//         WHERE sl.date BETWEEN ? AND ?
//         ORDER BY sl.order_id DESC;
//       `;
//       break;

//     default:
//       return res.status(400).send("Invalid report type.");
//   }

//   db.query(sql, [startDate, endDate], (err, results) => {
//     if (err) {
//       console.error(`Error fetching ${reportType} data:`, err);
//       return res.status(500).send("Error fetching report data.");
//     }

//     res.json(results);
//   });
// });

/* COURIER SA SYSTEM ADMIN */
app.get("/api/get_couriers/", async (req, res) => {
  try {
    const sql = `SELECT *
    FROM tblvehicle
    ORDER BY rider ASC;
    `;

    db.query(sql, (err, result) => {
      if (err) {
        console.error("Error fetching couriers:", err);
        return res
          .status(500)
          .json({ status: "error", message: "Internal server error" });
      }

      if (!result || result.length === 0) {
        return res
          .status(200)
          .json({ status: "success", res: "No couriers found." });
      }

      return res.status(200).json({ status: "success", res: result });
    });
  } catch (error) {
    console.error("Error fetching couriers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//add courier
app.post("/api/add-vehicle", (req, res) => {
  const { rider, vehicle_type, vehicle_plate } = req.body;

  // Check if the vehicle_plate exists
  const checkQuery = "SELECT * FROM tblvehicle WHERE vehicle_plate = ?";
  db.query(checkQuery, [vehicle_plate], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error." });
    }

    if (results.length > 0) {
      return res
        .status(400)
        .json({ status: "error", message: "Vehicle already exists." });
    }

    // Insert new vehicle
    const insertQuery = `
    INSERT INTO tblvehicle (vehicle_plate, rider, vehicle_type, vehicle_available)
    VALUES (?, ?, ?, 1)
  `;

    db.query(
      insertQuery,
      [vehicle_plate, rider, vehicle_type],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Failed to add vehicle." });
        }

        return res.status(201).json({ message: "Courier added successfully." });
      }
    );
  });
});

//edit courier

app.put("/api/edit-vehicle", (req, res) => {
  const { rider, vehicle_type, vehicle_plate, original_plate } = req.body;

  // Only check for duplicate vehicle plate if the plate is being changed
  if (vehicle_plate !== original_plate) {
    const checkQuery = "SELECT * FROM tblvehicle WHERE vehicle_plate = ?";
    db.query(checkQuery, [vehicle_plate], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database error." });
      }

      // If the new vehicle plate already exists, send an error
      if (results.length > 0) {
        return res
          .status(400)
          .json({ message: "Vehicle plate already exists." });
      }

      // If no duplicate, proceed to update the vehicle
      updateVehicle();
    });
  } else {
    // If the vehicle plate has not changed, directly proceed to update
    updateVehicle();
  }

  // Function to update vehicle details
  function updateVehicle() {
    const updateQuery = `
    UPDATE tblvehicle
    SET rider = ?, vehicle_type = ?
    WHERE vehicle_plate = ?
  `;

    db.query(
      updateQuery,
      [rider, vehicle_type, original_plate],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Failed to update vehicle." });
        }

        return res
          .status(200)
          .json({ message: "Vehicle updated successfully." });
      }
    );
  }
});

//delete courier
app.delete("/api/delete-vehicle", (req, res) => {
  const { vehicle_plate } = req.body;

  const deleteQuery = "DELETE FROM tblvehicle WHERE vehicle_plate = ?";

  db.query(deleteQuery, [vehicle_plate], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error." });
    }

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: "Vehicle not found." });
    }

    return res.status(200).json({ message: "Vehicle deleted successfully." });
  });
});

/* COURIER SA SYSTEM ADMIN */

/* MOP SA SYSTEM ADMIN */
app.get("/api/get_mop/", async (req, res) => {
  try {
    const sql = `SELECT *
    FROM tbl_mop
    ORDER BY mop ASC;
    `;

    db.query(sql, (err, result) => {
      if (err) {
        console.error("Error fetching mop:", err);
        return res
          .status(500)
          .json({ status: "error", message: "Internal server error" });
      }

      if (!result || result.length === 0) {
        return res
          .status(200)
          .json({ status: "success", res: "No MOP found." });
      }

      return res.status(200).json({ status: "success", res: result });
    });
  } catch (error) {
    console.error("Error fetching mop:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//add mop
app.post("/api/add-mop", (req, res) => {
  const { paymentName, has_reference } = req.body;

  // Check if the rider already exists (optional, depending on your logic)
  const checkQuery = "SELECT * FROM tbl_mop WHERE mop = ?";
  db.query(checkQuery, [paymentName], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error." });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: "MOP already exists." });
    }

    // Insert new mode of payment
    const insertQuery = `
    INSERT INTO tbl_mop (mop, attach_file)
    VALUES (?, ?)
  `;
    db.query(insertQuery, [paymentName, has_reference], (err, result) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ message: "Failed to add mode of payment." });
      }

      return res
        .status(200)
        .json({ message: "Mode of payment added successfully." });
    });
  });
});

//edit mop
// Backend route to handle editing of mode of payment
app.put("/api/edit-mop", (req, res) => {
  const { paymentName, originalPaymentName, hasReference } = req.body;

  // Step 1: Check if the paymentName already exists (other than the original payment)
  const checkQuery = "SELECT * FROM tbl_mop WHERE mop = ?"; // Ensure column name matches in the table
  db.query(checkQuery, [paymentName], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error." });
    }

    // If paymentName exists and it’s not the same as the original payment name, return an error
    if (results.length > 0 && results[0].mop !== originalPaymentName) {
      // Ensure column name matches
      return res.status(400).json({ message: "Payment name already exists." });
    }

    // Step 2: Proceed with the update if the payment name is unique or same as the original
    const updateQuery = `
    UPDATE tbl_mop
    SET mop = ?, attach_file = ?
    WHERE mop = ?
  `;

    db.query(
      updateQuery,
      [paymentName, hasReference ? 1 : 0, originalPaymentName], // Ensure originalPaymentName matches
      (err, result) => {
        if (err) {
          console.error(err);
          return res
            .status(500)
            .json({ message: "Failed to update mode of payment." });
        }

        // If no rows were affected, return an error (should not happen if originalPaymentName exists)
        if (result.affectedRows === 0) {
          return res
            .status(400)
            .json({ message: "Mode of payment not found." });
        }

        return res
          .status(200)
          .json({ message: "Mode of payment updated successfully." });
      }
    );
  });
});

//delete mop
app.delete("/api/delete-mop", (req, res) => {
  const { paymentName } = req.body;

  console.log(paymentName);

  // Check if the mode of payment exists
  const checkQuery = "SELECT * FROM tbl_mop WHERE mop = ?";
  db.query(checkQuery, [paymentName], (err, results) => {
    console.log(results);
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error." });
    }

    if (results.length === 0) {
      return res.status(400).json({ message: "Mode of payment not found." });
    }

    // Delete mode of payment based on rider name
    const deleteQuery = "DELETE FROM tbl_mop WHERE mop = ?";
    db.query(deleteQuery, [paymentName], (err, result) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ message: "Failed to delete mode of payment." });
      }

      return res
        .status(200)
        .json({ message: "Mode of payment deleted successfully." });
    });
  });
});

/* MOP SA SYSTEM ADMIN */

app.listen(port, () => {
  console.log(`Server running at http://${localIP}:${port}`);
});
