const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const path = require('path');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const fs = require('fs');


const app = express();
const db = new sqlite3.Database('./users.db');
const db1 = new sqlite3.Database('./submit.db');
const db2 =new sqlite3.Database('./savedReceipes.db');

// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // For parsing form data

// Serve static files (e.g., HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));
 // Ensure 'public' contains your index.html

 // Configure multer for file uploads
//const upload = multer({ dest: 'uploads/' }); // Change 'uploads/' to a desired directory

// Create users table if it doesn't exist
db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )
`);

// Create recipes table if it doesn't exist
db1.run(`
    CREATE TABLE IF NOT EXISTS recipes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            title TEXT,
            description TEXT,
            ingredients TEXT,
            instructions TEXT,
            category TEXT,
            image_path TEXT,
            submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`);

// Create saved recipes table if it doesn't exist
db2.run(`
    CREATE TABLE IF NOT EXISTS savedrecipes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        title TEXT,
        description TEXT,
        ingredients TEXT,
        instructions TEXT,
        category TEXT,
        image BLOB,
        submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`);



// Signup route
app.post('/signup', (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Insert user into the database
    db.run(
        `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
        [name, email, password],
        function (err) {
            if (err) {
                if (err.code === 'SQLITE_CONSTRAINT') {
                    return res.status(400).json({ message: 'Email already registered' });
                }
                return res.status(500).json({ message: 'Database error' });
            }
            res.status(201).json({ message: 'User registered successfully' });
        }
    );
});


app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Query the database for the user
    db.get('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, row) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: 'Internal server error' });
        } else if (row) {
            // User found and credentials match
            res.status(200).json({ message: 'Login successful' });
        } else {
            // User not found or incorrect password
            res.status(401).json({ message: 'Invalid credentials' });
        }
    });
});


// Route to handle recipe submissions
app.post('/submission', upload.single('recipeImage'), (req, res) => {
    const { name, email, title, description, ingredients, instructions, category } = req.body;
    const imageBuffer = req.file ? req.file.buffer : null; // Read the image data as a buffer

    if (!name || !email || !title || !description || !ingredients || !instructions || !category) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Insert the recipe into the database
    db1.run(
        `INSERT INTO recipes (name, email, title, description, ingredients, instructions, category, image) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, email, title, description, ingredients, instructions, category, imageBuffer],
        function (err) {
            if (err) {
                console.error('Error inserting data:', err.message);
                return res.status(500).json({ message: 'Database error' });
            }
            
            res.status(201).json({ message: 'Recipe submitted successfully' });
        }
    );
});

//Retrieve receipe image 
app.get('/recipe-image/:id', (req, res) => {
    const recipeId = req.params.id;
    db1.get('SELECT image FROM recipes WHERE id = ?', [recipeId], (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Database error' });
        }
        if (row && row.image) {
            res.writeHead(200, { 'Content-Type': 'image/jpeg' }); // Adjust MIME type as needed
            res.end(row.image);
        } else {
            res.status(404).json({ message: 'Image not found' });
        }
    });
});


// Route to get the last user entry
app.get('/latest-user', (req, res) => {
    db.get('SELECT * FROM users ORDER BY id DESC LIMIT 1', (err, row) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Database error' });
        }
        if (row) {
            res.status(200).json(row);
        } else {
            res.status(404).json({ message: 'No user found' });
        }
    });
});

    // Endpoint to update user data
    app.post('/update-user', (req, res) => {
        const { name, email, password } = req.body;
    
        // Debugging: Check if the data is received correctly
        console.log('Request data:', req.body);
    
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
    
        db.run(
            `UPDATE users SET name = ?, password = ? WHERE email = ?`,
            [name, password, email],
            function (err) {
                if (err) {
                    console.error('Error updating data:', err);
                    return res.status(500).json({ message: 'Database error' });
                }
                if (this.changes > 0) {
                    res.status(200).json({ message: 'User updated successfully' });
                } else {
                    res.status(404).json({ message: 'User not found' });
                }
            }
        );
    });
    


    // Endpoint to get all submitted recipes
app.get('/get-submitted-recipes', (req, res) => {
    const query = `SELECT name, email, title, category, submission_date FROM recipes ORDER BY submission_date DESC`;
  
    db1.all(query, [], (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows); // Send the results as JSON
    });
  });

  // Endpoint to get all saved recipes
app.get('/get-saved-recipes', (req, res) => {
    const query = `SELECT name, email, title, category, submission_date FROM savedrecipes ORDER BY submission_date DESC`;
  
    db2.all(query, [], (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows); // Send the results as JSON
    });
  });

    //send the recipe details to saved recipe database
app.post('/blog', upload.single('recipeImage'), (req, res) => {
    console.log('Full request body:', req.body);
    console.log('File details:', req.file);
    const { name, email, title, description, ingredient, instructions, category} = req.body;
    const image = req.file ? req.file.buffer : null; // Get image data from multer


    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Title:', title);
    console.log('Description:', description);
    console.log('Ingredient:', ingredient);
    console.log('Instructions:', instructions);
    console.log('Category:', category);
    

    if (!name || !email || !title || !description || !ingredient || !instructions || !category) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    
    
    // Insert data into the savedrecipes table
    db2.run(
        `INSERT INTO savedRecipes (name, email, title, description, ingredients, instructions, category, image)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, email, title, description, ingredient, instructions, category, image],
        (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Error saving the recipe.' });
            } else {
                res.status(201).json({ message: 'Recipe saved successfully.' }); // Respond with 201 status
                
            }
        }
    );
});

//Retrieve receipe image 
app.get('/recipe-image/:id', (req, res) => {
    const recipeId = req.params.id;
    db1.get('SELECT image FROM savedrecipes WHERE id = ?', [recipeId], (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Database error' });
        }
        if (row && row.image) {
            res.writeHead(200, { 'Content-Type': 'image/jpeg' }); // Adjust MIME type as needed
            res.end(row.image);
        } else {
            res.status(404).json({ message: 'Image not found' });
        }
    });
});



// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
