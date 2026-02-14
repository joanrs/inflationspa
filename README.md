**InflationSPA**

Proyecto para visualizar, mediante imágenes extraídas de medios y gráficos, los principales indicadores macroeconómicos de España y ofrecer una calculadora que muestra la pérdida de poder adquisitivo causada por la inflación.

**Descripción**
- **Objetivo:** Mostrar indicadores macroeconómicos (con imágenes y gráficos) y proporcionar una calculadora que utiliza el Índice de Precios al Consumo (IPC) oficial para estimar la pérdida de poder adquisitivo desde enero de 2018 hasta el último IPC publicado.
- **Datos CPI (IPC):** La calculadora usa series oficiales del IPC; el origen principal es el Instituto Nacional de Estadística (INE) u otras fuentes oficiales equivalentes.

**Estructura del repositorio**
- **`index.html` / `index2.html` / `inflacion.html`:** Páginas principales del proyecto.
- **`functions/`**: Lógica serverless y procesamiento de datos (p. ej. `api_inflation_data.js`, `inflation_data.js`, `calculate.js`).
- **`static/`**: Recursos estáticos.
  - `static/css/styles.css` — estilos.
  - `static/images/` — imágenes extraídas de medios (atención a derechos de uso).
  - `static/js/chart.js` — gráficos y visualizaciones.

**Instalación y ejecución local**
- Clonar el repositorio:

```bash
git clone <repo-url>
cd <repo-folder>
```

- Servir la carpeta estática con Python (rápido, sin funciones serverless):

```bash
python3 -m http.server 8000
# Abrir http://localhost:8000/index.html
```

- Si quieres probar las funciones de `functions/` (Netlify Functions):

1. Instalar Netlify CLI (requiere Node.js):

```bash
npm install -g netlify-cli
```

2. Iniciar en modo local:

```bash
netlify dev
# Abrir http://localhost:8888 (o la URL que muestre)
```

Otras alternativas para servir localmente: `npx http-server .`.

**Uso de la calculadora de pérdida de poder adquisitivo**
- Abrir `inflacion.html` en el navegador o acceder desde la interfaz principal.
- Introducir la cantidad inicial y la fecha de inicio (la calculadora usa IPC desde `2018-01` en adelante) y seleccionar la fecha final (hasta el último dato publicado).
- La calculadora aplica la variación del IPC acumulada para mostrar la pérdida de poder adquisitivo y el valor equivalente ajustado por inflación.

**Fuentes de datos y actualización**
- Fuentes primarias: Instituto Nacional de Estadística (INE) u otros repositorios oficiales de estadísticas.
- Ficheros/servicios relevantes: `functions/inflation_data.js`, `functions/api_inflation_data.js`.
- Para actualizar los datos IPC:
  - Si existe un CSV o JSON de series históricas, sustituir el archivo de datos por el nuevo y reiniciar las funciones/servicio.
  - Si las funciones obtienen datos en tiempo real, revisar la rutina de consulta en `functions/api_inflation_data.js` y actualizar la URL/API y el formato de parsing según la fuente.

**Despliegue**
- Este proyecto está preparado para desplegarse en Netlify (archivo `netlify.toml` incluido). Pasos generales:

```bash
netlify deploy --prod
```

- Asegúrate de configurar las variables de entorno y las funciones si usas APIs privadas.

**Consideraciones legales y derechos de imagen**
- Las imágenes procedentes de medios están sujetas a derechos de autor. Revisa y, si es necesario, solicita permiso o usa imágenes con licencia compatible (p. ej. Creative Commons, dominio público).
- Indica la fuente de cada imagen y cita al medio cuando corresponda.

**Contribuciones**
- Pull requests bienvenidas. Por favor, crear branches descriptivos y documentar cambios.
- Abrir issues para discutir nuevas características o problemas.

**Licencia**
- Por defecto: MIT. Cambia según tus necesidades.

**Créditos y contactos**
- Autor: proyecto desarrollado por el equipo/autor del repositorio.
- Fuentes de datos: INE y fuentes oficiales.
- Para cuestiones o contribuciones: abrir un issue en el repositorio.

---

Si quieres, puedo:
- Añadir un archivo `LICENSE` con MIT.
- Preparar instrucciones automáticas para actualizar el IPC desde la web del INE.
- Adaptar el README con más detalles sobre las funciones internas (`functions/*`).

**Script de actualización automática del IPC**
- Se ha añadido `scripts/fetch_ipc.js`, un script Node que descarga una fuente de datos (CSV o JSON) y genera `functions/ipc.json` con la serie normalizada.
- Uso:

```bash
IPC_SOURCE_URL="https://ejemplo.com/ipc.csv" IPC_OUTPUT="functions/ipc.json" node scripts/fetch_ipc.js
```

- El script intenta detectar CSV (con `;` o `,`) o JSON y normalizar columnas comunes (`Year`/`Año` + `Month`/`Mes`, o `Date`/`Fecha`). Ajusta `IPC_SOURCE_URL` según la fuente oficial (INE u otra API).
