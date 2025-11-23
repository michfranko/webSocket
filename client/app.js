/**
 * Cliente WebSocket - Dashboard de Alertas en Tiempo Real v2.0
 * Implementación moderna, segura y profesional.
 */

class AlertClient {
    constructor(wsUrl = 'ws://192.168.0.106:9000') {
        this.wsUrl = wsUrl;
        this.ws = null;
        this.clientId = null;
        this.alerts = [];
        this.maxAlerts = 500;
        this.filterLevel = '';
        this.pingInterval = null;

        this.stats = { critical: 0, warning: 0, normal: 0 };
        this.iconMap = {
            temperatura: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/></svg>',
            movimiento: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 8 9.428 9.428c.943.943 2.472.943 3.414 0L22 8"/></svg>',
            puerta: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14"/><path d="M10 12h.01"/></svg>',
            humo: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.4V4a2 2 0 0 1 2-2h8.4c1.4 0 2.8.8 3.4 2.1l3.5 6.4c.6 1.2.6 2.7 0 3.9l-3.5 6.4c-.6 1.3-2 2.1-3.4 2.1H6a2 2 0 0 1-2-2v-2.7"/><path d="M7 12v.1"/></svg>',
            emergencia: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m10.29 1.86-1.54 2.92a1 1 0 0 0 .81 1.51h3.08a1 1 0 0 0 .81-1.51l-1.54-2.92a1 1 0 0 0-1.62 0Z"/><path d="M10.29 22.14 8.75 19.22a1 1 0 0 1 .81-1.51h4.08a1 1 0 0 1 .81 1.51l-1.54 2.92a1 1 0 0 1-1.62 0Z"/><circle cx="12" cy="12" r="4"/></svg>',
            sistema: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M12 2v2"/><path d="M12 22v-2"/><path d="m17 20.66-1-1.73"/><path d="M11 10.27 7 3.34"/><path d="m20.66 17-1.73-1"/><path d="m3.34 7 1.73 1"/><path d="M14 12h8"/><path d="M2 12h2"/><path d="m20.66 7-1.73 1"/><path d="m3.34 17 1.73-1"/><path d="m17 3.34-1 1.73"/><path d="m11 13.73-4 6.93"/></svg>',
            default: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>'
        };

        this.initializeDOMElements();
        this.setupEventListeners();
        this.connect();
        this.startClock();
    }

    /**
     * Cache DOM elements for performance.
     */
    initializeDOMElements() {
        this.dom = {
            statusDot: document.getElementById('connection-status'),
            statusText: document.getElementById('connection-text'),
            clientIdText: document.getElementById('client-id'),
            alertsList: document.getElementById('alerts-list'),
            lastUpdate: document.getElementById('last-update'),
            countCritical: document.getElementById('count-critical'),
            countWarning: document.getElementById('count-warning'),
            countNormal: document.getElementById('count-normal'),
            countTotal: document.getElementById('count-total'),
            btnClear: document.getElementById('btn-clear'),
            filterSelect: document.getElementById('filter-level'),
            currentTime: document.getElementById('current-time'),
            alertsContainer: document.getElementById('alerts-list-container')
        };
    }

    /**
     * Setup event listeners for UI elements.
     */
    setupEventListeners() {
        this.dom.btnClear.addEventListener('click', () => this.clearAlerts());
        this.dom.filterSelect.addEventListener('change', (e) => {
            this.filterLevel = e.target.value;
            this.renderAlerts();
        });
    }

    /**
     * Connect to the WebSocket server.
     */
    connect() {
        try {
            this.updateConnectionStatus('Conectando...', 'disconnected');
            console.log(`[🔌 CONECTANDO] a ${this.wsUrl}`);
            this.ws = new WebSocket(this.wsUrl);

            this.ws.onopen = () => this.onOpen();
            this.ws.onmessage = (event) => this.onMessage(event);
            this.ws.onerror = (error) => this.onError(error);
            this.ws.onclose = () => this.onClose();
        } catch (error) {
            console.error('[❌ ERROR] Fallo al iniciar conexión:', error);
            this.scheduleReconnect();
        }
    }

