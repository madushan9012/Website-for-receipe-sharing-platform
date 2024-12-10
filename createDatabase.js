const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('users.db', (err) => {
    if (err) {
        console.error('Error creating database:', err.message);
    } else {
        console.log('Database created or opened successfully.');
        
        // Create a "users" table
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
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
