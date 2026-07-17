import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

export async function getDbConnection() {
  if (!pool) {
    pool = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'ellamae_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }
  return pool;
}

export async function initializeDatabase() {
  const db = await getDbConnection();
  
  // Create Category Table
  await db.query(`
    CREATE TABLE IF NOT EXISTS category (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      status VARCHAR(50) DEFAULT 'Active',
      banner_image LONGTEXT
    ) ENGINE=InnoDB;
  `);

  // Create Gifts Table
  await db.query(`
    CREATE TABLE IF NOT EXISTS gifts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      category_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      description TEXT,
      status VARCHAR(50) DEFAULT 'Active'
    ) ENGINE=InnoDB;
  `);

  // Create Gift Images Table
  await db.query(`
    CREATE TABLE IF NOT EXISTS gift_images (
      id INT AUTO_INCREMENT PRIMARY KEY,
      gift_id INT NOT NULL,
      image_path LONGTEXT NOT NULL,
      CONSTRAINT fk_gift_images_gift_id FOREIGN KEY (gift_id) REFERENCES gifts(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  // Alter columns to LONGTEXT to make sure base64 image storage does not exceed limits
  try {
    await db.query('ALTER TABLE category MODIFY COLUMN banner_image LONGTEXT');
  } catch (err) {
    console.warn('Altering category table warning:', err);
  }
  try {
    await db.query('ALTER TABLE gift_images MODIFY COLUMN image_path LONGTEXT');
  } catch (err) {
    console.warn('Altering gift_images table warning:', err);
  }
}
