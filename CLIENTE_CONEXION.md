# Guía de Conexión - Cliente WebSocket

## Resumen

Tú tienes el **cliente (dashboard)**. Tu compañero tiene el **servidor WebSocket**. Necesitas conectar el cliente al servidor.

---

## 3 Pasos Simples

### 1️⃣ Obtén la IP de tu compañero

Tu compañero ejecuta esto en su máquina:

**Windows:**
```powershell
ipconfig
# Busca: "IPv4 Address" (ej: 192.168.1.100)
```

**Linux/Mac:**
```bash
ifconfig
# o
hostname -I
```

### 2️⃣ Levanta tu cliente

```powershell
cd C:\Users\Lenovo\Desktop\webSocket
docker compose up -d
```

### 3️⃣ Abre el dashboard con la IP de tu compañero

En el navegador:
```
http://localhost:8080/?server=IP_DEL_COMPAÑERO:9000
```

**Ejemplo real:**
```
http://localhost:8080/?server=192.168.1.100:9000
```

✅ **¡Listo!** Si ves el punto **🟢 verde**, estás conectado.

---

## Ejemplos de URLs

| Situación | URL |
|-----------|-----|
| Servidor en tu misma máquina | `http://localhost:8080/?server=localhost:9000` |
| Servidor IP local | `http://localhost:8080/?server=192.168.1.100:9000` |
| Servidor con hostname DNS | `http://localhost:8080/?server=servidor.empresa.local:9000` |
| Servidor en puerto diferente | `http://localhost:8080/?server=192.168.1.100:8765` |

---

## Verificar que Funciona

### 1. Mira el Indicador de Estado
- **🟢 Verde** = Conectado ✅
- **🔴 Rojo** = Desconectado ❌

### 2. Abre DevTools (F12) → Console
Deberías ver:
```
[🔌 CONECTANDO] ws://192.168.1.100:9000
[✓ CONEXIÓN EXITOSA]
```

### 3. Pide una Alerta de Prueba
Tu compañero envía una alerta → **Aparece en el dashboard instantáneamente**

---

## ❌ Problemas Comunes

### "🔴 Rojo / No conecta"

**Solución 1:** Verifica la IP
```powershell
ping 192.168.1.100
```
Si no responde, la IP es incorrecta.

**Solución 2:** Verifica que el puerto está abierto
- Pide a tu compañero que ejecute: `docker compose ps`
- Debe ver el puerto `9000` activo

**Solución 3:** Firewall
- En la máquina de tu compañero, abre el puerto 9000 en el firewall

### "Conecta pero sin alertas"

**Solución:** Tu compañero debe enviar alertas
```powershell
# Tu compañero ejecuta esto
curl -X POST http://localhost:9000/alerta `
  -H "Content-Type: application/json" `
  -d '{"nivel":"alta","sensor_id":"S-TEST","tipo":"temperatura","mensaje":"Prueba"}'
```

Luego deberías ver la alerta en tu dashboard.

### "Error: ERR_CONNECTION_REFUSED"

- La IP o puerto es incorrecto
- El servidor no está corriendo
- Firewall bloquea

Verifica con tu compañero que el servidor está activo.

---

## Cambiar Servidor sin Reiniciar

Simplemente cambia la URL en el navegador:

De: `http://localhost:8080/?server=192.168.1.100:9000`
A: `http://localhost:8080/?server=192.168.1.50:9000`

Y recarga (F5). El cliente se reconectará automáticamente.

---

## Docker Útil

```powershell
# Ver logs del cliente
docker compose logs -f client

# Reiniciar cliente
docker compose restart client

# Detener todo
docker compose down

# Reconstruir y levantar
docker compose up -d --build
```

---

## Resumen Final

| Paso | Qué Hacer |
|------|-----------|
| 1 | Compañero: obtiene su IP con `ipconfig` |
| 2 | Tú: ejecutas `docker compose up -d` |
| 3 | Tú: abres `http://localhost:8080/?server=IP:9000` |
| 4 | Verificas que conecta (punto verde) |
| 5 | Compañero: envía alerta de prueba |
| 6 | ¡Ves la alerta en tu dashboard! |

---

**¿Algo no funciona?** Verifica:
1. ✅ La IP es correcta
2. ✅ El puerto 9000 está abierto
3. ✅ El servidor de tu compañero está corriendo
4. ✅ Firewall permite la conexión
5. ✅ DevTools muestra "[✓ CONEXIÓN EXITOSA]"

