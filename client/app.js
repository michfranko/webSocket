/**
 * Cliente WebSocket - Dashboard de Alertas en Tiempo Real
 * Centro de Control de Seguridad Industrial - Cuenca
 */

class AlertClient {
    constructor() {
        this.ws = null;
        this.clientId = null;
        this.alerts = [];
        this.maxAlerts = 500;
        this.autoScroll = true;
        this.filterLevel = '';
        this.stats = {
            critical: 0,
            warning: 0,
            normal: 0
        };

        this.initializeElements();
        this.setupEventListeners();
        this.connect();
        this.startClockUpdate();
    }

    /**
     * Inicializar referencias a elementos del DOM
     */
    initializeElements() {
        // Elementos de conexión
        this.statusDot = document.getElementById('connection-status');
        this.statusText = document.getElementById('connection-text');
        this.clientIdText = document.getElementById('client-id');

        // Elementos de alertas
        this.alertsList = document.getElementById('alerts-list');
        this.lastUpdate = document.getElementById('last-update');

        // Contadores
        this.countCritical = document.getElementById('count-critical');
        this.countWarning = document.getElementById('count-warning');
        this.countNormal = document.getElementById('count-normal');
        this.countTotal = document.getElementById('count-total');

        // Botones y filtros
        this.btnClear = document.getElementById('btn-clear');
        this.btnAutoScroll = document.getElementById('btn-auto-scroll');
        this.filterSelect = document.getElementById('filter-level');
        this.currentTime = document.getElementById('current-time');
    }

    /**
     * Configurar escuchadores de eventos
     */
    setupEventListeners() {
        this.btnClear.addEventListener('click', () => this.clearAlerts());
        this.btnAutoScroll.addEventListener('click', () => this.toggleAutoScroll());
        this.filterSelect.addEventListener('change', (e) => {
            this.filterLevel = e.target.value;
            this.renderAlerts();
        });
    }

    /**
     * Conectar al servidor WebSocket
     */
    connect() {
        try {
            // Conectar SIEMPRE a la IP fija proporcionada
            const wsUrl = 'ws://10.139.99.40:9000';
            if (this.statusText) {
                this.statusText.textContent = 'Conectando a: 172.23.144.1:9000';
            }
            console.log(`[🔌 CONECTANDO] ${wsUrl}`);

            this.ws = new WebSocket(wsUrl);

            this.ws.onopen = () => this.onOpen();
            this.ws.onmessage = (event) => this.onMessage(event);
            this.ws.onerror = (error) => this.onError(error);
            this.ws.onclose = () => this.onClose();
        } catch (error) {
            console.error('[❌ ERROR] Fallo al conectar:', error);
            this.setDisconnected();
        }
    }

