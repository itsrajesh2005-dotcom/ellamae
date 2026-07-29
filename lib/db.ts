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
  
  // 1. Rename tables if they exist under old names
  try {
    const [tables]: any = await db.query("SHOW TABLES LIKE 'gifts'");
    if (tables.length > 0) {
      const [prodTables]: any = await db.query("SHOW TABLES LIKE 'products'");
      if (prodTables.length === 0) {
        await db.query("RENAME TABLE gifts TO products");
        console.log("Renamed table 'gifts' to 'products'");
      }
    }
  } catch (err) {
    console.error("Error renaming table 'gifts' to 'products':", err);
  }

  try {
    const [tables]: any = await db.query("SHOW TABLES LIKE 'gift_images'");
    if (tables.length > 0) {
      const [prodImgTables]: any = await db.query("SHOW TABLES LIKE 'product_images'");
      if (prodImgTables.length === 0) {
        await db.query("RENAME TABLE gift_images TO product_images");
        console.log("Renamed table 'gift_images' to 'product_images'");
      }
    }
  } catch (err) {
    console.error("Error renaming table 'gift_images' to 'product_images':", err);
  }

  // Rename column inside product_images if it still has 'gift_id'
  try {
    const [cols]: any = await db.query("SHOW COLUMNS FROM product_images LIKE 'gift_id'");
    if (cols.length > 0) {
      await db.query("ALTER TABLE product_images CHANGE COLUMN gift_id product_id INT NOT NULL");
      console.log("Changed column 'gift_id' to 'product_id' in product_images");
    }
  } catch (err) {
    console.error("Error updating column in product_images:", err);
  }

  // Create Brands Table
  await db.query(`
    CREATE TABLE IF NOT EXISTS brands (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      status VARCHAR(50) DEFAULT 'Active',
      banner_image LONGTEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  // Rename column inside brands if it has 'brand_name' instead of 'name'
  try {
    const [cols]: any = await db.query("SHOW COLUMNS FROM brands LIKE 'brand_name'");
    if (cols.length > 0) {
      await db.query("ALTER TABLE brands CHANGE COLUMN brand_name name VARCHAR(255) NOT NULL");
      console.log("Changed column 'brand_name' to 'name' in brands table");
    }
  } catch (err) {
    console.error("Error updating column in brands:", err);
  }

  // Alter status column in brands if it's enum
  try {
    const [cols]: any = await db.query("SHOW COLUMNS FROM brands LIKE 'status'");
    if (cols.length > 0 && cols[0].Type.includes('enum')) {
      await db.query("ALTER TABLE brands MODIFY COLUMN status VARCHAR(50) DEFAULT 'Active'");
      console.log("Altered status column to VARCHAR(50) in brands table");
    }
  } catch (err) {}

  // Add updated_at column to brands if not exists
  try {
    const [cols]: any = await db.query("SHOW COLUMNS FROM brands LIKE 'updated_at'");
    if (cols.length === 0) {
      await db.query("ALTER TABLE brands ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
      console.log("Added column 'updated_at' to brands table");
    }
  } catch (err) {
    console.error("Error adding updated_at column to brands table:", err);
  }

  // Add category_id column to brands if not exists
  try {
    const [cols]: any = await db.query("SHOW COLUMNS FROM brands LIKE 'category_id'");
    if (cols.length === 0) {
      await db.query("ALTER TABLE brands ADD COLUMN category_id INT DEFAULT NULL");
      console.log("Added column 'category_id' to brands table");
    }
  } catch (err) {
    console.error("Error adding category_id column to brands table:", err);
  }

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

  // Add brand_id to category if not exists
  try {
    const [cols]: any = await db.query("SHOW COLUMNS FROM category LIKE 'brand_id'");
    if (cols.length === 0) {
      await db.query("ALTER TABLE category ADD COLUMN brand_id INT DEFAULT NULL");
      console.log("Added column 'brand_id' to category table");
    }
  } catch (err) {
    console.error("Error adding brand_id to category:", err);
  }

  // Create Products Table
  await db.query(`
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      category_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      stacks INT NOT NULL DEFAULT 0,
      description TEXT,
      status VARCHAR(50) DEFAULT 'Active',
      image_path LONGTEXT
    ) ENGINE=InnoDB;
  `);

  // Add brand_id to products if not exists
  try {
    const [cols]: any = await db.query("SHOW COLUMNS FROM products LIKE 'brand_id'");
    if (cols.length === 0) {
      await db.query("ALTER TABLE products ADD COLUMN brand_id INT DEFAULT NULL");
      console.log("Added column 'brand_id' to products table");
    }
  } catch (err) {
    console.error("Error adding brand_id to products:", err);
  }

  try {
    await db.query('ALTER TABLE products MODIFY COLUMN image_path LONGTEXT');
    await db.query('ALTER TABLE products MODIFY COLUMN stacks INT NOT NULL DEFAULT 0');
  } catch (err) {}

  // Create Product Images Table
  await db.query(`
    CREATE TABLE IF NOT EXISTS product_images (
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_id INT NOT NULL,
      image_path LONGTEXT NOT NULL,
      CONSTRAINT fk_product_images_product_id FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  try {
    await db.query('ALTER TABLE product_images MODIFY COLUMN image_path LONGTEXT NOT NULL');
  } catch (err) {}


}


