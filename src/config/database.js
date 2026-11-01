
require("dotenv").config();

const mysql = require("mysql2");

// ========================================
// CONEXIÓN A MYSQL
// ========================================
const usarSSL = process.env.DB_SSL === "true";

const connection = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "elite_events",
    ssl: usarSSL ? { rejectUnauthorized: false } : undefined
});

connection.connect((error) => {
    if (error) {
        console.error("❌ Error al conectar con MySQL:");
        console.error(error.message);
        return;
    }

    console.log("✅ Conectado a MySQL");

    connection.query(`
        CREATE TABLE IF NOT EXISTS mensajes_soporte (
            id INT AUTO_INCREMENT PRIMARY KEY,
            usuario_id INT NOT NULL,
            autor_rol VARCHAR(20) NOT NULL,
            mensaje VARCHAR(1000) NOT NULL,
            fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX (usuario_id),
            FOREIGN KEY (usuario_id)
                REFERENCES usuarios(id)
                ON DELETE CASCADE
        )
    `, (error) => {
        if (error) {
            console.error(
                "Error creando mensajes de soporte:",
                error.message
            );
        }
    });

    connection.query(`
        SELECT COUNT(*) AS existe
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = 'eventos'
          AND column_name = 'boletas_disponibles'
    `, (error, resultados) => {
        if (error) {
            console.error(
                "Error verificando boletas:",
                error.message
            );
            return;
        }

        if (resultados[0].existe === 0) {
            connection.query(`
                ALTER TABLE eventos
                ADD COLUMN boletas_disponibles
                INT NOT NULL DEFAULT 100
            `, (error) => {
                if (error) {
                    console.error(
                        "Error agregando boletas:",
                        error.message
                    );
                } else {
                    console.log(
                        "✅ Columna de boletas creada"
                    );
                }
            });
        }
    });
});

module.exports = connection;