    onOpen() {
        console.log('[✅ CONEXIÓN EXITOSA]');
        this.updateConnectionStatus('Conectado', 'connected');
        this.startPing();
    }

    onMessage(event) {
        try {
            const message = JSON.parse(event.data);
            console.log('[📨 MENSAJE RECIBIDO]', message);

            // Un mensaje puede contener múltiples tipos de información.
            // Se procesan en orden de importancia.

            // 1. Actualizar ID del cliente si está presente.
            if (message.clientId) {
                this.clientId = message.clientId;
                if (message.totalClients && message.totalClients > 1) {
                    this.dom.clientIdText.textContent = `Operador ${this.clientId} de ${message.totalClients}`;
                } else {
                    this.dom.clientIdText.textContent = `ID: ${this.clientId}`;
                }
            }

            // 2. Procesar datos de alerta si están presentes.
            if (message.alerta) {
                this.addAlert(message);
            }

            // 3. Ignorar pings de mantenimiento.
            if (message.tipo === 'pong') {
                return;
            }

            // 4. Advertir sobre mensajes que no son ni de ID ni de alerta.
            if (!message.clientId && !message.alerta && message.tipo !== 'pong') {
                 console.warn('[⚠️ MENSAJE DESCONOCIDO]', message);
            }
        } catch (error) {
            console.error('[❌ ERROR] Fallo al procesar mensaje:', error);
        }
    }

    onError(error) {
        console.error('[❌ ERROR DE CONEXIÓN]', error);
        this.updateConnectionStatus('Error', 'disconnected');
    }

    onClose() {
        console.log('[⏹️ DESCONECTADO]');
        this.updateConnectionStatus('Desconectado', 'disconnected');
        this.stopPing();
        this.scheduleReconnect();
    }

    /**
     * Schedule a reconnection attempt.
     */
    scheduleReconnect() {
        console.log('[🔄 REINTENTANDO] en 3 segundos...');
        setTimeout(() => this.connect(), 3000);
    }

