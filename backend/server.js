const express = require("express");
const multer = require("multer");
const path = require("path");
const mysql = require("mysql");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

const fs = require("fs");
// const bcrypt, { compare } = require('bcrypt');
// const cookieParser = require('cookie-parser');
const moment = require("moment");
const { type } = require("os");
// const salt = 10;
const app = express();
const port = 5000;

app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["POST", "GET", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "dbgmz",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("MySQL connected...");
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
//===============>LOGIN================>//
app.get("/api/accounts", async (req, res) => {
  const sql = `SELECT * FROM tblusers `;
  await queryAsync(sql)
    .then((results) => {
      if (results.length > 0) {
        const user = results;

        res.json({
          user: user,
        });
      } else {
        res.status(500).json({ message: "Failed to fetch account." });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "Internal Server Error" });
    });
});

app.post("/api/addaccount", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const access = req.body.access;
  const sql = `INSERT INTO tblusers (username, password, access) VALUES (?,?,?)`;
  await queryAsync(sql, [username, password, access])
    .then((results) => {
      res.status(201).json({ message: "Success" });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "Internal Server Error" });
    });
});

app.post("/api/editaccount/:id", async (req, res) => {
  const id = req.params.id;
  const username = req.body.username;
  const password = req.body.password;
  const access = parseInt(req.body.access);
  const sql = `UPDATE tblusers SET username = ?, password = ?, access = ? WHERE id = ${id}`;
  await queryAsync(sql, [username, password, access])
    .then((results) => {
      res.status(200).json({ message: "Success", result: results });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "Internal Server Error" });
    });
});

app.delete("/api/deleteaccount/:id", async (req, res) => {
  const id = req.params.id;

  const sql = `DELETE FROM tblusers WHERE id = ${id}`;
  await queryAsync(sql)
    .then((results) => {
      res.status(200).json({ message: "Success", result: results });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "Internal Server Error" });
    });
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
  const { documentName, category, dateUploaded, expirationDate, description } =
    req.body;

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  // Validate dates
  const today = moment().format("YYYY-MM-DD"); // Current date in YYYY-MM-DD format
  if (dateUploaded !== today) {
    return res.status(400).json({ error: "The uploaded date must be today." });
  }

  if (moment(expirationDate).isSameOrBefore(moment(dateUploaded))) {
    return res
      .status(400)
      .json({ error: "The expiration date must be after the uploaded date." });
  }

  const filePath = `/uploads/${req.file.filename}`;

  try {
    const sql =
      "INSERT INTO tbldocument (documentName, filePath, category, dateUploaded, expirationDate, description) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(
      sql,
      [
        documentName,
        filePath,
        category,
        dateUploaded,
        expirationDate,
        description,
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
    console.log(error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
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
  const sql = "SELECT * FROM tbldocument";
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
  const { documentName, category, expirationDate, description } = req.body;
  let newFilePath = null;

  // If a new file is uploaded, set the new file path
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

    const oldFilePath = rows[0]?.filePath; // Get the current file path from the database

    // Update the database with new values
    const updateQuery = `
      UPDATE tbldocument
      SET documentName = ?, category = ?, expirationDate = ?, description = ?
      ${newFilePath ? ", filePath = ?" : ""}
      WHERE id = ?`;

    const queryParams = newFilePath
      ? [documentName, category, expirationDate, description, newFilePath, id]
      : [documentName, category, expirationDate, description, id];

    db.query(updateQuery, queryParams, (updateErr, result) => {
      if (updateErr) {
        console.error("Database update error:", updateErr);
        return res.status(500).json({ error: "Database update failed." });
      }

      // Delete the old file if a new file was uploaded and the old file exists
      if (newFilePath && oldFilePath) {
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

      return res
        .status(200)
        .json({ message: "Document updated successfully." });
    });
  });
});

