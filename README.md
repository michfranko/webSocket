# Cliente de Dashboard de Alertas en Tiempo Real

## Descripción Técnica

Este proyecto consiste en una aplicación web front-end que funciona como un dashboard de monitoreo en tiempo real. Establece una conexión persistente con un servidor WebSocket para recibir y mostrar alertas del sistema de forma dinámica. La aplicación está diseñada como una interfaz de página única (SPA), construida con JavaScript puro (vanilla), HTML y CSS, asegurando dependencias mínimas y un alto rendimiento.

La lógica principal está encapsulada dentro de la clase `AlertClient`, que gestiona el ciclo de vida del WebSocket, procesa los datos entrantes y maneja todas las manipulaciones del DOM para renderizar las alertas y estadísticas.

## Tecnologías Utilizadas

-   **JavaScript (ES6+)**: Utilizado para toda la lógica de la aplicación, incluyendo la comunicación WebSocket y la manipulación del DOM. El código está estructurado usando clases de ES6 para una mejor organización y encapsulamiento.
-   **HTML5**: Proporciona el marcado estructural para la interfaz de usuario.
-   **CSS3**: Se utiliza para estilizar los componentes del dashboard, incluyendo consideraciones de diseño responsivo.
-   **API WebSocket (Navegador)**: La API nativa del navegador se utiliza para la comunicación bidireccional en tiempo real con el servidor backend.

## Arquitectura del Sistema

La aplicación sigue una arquitectura cliente-servidor simple.

-   **Arquitectura del Lado del Cliente**: El front-end es una aplicación monolítica de página única. La clase `AlertClient` actúa como el controlador principal, manejando todos los aspectos del estado y la vista de la aplicación. Esta decisión de diseño simplifica la base del código al evitar la necesidad de frameworks externos o librerías de gestión de estado, lo cual es adecuado para un proyecto de esta escala.
-   **Comunicación**: La comunicación se maneja exclusivamente a través del protocolo WebSocket. El cliente escucha los mensajes del servidor y actualiza la interfaz de usuario en tiempo real. Se implementa un mecanismo de `ping/pong` para mantener la conexión y manejar desconexiones inesperadas de forma elegante a través de una estrategia de reconexión automática.

## Prerrequisitos

-   Un navegador web moderno con soporte para la API WebSocket (ej. Chrome, Firefox, Edge).
-   Un endpoint de servidor WebSocket en funcionamiento al que el cliente pueda conectarse.

## Guía de Instalación y Configuración

Este proyecto no requiere pasos de compilación ni una instalación compleja.

1.  **Clonar el repositorio**:
    ```bash
    git clone https://github.com/michfranko/webSocket.git
    ```
2.  **Configurar el endpoint del servidor**:
    Abra el archivo `client/app.js` y modifique la variable `wsUrl` en el constructor de `AlertClient` para que apunte a su instancia del servidor WebSocket.
    ```javascript
    constructor(wsUrl = 'ws://su-servidor-websocket-ip:puerto') {
        // ...
    }
    ```

## Guía de Ejecución en Entorno de Desarrollo

Para ejecutar el cliente en un entorno de desarrollo, puede servir el directorio `client` utilizando cualquier servidor de archivos estáticos.

1.  **Usando un servidor simple de Python**:
    Navegue al directorio raíz del proyecto y ejecute:
    ```bash
    python -m http.server 8080 --directory client
    ```
2.  **Usando `http-server` de Node.js**:
    Si tiene Node.js instalado, puede usar el paquete `http-server`.
    ```bash
    npm install -g http-server
    cd client
    http-server -p 8080
    ```
3.  Acceda a la aplicación navegando a `http://localhost:8080` en su navegador web.

## Estructura del Proyecto

```
.
├── client/
│   ├── app.js         # Lógica principal de la aplicación (cliente WebSocket y gestión de UI)
│   ├── index.html     # Estructura del documento HTML principal
│   └── styles.css     # Estilos CSS para el dashboard
└── README.md          # Documentación del proyecto
```

## Documentación de Despliegue

El cliente puede ser desplegado sirviendo los contenidos del directorio `client` como un sitio web estático. Esto se puede lograr utilizando servidores web como Nginx o Apache, o servicios en la nube como AWS S3, Google Cloud Storage o Netlify.

**Ejemplo de Configuración para Nginx**:
```nginx
server {
    listen 80;
    server_name su-dominio.com;

    root /ruta/a/su/proyecto/client;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}
