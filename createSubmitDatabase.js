const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('submit.db', (err) => {
    if (err) {
        console.error('Error creating database:', err.message);
    } else {
        console.log('Database created or opened successfully.');
        
        // Create a "recipes" table
        db.run(`
            CREATE TABLE IF NOT EXISTS recipes (
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
                console.log('Users table created successfully.');
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