app.delete("/api/documents/:id", (req, res) => {
  const { id } = req.params;

  let newFilePath = null;

  // If a new file is uploaded, set the new file path
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

      return res.status(200).json({ message: "Document delete successfully." });
    });
  });
});
app.get("/api/documents/notifications", (req, res) => {
  const currentDate = moment().format("YYYY-MM-DD");
  const oneYearFromNow = moment().add(1, "year").format("YYYY-MM-DD");
  const threeMonthsFromNow = moment().add(3, "months").format("YYYY-MM-DD");

  // Modify the query as required
  const query = `
    SELECT d.* 
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
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching notifications:", err);
      return res.status(500).json({ error: "Failed to fetch notifications." });
    }

    return res.status(200).json(results);
  });
});

//////////////=========DOCUMENT============>

//getting the whole table from inventory
app.get("/api/item", (req, res) => {
  const sql = `
        SELECT 
            i.itemId,
            i.itemName,
            i.price,
            i.quantity,
            i.category,
            i.description,
            COALESCE(SUM(p.quantityProduced), 0) AS totalQuantity  -- Total quantity from tblProduction
        FROM 
            tblItems i
        LEFT JOIN 
            tblProduction p ON i.itemId = p.itemId  -- Join with tblProduction on itemId
        GROUP BY 
            i.itemId;  -- Grouping to get the sum per item
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
  const { itemName, price, category, description } = req.body;
  const sql =
    "INSERT INTO tblItems (itemName, price, category, description) VALUES (?, ?, ?, ?)";
  db.query(sql, [itemName, price, category, description], (err, result) => {
    if (err) {
      console.error("Error adding inventory item:", err);
      return res.status(500).send("Error adding inventory item");
    }
    res.status(201).send("Inventory item added successfully");
  });
});
app.get("/kupal-kaba", (req, res) => {
  return res.json({ Message: "Kupal kaba pre?" });
});
//getting specific item in inventory
app.get("/api/updateitem/:id", (req, res) => {
  const sql = "SELECT * FROM tblItems WHERE itemId = ?";
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
  const { itemName, price, category, description } = req.body;

  const sql =
    "UPDATE tblitems SET itemName = ?, price = ?, category = ?, description = ? WHERE itemId = ?";
  db.query(sql, [itemName, price, category, description, id], (err, result) => {
    if (err) {
      console.error("Error updating inventory item:", err);
      return res
        .status(500)
        .send("Error updating inventory item: " + err.message);
    }
    if (result.affectedRows === 0) {
      return res.status(404).send("Item not found");
    }
    res.send("Item successfully updated");
  });
});

