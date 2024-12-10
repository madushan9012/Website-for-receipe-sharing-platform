const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('savedReceipes.db', (err) => {
    if (err) {
        console.error('Error creating database:', err.message);
    } else {
        console.log('Database created or opened successfully.');
        
        // Create a "saved recipes" table
        db.run(`
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
        `, (err) => {
            if (err) {
                console.error('Error creating table:', err.message);
            } else {
                console.log('saved recipes table created successfully.');
            }
        });
    }
});

// Close the database connection
db.close((err) => {
    if (err) {
        console.error('Error closing database:', err.message);
    } else {
        console.log('Database connection closed.');
    }
});