    /**
     * Start sending periodic pings to keep the connection alive.
     */
    startPing() {
        this.pingInterval = setInterval(() => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({ tipo: 'ping' }));
            }
        }, 30000);
    }

    stopPing() {
        clearInterval(this.pingInterval);
    }

    /**
     * Add a new alert, update stats, and re-render the list.
     */
    addAlert(alertData) {
        if (!alertData.nivel || !alertData.sensor_id) {
            console.warn('[⚠️ ALERTA INCOMPLETA]', alertData);
            return;
        }

        const newAlert = {
            id: `${Date.now()}-${Math.random()}`,
            title: alertData.alerta || 'Alerta Desconocida',
            level: alertData.nivel.toLowerCase(),
            message: alertData.mensaje || 'No hay detalles disponibles.',
            sensorId: alertData.sensor_id,
            value: alertData.valor,
            type: alertData.tipo,
            timestamp: new Date(alertData.timestamp || Date.now()),
            addedAt: new Date()
        };

        this.alerts.unshift(newAlert);
        if (this.alerts.length > this.maxAlerts) {
            this.alerts.pop();
        }

        this.updateStats();
        this.renderAlerts();

        this.dom.lastUpdate.textContent = `Última act: ${this.formatTime(new Date())}`;
        
        if (newAlert.level === 'rojo') {
            this.playAlertSound();
        }
    }

    /**
     * Update alert statistics.
     */
    updateStats() {
        this.stats = this.alerts.reduce((acc, alert) => {
            if (alert.level === 'rojo') acc.critical++;
            else if (alert.level === 'amarillo') acc.warning++;
            else if (alert.level === 'verde') acc.normal++;
            return acc;
        }, { critical: 0, warning: 0, normal: 0 });

        this.dom.countCritical.textContent = this.stats.critical;
        this.dom.countWarning.textContent = this.stats.warning;
        this.dom.countNormal.textContent = this.stats.normal;
        this.dom.countTotal.textContent = this.alerts.length;
    }

    /**
     * Render alerts based on the current filter.
     */
    renderAlerts() {
        const filteredAlerts = this.filterLevel
            ? this.alerts.filter(a => a.level === this.filterLevel)
            : this.alerts;

        if (filteredAlerts.length === 0) {
            this.showEmptyState();
            return;
        }

        this.dom.alertsList.innerHTML = ''; // Limpiar lista
        const fragment = document.createDocumentFragment();
        filteredAlerts.forEach(alert => {
            fragment.appendChild(this.createAlertElement(alert));
        });
        this.dom.alertsList.appendChild(fragment);
    }

    /**
     * Create a DOM element for an alert.
     */
    createAlertElement(alert) {
        const el = document.createElement('div');
        el.className = `alert-item ${alert.level}`;

        const iconHTML = this.iconMap[alert.type] || this.iconMap.default;
        
        const detailsHTML = `
            <div class="alert-detail">
                <span>Sensor:</span>
                <strong>${this.escapeHTML(alert.sensorId)}</strong>
            </div>
            ${alert.type ? `
                <div class="alert-detail">
                    <span>Tipo:</span>
                    <strong>${this.escapeHTML(alert.type)}</strong>
                </div>` : ''}
            ${alert.value !== null && alert.value !== undefined ? `
                <div class="alert-detail">
                    <span>Valor:</span>
                    <strong>${this.escapeHTML(String(alert.value))}</strong>
                </div>` : ''}
        `;

        el.innerHTML = `
            <div class="alert-icon">${iconHTML}</div>
            <div class="alert-content">
                <div class="alert-title">${this.escapeHTML(alert.title)}</div>
                <div class="alert-message">${this.escapeHTML(alert.message)}</div>
                <div class="alert-details">${detailsHTML}</div>
            </div>
            <div class="alert-time">
                <div class="alert-time-main">${this.formatTime(alert.timestamp)}</div>
                <div class="alert-time-ago">${this.timeAgo(alert.addedAt)}</div>
            </div>
        `;
        return el;
    }

    showEmptyState() {
        this.dom.alertsList.innerHTML = `
            <div class="empty-state">
                <svg class="empty-icon" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <p>Esperando alertas...</p>
                <small>Los eventos aparecerán aquí en tiempo real.</small>
            </div>`;
    }

    clearAlerts() {
        if (this.alerts.length > 0 && confirm('¿Está seguro de que desea limpiar todas las alertas?')) {
            this.alerts = [];
            this.updateStats();
            this.renderAlerts();
            console.log('[🗑️ LIMPIEZA] Alertas eliminadas.');
        }
    }

    playAlertSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);

            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            console.warn("La API de Web Audio no es compatible con este navegador.");
        }
    }

    updateConnectionStatus(text, statusClass) {
        if (this.dom.statusText) this.dom.statusText.textContent = text;
        if (this.dom.statusDot) {
            this.dom.statusDot.className = `status-dot ${statusClass}`;
        }
    }
    
    // --- UTILITIES ---
    formatTime(date) {
        return date.toLocaleTimeString('es-ES');
    }

    timeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        if (seconds < 10) return 'ahora mismo';
        if (seconds < 60) return `hace ${seconds} seg`;
        
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `hace ${minutes} min`;

        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `hace ${hours} h`;

        const days = Math.floor(hours / 24);
        return `hace ${days} días`;
    }

    escapeHTML(str) {
        const p = document.createElement('p');
        p.appendChild(document.createTextNode(str));
        return p.innerHTML;
    }

    startClock() {
        setInterval(() => {
            this.dom.currentTime.textContent = this.formatTime(new Date());
        }, 1000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("Inicializando Dashboard de Alertas v2.0");
    new AlertClient();
});