//deleting item in inventory
app.delete("/api/deleteitem/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM tblitems WHERE itemId = ?";

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

// Get inventory details from tblInventory by itemId
app.get("/api/inventory/:itemId", (req, res) => {
  const itemId = req.params.itemId; // Corrected from req.params.id to req.params.itemId
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

// Get inventory details from tblInventory by itemId, joining with tblProduction
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
        SELECT 
            tblrawmatsinv.inventoryId,
            tblrawmatsinv.quantity,
            tblsupdeli.date,
            tblrawmatsinv.lastUpdated
        FROM tblrawmatsinv
        JOIN tblsupdeli ON tblrawmatsinv.supDeliId = tblsupdeli.supDeliId
        WHERE tblsupdeli.matId = ? 
        AND tblrawmatsinv.quantity != 0;

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

//raw materials
//getting materials
app.get("/api/rawmats", async (req, res) => {
  try {
    const query = "SELECT * FROM tblRawMats"; // Adjust table name and fields as needed
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
  const { matName, category } = req.body; // Use matName to match the frontend
  const sql =
    "INSERT INTO tblRawMats (matName, quantity, category) VALUES (?, 0, ?)";
  db.query(sql, [matName, category], (err, result) => {
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
  const sql = "SELECT * FROM tblRawMats WHERE matId = ?"; // Correct table name and field

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
  const { matName, quantity, category } = req.body;

  const sql =
    "UPDATE tblRawMats SET matName = ?, quantity = ?, category = ? WHERE matId = ?";

  db.query(sql, [matName, quantity, category, matId], (err, result) => {
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
  const sql = "DELETE FROM tblRawMats WHERE matId = ?";

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
      console.log(`No supply delivery found for ID: ${id}`);
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

// Route to get raw materials for a specific supplier
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
  console.log(supplierId);
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

//supply delivery
// Fetch all Supply delivery
app.get("/api/supDeli", async (req, res) => {
  try {
    // Adjust the query to match your table structure and required fields
    const query = `
      SELECT 
        sp.supplyId,
        sp.supplyName,
        od.status,
        od.totalCost AS totalCost,
        MAX(od.orderDate) AS orderDate,
        SUM(odi.quantity) AS totalQuantity
      FROM tblsuppliers sp
      LEFT JOIN tblordersfromsupplier od ON sp.supplyId = od.supplyId
      LEFT JOIN tblorderfromsupplier_items odi ON od.orderId = odi.orderId
      WHERE odi.quantity IS NOT NULL
      GROUP BY sp.supplyName;
    `;

    db.query(query, (error, results) => {
      if (error) {
        console.error("Error fetching supply deliveries: ", error);
        return res.status(500).send("Server Error");
      }

      // Ensure results have data
      if (results.length > 0) {
        // Get the supplyIds from the results
        const supplyIds = results.map((result) => result.supplyId);

        // Create a promise for each supplyId to fetch detailed data
        const detailedQueries = supplyIds.map((supplyId) => {
          const productQuery = `
            SELECT 
              sp.supplyName,
              od.totalCost,
              od.orderDate,
              odi.price,
              odi.totalCost AS itemTotal,
              odi.quantity,
              mat.matName
            FROM tblsuppliers sp
            LEFT JOIN tblordersfromsupplier od ON sp.supplyId = od.supplyId
            LEFT JOIN tblorderfromsupplier_items odi ON od.orderId = odi.orderId
            LEFT JOIN tblrawmats mat ON mat.matId = odi.matId
            WHERE sp.supplyId = ${supplyId}
              AND od.orderId IS NOT NULL
              AND odi.orderId IS NOT NULL
              AND mat.matId IS NOT NULL;
          `;
          return new Promise((resolve, reject) => {
            db.query(productQuery, (error, productResults) => {
              if (error) {
                reject(error);
              } else {
                resolve({
                  supplyId: supplyId,
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
                (detail) => detail.supplyId === supplier.supplyId
              );
              return {
                ...supplier,
                productDetails: productDetails
                  ? productDetails.productDetails
                  : [],
              };
            });

            res.json(response);
          })
          .catch((error) => {
            console.error("Error fetching product details: ", error);
            res.status(500).send("Error fetching product details");
          });
      } else {
        res.status(404).send("No suppliers found");
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

  // First, delete records from tblrawmatsinv that reference supDeliId in tblsupdeli
  const deleteRawMatsInvQuery = `
    DELETE FROM tblrawmatsinv WHERE supDeliId IN (SELECT supDeliId FROM tblsupdeli WHERE supplyId = ?)
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
  console.log("==", supplyId);
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
      console.log(results);
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
        res.json(suppliers);
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

app.post("/api/placeOrderDelivery", (req, res) => {
  const { supplyId, products, totalCost } = req.body;

  if (!products || products.length === 0) {
    return res.status(400).json({ message: "No products in the order" });
  }

  const orderDate = new Date().toISOString().split("T")[0]; // Current date in 'YYYY-MM-DD' format

  // Start transaction to insert order and order items
  db.beginTransaction((err) => {
    if (err) {
      return res.status(500).json({ message: "Failed to start transaction" });
    }

    // Insert order into tblorders
    const insertOrderQuery =
      "INSERT INTO tblordersfromsupplier (supplyId, totalCost, orderDate , status) VALUES (?, ?, ? , ?)";
    db.query(
      insertOrderQuery,
      [supplyId, totalCost, orderDate, 0],
      (err, result) => {
        if (err) {
          return db.rollback(() => {
            res
              .status(500)
              .json({ message: "Failed to place order", Error: err });
          });
        }

        const orderId = result.insertId;

        // Insert order items into tblorderfromsupplier_items
        const insertItemsQuery =
          "INSERT INTO tblorderfromsupplier_items (orderId, matId, quantity, price, totalCost) VALUES ?";
        const values = products.map((product) => [
          orderId, // Order ID from tblorders
          product.productId, // Material ID (matId)
          product.quantity, // Quantity ordered
          product.price, // Price per unit
          product.total, // Total cost for this item
        ]);

        db.query(insertItemsQuery, [values], (err, result) => {
          if (err) {
            return db.rollback(() => {
              res
                .status(500)
                .json({ message: "Failed to add items to the order" });
            });
          }

          db.commit((err) => {
            if (err) {
              return db.rollback(() => {
                res
                  .status(500)
                  .json({ message: "Failed to commit transaction" });
              });
            }

            // Successfully committed the transaction
            res.status(200).json({
              message: "Order placed successfully",
              orderId,
              totalCost,
            });
          });
        });
      }
    );
  });
});

//edit supply delivery
// Fetch a single supply delivery by ID
app.get("/api/supplydelivery/:deliveryId", (req, res) => {
  const { deliveryId } = req.params;
  const query = "SELECT * FROM tblSupDeli WHERE supdeliId = ?"; // Adjust to your table and column names
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
        UPDATE tblRawMats 
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

// GET: Fetch inventory details for a specific item
app.get("/api/inventory-data/:itemId", async (req, res) => {
  const itemId = req.params.itemId;

  try {
    // Query to retrieve only the required inventory details for the specified itemId
    const query = `
            SELECT 
                inv.inventoryId, 
                inv.quantity, 
                prod.productionDate AS date, 
                inv.lastUpdated
            FROM 
                tblinventory AS inv
            JOIN 
                tblProduction AS prod ON inv.productionId = prod.productionId
            WHERE 
                prod.itemId = ?
            ORDER BY 
                inv.lastUpdated DESC
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

// API Route: Get Categories
app.get("/api/categories", (req, res) => {
  const query = "SELECT * FROM tblCategories";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching categories:", err);
      return res.status(500).send("Server error");
    }
    res.json(results);
  });
});

// API Route: Get Inventory Categories
app.get("/api/categories/inventory", (req, res) => {
  const query = "SELECT * FROM tblCategories WHERE type = 'Inventory'";
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
    "SELECT * FROM tblCategories WHERE type IN ('Document', 'Contracts/Agreement', 'Legal')";
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
  const query = "SELECT * FROM tblCategories WHERE type = 'RawMaterial'";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching inventory categories:", err);
      res.status(500).send("Server error");
    } else {
      res.json(results);
    }
  });
});

// GET: Fetch all production records
app.get("/api/production", (req, res) => {
  const query = "SELECT * FROM tblproduction order by productiondate desc";
  db.query(query, (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
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

// POST: Add a new production record
app.post("/api/addProduction", (req, res) => {
  const { itemId, quantityProduced, staffName } = req.body;
  const productionDate = new Date(); // Automatically set to today's date

  // Start a transaction
  db.beginTransaction((err) => {
    if (err) {
      console.error("Transaction start error:", err);
      return res.status(500).send("Transaction error");
    }

    // Insert the new production record
    const insertProductionSql = `
            INSERT INTO tblProduction (itemId, quantityProduced, staffName, productionDate) 
            VALUES (?, ?, ?, ?)
        `;
    db.query(
      insertProductionSql,
      [itemId, quantityProduced, staffName, productionDate],
      (insertError, productionResult) => {
        if (insertError) {
          return db.rollback(() => {
            console.error("Error during production insertion:", insertError);
            res.status(500).send("Error adding production");
          });
        }

        const productionId = productionResult.insertId; // Get the generated productionId

        // Update the quantity in tblItems
        const updateItemsSql = `
                UPDATE tblItems 
                SET quantity = quantity + ? 
                WHERE itemId = ?
            `;
        db.query(updateItemsSql, [quantityProduced, itemId], (updateError) => {
          if (updateError) {
            return db.rollback(() => {
              console.error(
                "Error during quantity update in tblItems:",
                updateError
              );
              res.status(500).send("Error updating item quantity");
            });
          }

          // Insert the production record into tblinventory
          const insertInventorySql = `
                    INSERT INTO tblinventory (productionId, quantity, lastUpdated)
                    VALUES (?, ?, NOW())
                `;
          db.query(
            insertInventorySql,
            [productionId, quantityProduced],
            (inventoryError) => {
              if (inventoryError) {
                return db.rollback(() => {
                  console.error(
                    "Error inserting into tblinventory:",
                    inventoryError
                  );
                  res.status(500).send("Error adding to inventory");
                });
              }

              // Commit the transaction
              db.commit((commitErr) => {
                if (commitErr) {
                  console.error("Transaction commit error:", commitErr);
                  return res.status(500).send("Transaction error");
                }
                res
                  .status(200)
                  .send(
                    "Production record added, item quantity updated, and inventory updated successfully"
                  );
              });
            }
          );
        });
      }
    );
  });
});

// Update Production and Adjust Item Quantity in tblItems and tblinventory
app.put("/api/updateProduction/:productionId", async (req, res) => {
  const { productionId } = req.params;
  const { itemId, quantityProduced, staffName } = req.body;

  if (!itemId || !quantityProduced || !staffName) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const sqlGetOldQuantity = `
        SELECT quantityProduced
        FROM tblProduction
        WHERE productionId = ?;
    `;

  const sqlUpdateProduction = `
        UPDATE tblProduction
        SET itemId = ?, quantityProduced = ?, staffName = ?
        WHERE productionId = ?;
    `;

  const sqlUpdateItem = `
        UPDATE tblItems
        SET quantity = quantity + ?
        WHERE itemId = ?;
    `;

  const sqlUpdateInventory = `
        UPDATE tblinventory
        SET quantity = ?, lastUpdated = NOW()
        WHERE productionId = ?;
    `;

  try {
    // Step 1: Fetch the old production quantity
    const oldQuantityResults = await queryAsync(sqlGetOldQuantity, [
      productionId,
    ]);

    if (oldQuantityResults.length === 0) {
      return res.status(404).json({ message: "Production record not found" });
    }

    const oldQuantityProduced = oldQuantityResults[0].quantityProduced;

    // Step 2: Calculate the difference in quantity (new - old)
    const quantityDifference = quantityProduced - oldQuantityProduced;

    // Step 3: Update the production record
    await queryAsync(sqlUpdateProduction, [
      itemId,
      quantityProduced,
      staffName,
      productionId,
    ]);

    // Step 4: Update the item quantity in tblItems
    await queryAsync(sqlUpdateItem, [quantityDifference, itemId]);

    // Step 5: Update the inventory record in tblinventory
    await queryAsync(sqlUpdateInventory, [quantityProduced, productionId]);

    res.status(200).json({
      message: "Production, item quantity, and inventory updated successfully",
    });
  } catch (err) {
    console.error(
      "Error updating production, item quantity, and inventory:",
      err
    );
    res.status(500).json({
      message: "Error updating production, item quantity, and inventory",
    });
  }
});

// DELETE: Delete a production record by productionId
app.delete("/api/production/:id", async (req, res) => {
  const { id } = req.params;

  // Query to get the itemId and quantity of the production record before deleting it
  const sqlGetQuantity =
    "SELECT itemId, quantityProduced FROM tblProduction WHERE productionId = ?";

  // Query to delete the production record
  const sqlDeleteProduction =
    "DELETE FROM tblProduction WHERE productionId = ?";

  // Query to update the item quantity in tblItems
  const sqlUpdateItem =
    "UPDATE tblItems SET quantity = quantity - ? WHERE itemId = ?";

  // Query to delete the corresponding inventory record in tblinventory
  const sqlDeleteInventory = "DELETE FROM tblinventory WHERE productionId = ?";

  try {
    // Step 1: Fetch the itemId and quantity of the production record
    const productionResults = await queryAsync(sqlGetQuantity, [id]);

    if (productionResults.length === 0) {
      return res.status(404).json({ message: "Production record not found" });
    }

    const { itemId, quantityProduced } = productionResults[0];

    // Step 2: Delete the production record from tblProduction
    await queryAsync(sqlDeleteProduction, [id]);

    // Step 3: Update the item quantity in tblItems by subtracting the deleted quantity
    await queryAsync(sqlUpdateItem, [quantityProduced, itemId]);

    // Step 4: Delete the corresponding record in tblinventory
    await queryAsync(sqlDeleteInventory, [id]);

    res.json({
      message:
        "Production record and inventory entry deleted, and item quantity updated successfully!",
    });
  } catch (err) {
    console.error(
      "Error deleting production, updating item quantity, and deleting inventory record:",
      err
    );
    res.status(500).json({
      message:
        "Error deleting production, updating item quantity, and deleting inventory record",
    });
  }
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
  const query = "SELECT itemId, itemName, price FROM tblItems"; // Adjust the table name as needed
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
            GROUP_CONCAT(mats.matName SEPARATOR ', ') AS matNames,
            GROUP_CONCAT(logMats.quantity SEPARATOR ', ') AS quantities
           
        FROM 
            tblproductionmateriallogs logs
        LEFT JOIN 
            tblmatlogsmats logMats ON logs.logId = logMats.logId
        LEFT JOIN 
            tblrawmats mats ON logMats.matId = mats.matId
        GROUP BY 
            logs.logId;
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
CUSTOMER
*/
app.get("/api/api-get-customer-info/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log(userId);
    const sql = `
   SELECT c.name, c.location
   FROM tblusers u 
   LEFT JOIN tblcustomer c ON c.customer_id = u.id 
   WHERE u.id = '${userId}'
`;
    await db.query(sql, (err, result) => {
      console.log(result[0]);
      return res.status(200).json({ status: "success", res: result[0] });
    });
  } catch (error) {
    console.error("Error fetching customer name:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/api-items", async (req, res) => {
  try {
    const sql = `SELECT * FROM tblitems`;
    await db.query(sql, (err, result) => {
      console.log(result);
      return res.status(200).json({ status: "success", res: result });
    });
  } catch (error) {
    console.error("Error fetching customer name:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/api-insert-to-cart", async (req, res) => {
  console.log(req.body);

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
    const sql = `INSERT INTO tblorder_cus 
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

        console.log(result);

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
    console.log(userId);

    const sql = `SELECT item_name, description, price, 
    SUM(qty) AS qty,
    SUM(total_price) AS total_price
    FROM tblorder_cus 
    WHERE isOrdered = "0" 
    AND customer_id = ${userId} 
    GROUP BY item_name, price;`;

    await db.query(sql, (err, result) => {
      console.log(result);
      return res.status(200).json({ status: "success", res: result });
    });
  } catch (error) {
    console.error("Error fetching customer name:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/*
CUSTOMER
*/

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
