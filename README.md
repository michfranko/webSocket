
# Centro de Control - Cliente WebSocket

## 🎯 Objetivo

Este repositorio contiene el **cliente (dashboard) WebSocket** que muestra alertas en tiempo real enviadas por un servidor WebSocket externo.

IMPORTANTE: Actualmente el cliente está configurado para conectarse de forma fija al servidor WebSocket en `ws://172.23.144.1:9000` (esto se estableció en `client/app.js`). Si necesitas conectar a otra IP/puerto, revisa la sección "Cambiar configuración de conexión".

---

## 📁 Estructura del proyecto

```
webSocket/
├── client/                   # Dashboard (HTML/CSS/JS)
│   ├── index.html           # UI
│   ├── styles.css           # Estilos
│   ├── app.js               # Lógica WebSocket (conexión fija a 172.23.144.1:9000)
│   ├── Dockerfile           # Imagen Docker para servir el cliente
│   └── .dockerignore
│
├── docker-compose.yml       # Levanta el servicio estático (expuesto en el host en 8080)
├── arquitectura.md          # Documento de arquitectura creado (resumen técnico)
├── README.md                # Este archivo
└── CLIENTE_CONEXION.md      # (Opcional) instrucciones de conexión y diagnóstico
```

---

## ⚡ Inicio Rápido (Docker)

1. Abre una terminal en la carpeta del proyecto:

```powershell
cd C:\Users\Lenovo\Desktop\webSocket
```

2. Levanta el cliente con Docker Compose:

```powershell
docker compose up -d
```

3. Abre el dashboard en el navegador:

```
http://localhost:8080
```

Nota: El cliente intentará conectarse automáticamente al servidor WebSocket en `ws://172.23.144.1:9000`.

---

## 🔧 Comandos Docker útiles

```powershell
# Levantar cliente (detached)
docker compose up -d

# Ver logs del servicio (si el servicio se llama `client` en el compose)
docker compose logs -f

# Detener y eliminar contenedores
docker compose down

# Reconstruir la imagen y levantar
docker compose up -d --build
```

---

## 🌐 Conexión y configuración

- Conexión por defecto: `ws://172.23.144.1:9000` (fija).
- Archivo con la lógica: `client/app.js`. Si deseas volver a permitir selección dinámica (query param o variable de entorno), edita `client/app.js` y cambia la constante que establece la URL del WebSocket.

Ejemplo: abrir `client/app.js` y buscar la línea donde se construye `new WebSocket(...)`.

---

## 💡 Cómo Funciona

1. El navegador carga `index.html` servido por el contenedor Docker.
2. El script `client/app.js` inicializa una conexión WebSocket a `ws://172.23.144.1:9000`.
3. El servidor WebSocket (externo) envía mensajes/alertas.
4. El cliente procesa y muestra las alertas en el dashboard en tiempo real.

---

## ❌ Solucionar Problemas (con pasos prácticos)

Si el cliente no se conecta al servidor WebSocket (indicador rojo):

- Verifica que el servidor esté activo y escuchando en la IP/puerto indicado.
	- En la máquina del servidor: `netstat -an | findstr 9000` (Windows) o `ss -ltnp | grep 9000` (Linux).
- Comprueba conectividad básica desde tu máquina cliente:
	```powershell
	ping 172.23.144.1
	```
- Prueba la conexión WebSocket con `wscat` desde tu máquina cliente:
	```powershell
	npm install -g wscat
	wscat -c ws://172.23.144.1:9000
	```
- Revisa reglas de firewall en ambas máquinas (cliente y servidor) y asegúrate de que el puerto `9000` está permitido.
- Abre las DevTools del navegador (F12) → pestaña `Console` y `Network` para ver errores de conexión o excepciones.

Si ves errores CORS o problemas de política de seguridad, revisa cómo se sirve el cliente y considera habilitar la configuración adecuada en el servidor WebSocket o en el proxy que lo expone.

---

## 📄 Documentos relacionados

- `arquitectura.md` — Documento que resume la arquitectura del cliente y consideraciones de red.
- `client/app.js` — Lógica de conexión WebSocket (editar aquí para cambiar IP/puerto o reintroducir la opción `?server=`).

---

## Próximos pasos sugeridos

- Si quieres permitir seleccionar dinámicamente la IP/puerto desde la URL o por variable de entorno, puedo:
	- Modificar `client/app.js` para leer `?server=` en la URL o usar `process.env` durante la construcción de la imagen.
	- Añadir documentación y ejemplos de uso.

---

Si deseas que actualice `client/app.js` para volver a soportar `?server=IP:PUERTO` o usar una variable de entorno, dime y lo hago.

