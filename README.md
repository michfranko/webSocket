# Centro de Control - Cliente WebSocket

## 🎯 Objetivo

Este es el **cliente (dashboard) WebSocket**. Recibe alertas en tiempo real desde el servidor WebSocket que tu compañero está ejecutando en Docker.

**¡Muy simple!** Solo necesitas:
1. La IP y puerto del servidor de tu compañero
2. Ejecutar este cliente en Docker
3. Abrir el dashboard en el navegador

---

## 📁 Estructura

```
webSocket/
├── client/                   # Dashboard (HTML/CSS/JS)
│   ├── index.html           # UI
│   ├── styles.css           # Estilos
│   ├── app.js               # Lógica WebSocket
│   ├── Dockerfile           # Imagen Docker
│   └── .dockerignore
│
├── docker-compose.yml       # Configuración Docker (nginx puerto 8080)
├── README.md                # Este archivo
└── CLIENTE_CONEXION.md      # Instrucciones de conexión
```

---

## ⚡ Inicio Rápido

### Paso 1: Obtén la IP del servidor de tu compañero

Tu compañero ejecuta esto en su máquina:
```powershell
ipconfig
# Busca IPv4 Address → ejemplo: 192.168.1.100
```

### Paso 2: Levanta el cliente

```powershell
cd C:\Users\Lenovo\Desktop\webSocket
docker compose up -d
```

### Paso 3: Abre el dashboard

En el navegador, con la IP de tu compañero:
```
http://localhost:8080/?server=IP_DEL_COMPAÑERO:9000
```

**Ejemplo:**
```
http://localhost:8080/?server=192.168.1.100:9000
```

### Paso 4: ¡Listo!

- El indicador debe estar **🟢 verde** (conectado)
- Las alertas que envíe tu compañero aparecerán en tiempo real

---

## 🔧 Comandos Docker

```powershell
# Levantar cliente
docker compose up -d

# Ver logs
docker compose logs -f client

# Detener
docker compose down

# Reconstruir
docker compose up -d --build
```

---

## 🌐 Cambiar Servidor

Simplemente cambia la URL:

| Caso | URL |
|------|-----|
| Servidor local (mismo PC) | `http://localhost:8080/?server=localhost:9000` |
| Servidor en otra máquina | `http://localhost:8080/?server=192.168.1.50:9000` |
| Usar hostname | `http://localhost:8080/?server=mon-server:9000` |

---

## 💡 Cómo Funciona

1. **Cliente (tú)**: Ejecutas este dashboard en Docker
2. **Servidor (tu compañero)**: Corre en otra máquina/contenedor Docker
3. **Conexión**: El cliente se conecta al servidor WebSocket via `?server=IP:PUERTO`
4. **Alertas**: El servidor envía alertas → Cliente las recibe y muestra en tiempo real

---

## ❌ Solucionar Problemas

**No conecta (🔴 rojo):**
- Verifica la IP: `ping 192.168.1.100`
- Verifica que el puerto 9000 está abierto
- Verifica que tu compañero tiene el servidor corriendo

**No ves alertas:**
- Abre DevTools (F12 → Console)
- Verifica que está conectado (verde)
- Pide a tu compañero que envíe una alerta de prueba

**Errores en consola:**
- F12 → Console → revisa los mensajes rojos
- Copia el error y verifica la IP/puerto en la URL

---

## 📖 Documentación

- **`CLIENTE_CONEXION.md`** — Guía detallada de conexión
- **`docker-compose.yml`** — Configuración Docker

---

**¿Necesitas ayuda?** Revisa `CLIENTE_CONEXION.md` para guía paso a paso.
