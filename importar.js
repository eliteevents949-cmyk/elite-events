require("dotenv").config();

const fs = require("fs");
const path = require("path");
const mysql = require("mysql2");

// 📁 Ubicación del archivo SQL exportado desde phpMyAdmin
const sqlFile = path.join(
    process.env.USERPROFILE,
    "Downloads",
    "elite_events.sql"
);

// Verificar que exista el archivo
if (!fs.existsSync(sqlFile)) {
    console.error("❌ No se encontró el archivo elite_events.sql");
    console.error("📁 Se buscó en:");
    console.error(sqlFile);
    process.exit(1);
}

// Leer el archivo SQL
const sql = fs.readFileSync(sqlFile, "utf8");

console.log("📄 Archivo SQL encontrado correctamente.");

// 🔐 Conexión a Aiven
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    // Necesario porque el archivo SQL contiene muchas instrucciones
    multipleStatements: true,

    // Aiven requiere conexión SSL
    ssl: {
        rejectUnauthorized: false
    }
});

// Conectar
connection.connect((error) => {
    if (error) {
        console.error("❌ Error conectando a Aiven:");
        console.error(error.message);
        return;
    }

    console.log("✅ Conectado a Aiven");

    // Aiven puede exigir que cada tabla tenga PRIMARY KEY
    // desde el momento en que se crea.
    // Nuestro archivo de phpMyAdmin agrega las PRIMARY KEY
    // después mediante ALTER TABLE.
    connection.query(
        "SET SESSION sql_require_primary_key = 0",
        (error) => {
            if (error) {
                console.error(
                    "❌ No se pudo preparar Aiven para importar:"
                );
                console.error(error.message);

                connection.end();
                return;
            }

            console.log("✅ Aiven preparado para importar");
            console.log("📦 Importando elite_events.sql...");
            console.log("⏳ Espera unos segundos...");

            // Importar todo el archivo SQL
            connection.query(sql, (error) => {
                if (error) {
                    console.error("❌ Error importando la base de datos:");
                    console.error(error.message);

                    connection.end();
                    return;
                }

                console.log("");
                console.log("🎉 ¡BASE DE DATOS IMPORTADA CORRECTAMENTE!");
                console.log("✅ Tablas de Elite Events copiadas a Aiven.");
                console.log("✅ Datos de Elite Events copiados a Aiven.");
                console.log("");

                // Verificar las tablas creadas
                connection.query(
                    "SHOW TABLES",
                    (error, resultados) => {
                        if (error) {
                            console.error(
                                "⚠️ La importación terminó, pero no se pudieron verificar las tablas."
                            );
                            console.error(error.message);
                        } else {
                            console.log("📋 Tablas encontradas en Aiven:");

                            resultados.forEach((tabla) => {
                                console.log(
                                    "   ✅",
                                    Object.values(tabla)[0]
                                );
                            });
                        }

                        console.log("");
                        console.log("🔌 Cerrando conexión...");
                        connection.end();
                    }
                );
            });
        }
    );
});