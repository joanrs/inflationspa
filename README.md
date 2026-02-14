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

**Fórmula usada en la calculadora (coincidente con `inflacion.html`)**

La calculadora implementada en `inflacion.html` aplica la corrección mes a mes usando la siguiente regla iterativa:

$$S_n = \frac{S_{n-1}}{\left(1 + \dfrac{i_n}{1200}\right)}$$

donde:
- $S_n$ es el valor de los ahorros al final del mes $n$ (descontando la inflación de ese mes).
- $S_{n-1}$ es el valor al inicio del mes $n$ (o el final del mes anterior).
- $i_n$ es la tasa anual del IPC (%) correspondiente al mes $n$ (p. ej. la variación anual en % publicada para ese mes).
- El divisor $1200$ convierte $i_n$ (porcentaje anual) a un valor mensual en forma decimal: $\frac{i_n}{100}$ es la tasa anual en decimal, dividir entre $12$ da la tasa mensual aproximada, por eso $100*12 = 1200$ en el denominador.

Interpretación y derivación práctica
- Si el INE proporciona la tasa anual $i_n$ para el mes $n$, esta implementación aproxima la tasa mensual como $r_n \approx i_n / 1200$ (en decimal). Luego se ajusta el saldo dividiéndolo por $1+r_n$ para trasladar el poder adquisitivo al mes siguiente.
- Aplicando la regla iterativamente para todos los meses del período se obtiene el saldo final real tras descontar inflación mes a mes:

$$S_{final} = S_0 \prod_{n=1}^{N} \frac{1}{1 + i_n/1200}$$

Relación con la conversión por niveles del IPC
- Si en vez de aplicar tasas mensuales aproximadas se dispone de los niveles del índice (por ejemplo `IPC_t0` y `IPC_t1` como índices absolutos), la conversión exacta entre dos fechas viene dada por la razón de índices:

$$A_{equivalente\;en\;t1} = A \times \frac{IPC_{t1}}{IPC_{t0}}$$

- El método por índices es exactamente correcto siempre que se usen los mismos índices (misma serie y base). La fórmula iterativa usada en la calculadora es una aproximación práctica cuando se trabaja con tasas anuales mensuales publicadas ($i_n$). En muchos casos, para periodos modestos, la aproximación es suficientemente precisa; para mayor exactitud conviene usar niveles de índice si están disponibles.

Ejemplo numérico (coherente con la práctica en la web)
- Suponiendo $S_0 = 1000\,€$ y aplicando las tasas mensuales derivadas de los $i_n$ publicados, la calculadora computa $S_{final}$ por la fórmula iterativa anterior y obtiene la pérdida como $P = S_0 - S_{final}$.

Limitaciones y recomendaciones
- La aproximación $i_n/12$ (implícita en `i_n/1200`) presupone una distribución uniforme de la inflación anual en los 12 meses; no es exacta frente a composiciones mensuales reales.
- Para máxima precisión, si `functions/ipc.json` contiene niveles de índice, la calculadora puede (y se le puede pedir que) emplee la conversión por ratio de índices (`IPC_t0/IPC_t1`) en lugar de la aproximación por tasas.
- Asegúrate de que la serie usada (nivel geográfico y tipo: `Total Nacional - Índice general`) sea consistente entre `t0` y `t1`.

Se puede adaptar la calculadora para usar directamente niveles de índice (más exacto) en lugar de la aproximación mensual. Esta modificación sería pequeña y mejora la precisión.


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