    /**
     * Manejador: Conexión abierta
     */
    onOpen() {
        console.log('[✅ CONEXIÓN EXITOSA]');
        this.setConnected();

        // Enviar ping periódicamente para mantener viva la conexión
        this.pingInterval = setInterval(() => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({
                    tipo: 'ping',
                    timestamp: new Date().toISOString()
                }));
            }
        }, 30000);
    }

    /**
     * Manejador: Mensaje recibido
     */
    onMessage(event) {
        try {
            const mensaje = JSON.parse(event.data);
            console.log('[📨 MENSAJE RECIBIDO]', mensaje);

            // Mensaje de conexión
            if (mensaje.tipo === 'conexion') {
                this.clientId = mensaje.clientId;
                this.clientIdText.textContent = `ID: ${this.clientId}`;
            }

            // Alerta del MON
            if (mensaje.tipo === 'alerta' || mensaje.nivel) {
                this.addAlert(mensaje);
            }

            // Actualización de estado del servidor
            if (mensaje.tipo === 'estado-servidor') {
                this.handleServerStatus(mensaje);
            }

            // Pong de ping
            if (mensaje.tipo === 'pong') {
                // Conexión viva confirmada
            }
        } catch (error) {
            console.error('[❌ ERROR] Fallo al procesar mensaje:', error);
        }
    }

    /**
     * Manejador: Error
     */
    onError(error) {
        console.error('[❌ ERROR DE CONEXIÓN]', error);
        this.setDisconnected();
    }

    /**
     * Manejador: Desconexión
     */
    onClose() {
        console.log('[⏹️  DESCONECTADO]');
        this.setDisconnected();
        clearInterval(this.pingInterval);

        // Reintentar conexión después de 3 segundos
        console.log('[🔄 REINTENTANDO] en 3 segundos...');
        setTimeout(() => this.connect(), 3000);
    }

    /**
     * Agregar alerta a la lista
     */
    addAlert(alerta) {
        // Validar estructura de alerta
        if (!alerta.nivel || !alerta.sensor_id) {
            console.warn('[⚠️  ALERTA INCOMPLETA]', alerta);
            return;
        }

        // Crear objeto de alerta enriquecido
        const alertaEnriquecida = {
            id: Date.now() + Math.random(),
            alerta: alerta.alerta || alerta.tipo || 'Alerta desconocida',
            nivel: alerta.nivel.toLowerCase(),
            mensaje: alerta.mensaje || 'Sin detalles',
            sensor_id: alerta.sensor_id,
            valor: alerta.valor || null,
            tipo: alerta.tipo || null,
            timestamp: new Date(alerta.timestamp || Date.now()),
            icon: this.getIconForAlert(alerta.tipo),
            addedAt: new Date()
        };

        // Agregar a la lista
        this.alerts.unshift(alertaEnriquecida);

        // Limitar número de alertas en memoria
        if (this.alerts.length > this.maxAlerts) {
            this.alerts = this.alerts.slice(0, this.maxAlerts);
        }

        // Actualizar estadísticas
        this.updateStats();

        // Renderizar
        this.renderAlerts();

        // Auto-scroll si está habilitado
        if (this.autoScroll) {
            this.scrollToTop();
        }

        // Actualizar timestamp
        this.lastUpdate.textContent = `Última actualización: ${this.formatTime(new Date())}`;

        // Reproducir sonido de alerta (opcional)
        if (alertaEnriquecida.nivel === 'rojo') {
            this.playAlertSound();
        }
    }

    /**
     * Actualizar estadísticas
     */
    updateStats() {
        this.stats = {
            critical: this.alerts.filter(a => a.nivel === 'rojo').length,
            warning: this.alerts.filter(a => a.nivel === 'amarillo').length,
            normal: this.alerts.filter(a => a.nivel === 'verde').length
        };

        this.countCritical.textContent = this.stats.critical;
        this.countWarning.textContent = this.stats.warning;
        this.countNormal.textContent = this.stats.normal;
        this.countTotal.textContent = this.alerts.length;
    }

    /**
     * Renderizar alertas filtradas
     */
    renderAlerts() {
        const filtradas = this.filterLevel
            ? this.alerts.filter(a => {
                if (this.filterLevel === 'rojo') return a.nivel === 'rojo';
                if (this.filterLevel === 'amarillo') return a.nivel === 'amarillo';
                if (this.filterLevel === 'verde') return a.nivel === 'verde';
            })
            : this.alerts;

        // Si no hay alertas
        if (filtradas.length === 0) {
            this.alertsList.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">📭</span>
                    <p>Esperando alertas...</p>
                    <small>Las alertas aparecerán aquí en tiempo real</small>
                </div>
            `;
            return;
        }

        // Renderizar alertas
        this.alertsList.innerHTML = filtradas
            .map(alerta => this.createAlertElement(alerta))
            .join('');
    }

    /**
     * Crear elemento HTML para una alerta
     */
    createAlertElement(alerta) {
        const ahora = new Date();
        const hace = this.timeAgo(alerta.addedAt);

        return `
            <div class="alert-item ${alerta.nivel}">
                <div class="alert-icon">${alerta.icon}</div>
                <div class="alert-content">
                    <div class="alert-title">${this.escapeHtml(alerta.alerta)}</div>
                    <div class="alert-message">${this.escapeHtml(alerta.mensaje)}</div>
                    <div class="alert-details">
                        <div class="alert-detail">
                            <span>🔌 Sensor:</span>
                            <strong>${this.escapeHtml(alerta.sensor_id)}</strong>
                        </div>
                        ${alerta.tipo ? `
                            <div class="alert-detail">
                                <span>📊 Tipo:</span>
                                <strong>${this.escapeHtml(alerta.tipo)}</strong>
                            </div>
                        ` : ''}
                        ${alerta.valor !== null ? `
                            <div class="alert-detail">
                                <span>📈 Valor:</span>
                                <strong>${this.escapeHtml(String(alerta.valor))}</strong>
                            </div>
                        ` : ''}
                    </div>
                </div>
                <div class="alert-time">
                    <div class="alert-time-main">${this.formatTime(alerta.timestamp)}</div>
                    <div class="alert-time-ago">${hace}</div>
                </div>
            </div>
        `;
    }

    /**
     * Obtener ícono según tipo de alerta
     */
    getIconForAlert(tipo) {
        const iconMap = {
            'temperatura': '🌡️',
            'temperatura_critica': '🔥',
            'movimiento': '🚨',
            'puerta': '🚪',
            'humo': '💨',
            'vibración': '📳',
            'alarma_manual': '🔔',
            'emergencia': '🚨',
            'seguridad': '🛡️',
            'sistema': '⚙️'
        };
        return iconMap[tipo] || '⚠️';
    }

    /**
     * Manejo de estado del servidor
     */
    handleServerStatus(mensaje) {
        if (mensaje.evento === 'cliente-desconectado') {
            // Opcionalmente notificar visualmente
            console.log(`[ℹ️  INFO] Otro cliente se desconectó. Clientes activos: ${mensaje.clientesActivos}`);
        }
    }

    /**
     * Limpiar todas las alertas
     */
    clearAlerts() {
        if (confirm('¿Seguro que deseas limpiar todas las alertas?')) {
            this.alerts = [];
            this.updateStats();
            this.renderAlerts();
            console.log('[🗑️  LIMPIEZA] Alertas eliminadas');
        }
    }

    /**
     * Alternar auto-scroll
     */
    toggleAutoScroll() {
        this.autoScroll = !this.autoScroll;
        this.btnAutoScroll.classList.toggle('active', this.autoScroll);
        console.log(`[📌 AUTO-SCROLL] ${this.autoScroll ? 'Habilitado' : 'Deshabilitado'}`);
    }

    /**
     * Scroll al inicio de la lista
     */
    scrollToTop() {
        const container = document.querySelector('.alerts-container');
        if (container) {
            container.scrollTop = 0;
        }
    }

    /**
     * Reproducir sonido de alerta (opcional)
     */
    playAlertSound() {
        // Crear un sonido simple usando AudioContext
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            // Audio no disponible, silenciosamente fallar
        }
    }

    /**
     * Establecer estado conectado
     */
    setConnected() {
        this.statusDot.classList.remove('disconnected');
        this.statusDot.classList.add('connected');
        this.statusText.textContent = 'Conectado';
    }

    /**
     * Establecer estado desconectado
     */
    setDisconnected() {
        this.statusDot.classList.remove('connected');
        this.statusDot.classList.add('disconnected');
        this.statusText.textContent = 'Desconectado';
    }

    /**
     * Utilidades: Formato de hora
     */
    formatTime(date) {
        const horas = String(date.getHours()).padStart(2, '0');
        const minutos = String(date.getMinutes()).padStart(2, '0');
        const segundos = String(date.getSeconds()).padStart(2, '0');
        return `${horas}:${minutos}:${segundos}`;
    }

    /**
     * Utilidades: Tiempo transcurrido
     */
    timeAgo(date) {
        const segundos = Math.floor((new Date() - date) / 1000);

        if (segundos < 60) return 'hace unos segundos';
        const minutos = Math.floor(segundos / 60);
        if (minutos < 60) return `hace ${minutos} min`;
        const horas = Math.floor(minutos / 60);
        if (horas < 24) return `hace ${horas} h`;
        const dias = Math.floor(horas / 24);
        return `hace ${dias} días`;
    }

    /**
     * Utilidades: Escapar HTML
     */
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return String(text).replace(/[&<>"']/g, m => map[m]);
    }

    /**
     * Actualizar reloj en tiempo real
     */
    startClockUpdate() {
        setInterval(() => {
            const ahora = new Date();
            this.currentTime.textContent = this.formatTime(ahora);
        }, 1000);
    }
}

/**
 * Inicializar aplicación cuando DOM está listo
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║     CLIENTE WEBSOCKET - ALERTAS EN TIEMPO REAL             ║
║     Centro de Control de Seguridad Industrial - Cuenca     ║
╚════════════════════════════════════════════════════════════╝
    `);
    
    new AlertClient();
});
