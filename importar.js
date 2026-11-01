require("dotenv").config();

const fs = require("fs");
const path = require("path");
const mysql = require("mysql2");

// =====================================================
// 📁 UBICACIÓN DEL ARCHIVO SQL
// =====================================================

const sqlFile = path.join(
    process.env.USERPROFILE,
    "Downloads",
    "elite_events.sql"
);

// Verificar que exista el archivo
if (!fs.existsSync(sqlFile)) {
    console.error("");
    console.error("❌ NO SE ENCONTRÓ EL ARCHIVO elite_events.sql");
    console.error("------------------------------------------");
    console.error("Se buscó en:");
    console.error(sqlFile);
    console.error("------------------------------------------");
    process.exit(1);
}

console.log("");
console.log("==========================================");
console.log("📄 ARCHIVO SQL ENCONTRADO");
console.log("==========================================");
console.log(sqlFile);
console.log("");

// =====================================================
// 📖 LEER ARCHIVO SQL
// =====================================================

const sqlOriginal = fs.readFileSync(sqlFile, "utf8");

console.log("📦 Tamaño del archivo:");
console.log(sqlOriginal.length, "caracteres");
console.log("");

// =====================================================
// 🧹 LIMPIAR COMANDOS DEL SQL
// =====================================================

// Eliminamos CREATE DATABASE y USE porque queremos
// importar todo dentro de la base de datos defaultdb.

const sql = sqlOriginal
    .replace(
        /CREATE\s+DATABASE\s+(IF\s+NOT\s+EXISTS\s+)?[`'"]?[^;`'"]+[`'"]?\s*;/gi,
        ""
    )
    .replace(
        /USE\s+[`'"]?[^;`'"]+[`'"]?\s*;/gi,
        ""
    );

// =====================================================
// 🔐 CONFIGURACIÓN DE AIVEN
// =====================================================

console.log("==========================================");
console.log("🔐 CONECTANDO A AIVEN");
console.log("==========================================");

console.log("Host:", process.env.DB_HOST);
console.log("Puerto:", process.env.DB_PORT);
console.log("Usuario:", process.env.DB_USER);
console.log("Base:", process.env.DB_NAME);
console.log(
    "Password definida:",
    process.env.DB_PASSWORD ? "true" : "false"
);
console.log("");

// =====================================================
// 🔌 CONEXIÓN MYSQL
// =====================================================

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
    ssl: {
        rejectUnauthorized: false
    }
});



// =====================================================
// 🔌 CONECTAR
// =====================================================

connection.connect((error) => {
    if (error) {
        console.error("");
        console.error("❌ ERROR CONECTANDO A AIVEN");
        console.error("------------------------------------------");
        console.error(error.message);
        console.error("------------------------------------------");
        console.error("");

        process.exit(1);
    }

    console.log("✅ CONECTADO A MYSQL DE AIVEN");
    console.log("");

    // =================================================
    // 🗄️ SELECCIONAR BASE DE DATOS
    // =================================================

    connection.query(
        "USE defaultdb",
        (error) => {
            if (error) {
                console.error("");
                console.error("❌ NO SE PUDO SELECCIONAR defaultdb");
                console.error("------------------------------------------");
                console.error(error.message);
                console.error("------------------------------------------");

                connection.end();
                return;
            }

            console.log("✅ Base de datos defaultdb seleccionada");
            console.log("");

            // =============================================
            // ⚙️ PREPARAR AIVEN PARA LA IMPORTACIÓN
            // =============================================

            connection.query(
                `
                SET SESSION sql_require_primary_key = 0;
                SET FOREIGN_KEY_CHECKS = 0;
                SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';
                `,
                (error) => {
                    if (error) {
                        console.error("");
                        console.error(
                            "❌ ERROR PREPARANDO AIVEN PARA IMPORTAR"
                        );
                        console.error("------------------------------------------");
                        console.error(error.message);
                        console.error("------------------------------------------");

                        connection.end();
                        return;
                    }

                    console.log("✅ Aiven preparado para importar");
                    console.log("");

                    // =============================================
                    // 📦 IMPORTAR BASE DE DATOS
                    // =============================================

                    console.log(
                        "=========================================="
                    );
                    console.log("📦 IMPORTANDO ELITE EVENTS");
                    console.log(
                        "=========================================="
                    );
                    console.log(
                        "⏳ Esto puede tardar unos segundos..."
                    );
                    console.log("");

                    connection.query(
                        sql,
                        (error) => {
                            if (error) {
                                console.error("");
                                console.error(
                                    "❌ ERROR IMPORTANDO LA BASE DE DATOS"
                                );
                                console.error(
                                    "------------------------------------------"
                                );
                                console.error(error.message);
                                console.error(
                                    "------------------------------------------"
                                );
                                console.error("");

                                connection.end();
                                return;
                            }

                            console.log("");
                            console.log(
                                "=========================================="
                            );
                            console.log(
                                "🎉 IMPORTACIÓN COMPLETADA"
                            );
                            console.log(
                                "=========================================="
                            );
                            console.log(
                                "✅ Tablas copiadas a Aiven"
                            );
                            console.log(
                                "✅ Datos copiados a Aiven"
                            );
                            console.log("");

                            // =========================================
                            // 🔄 VOLVER A ACTIVAR FOREIGN KEYS
                            // =========================================

                            connection.query(
                                "SET FOREIGN_KEY_CHECKS = 1",
                                (error) => {
                                    if (error) {
                                        console.error(
                                            "⚠️ No se pudo activar FOREIGN_KEY_CHECKS"
                                        );
                                        console.error(
                                            error.message
                                        );
                                    }

                                    // =================================
                                    // 📋 MOSTRAR TABLAS
                                    // =================================

                                    connection.query(
                                        "SHOW TABLES",
                                        (error, resultados) => {
                                            if (error) {
                                                console.error("");
                                                console.error(
                                                    "❌ NO SE PUDIERON VERIFICAR LAS TABLAS"
                                                );
                                                console.error(
                                                    error.message
                                                );

                                                connection.end();
                                                return;
                                            }

                                            console.log("");
                                            console.log(
                                                "=========================================="
                                            );
                                            console.log(
                                                "📋 TABLAS EN AIVEN"
                                            );
                                            console.log(
                                                "=========================================="
                                            );

                                            if (
                                                resultados.length ===
                                                0
                                            ) {
                                                console.log(
                                                    "⚠️ No se encontraron tablas."
                                                );
                                            } else {
                                                resultados.forEach(
                                                    (tabla) => {
                                                        console.log(
                                                            "   ✅",
                                                            Object.values(
                                                                tabla
                                                            )[0]
                                                        );
                                                    }
                                                );
                                            }

                                            console.log("");
                                            console.log(
                                                "=========================================="
                                            );
                                            console.log(
                                                "🔌 CERRANDO CONEXIÓN"
                                            );
                                            console.log(
                                                "=========================================="
                                            );

                                            connection.end(
                                                (error) => {
                                                    if (error) {
                                                        console.error(
                                                            "⚠️ Error cerrando conexión:"
                                                        );
                                                        console.error(
                                                            error.message
                                                        );
                                                    } else {
                                                        console.log(
                                                            "✅ Conexión cerrada correctamente."
                                                        );
                                                    }
                                                }
                                            );
                                        }
                                    );
                                }
                            );
                        }
                    );
                }
            );
        }
    );
});