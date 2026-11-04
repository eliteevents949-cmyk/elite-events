# Elite-events.1

## Configuracion local

La aplicacion lee la configuracion desde el archivo local `.env`. Para usar
MySQL de XAMPP, configura `DB_HOST=127.0.0.1`, `DB_PORT=3306`, `DB_USER=root`,
`DB_PASSWORD=` (vacio si root no tiene contrasena), `DB_NAME=elite_events` y
`DB_SSL=false`.

Para enviar correos con Gmail, configura `MAIL_USER` y `MAIL_PASSWORD`; esta
ultima debe ser una contrasena de aplicacion de Google, no la contrasena normal
de la cuenta. `APP_URL` se usa para los enlaces de recuperacion de contrasena.

El archivo `.env` es local y esta excluido de Git. No es necesario mantener un
`.env.example` para que la aplicacion funcione.

## Administracion

Configura `ADMIN_EMAIL` con el correo administrativo. En PowerShell ejecuta
`$env:ADMIN_PASSWORD='una-clave-segura'; npm.cmd run admin:promote; Remove-Item Env:ADMIN_PASSWORD`;
el comando crea o actualiza esa cuenta y cifra la contraseña. Si no existe
`SESSION_SECRET`, genera uno y lo guarda localmente. La contraseña no se escribe
en `.env`. Reinicia el servidor e inicia sesión de nuevo para entrar al panel
privado `/admin.html`. La API verifica el token y vuelve a comprobar el rol en
la base en cada operacion.

En un hosting que despliega desde GitHub, define tambien `ADMIN_EMAIL`,
`ADMIN_PASSWORD` y un `SESSION_SECRET` persistente en la configuracion privada
del servicio. Al iniciar sesion, la aplicacion crea la cuenta administradora si
no existe o asigna el rol admin si ya existe; nunca guarda `ADMIN_PASSWORD` en
el repositorio ni en texto plano en la base de datos. Asegurate de que el
hosting apunte a la misma base MySQL que contiene los eventos y usuarios.

Las reservas y sus correos son comprobantes de demostracion. La plataforma no
procesa pagos reales ni confirma cargos bancarios.
