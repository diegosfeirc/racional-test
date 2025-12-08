# Racional App

Aplicación frontend desarrollada con React, TypeScript y Vite para la visualización y gestión de portafolios de inversión. Permite a los usuarios monitorear la evolución de sus inversiones, analizar retornos diarios y mensuales, y visualizar el rendimiento de su portafolio a través de gráficos interactivos.

## Índice

- [Descripción del Proyecto](#descripción-del-proyecto)
- [Ejecución Local](#ejecución-local)
- [Datos de Firestore](#datos-de-firestore)
- [Páginas y Gráficos](#páginas-y-gráficos)
- [Uso de IA](#uso-de-ia)
- [Funcionalidades Futuras](#funcionalidades-futuras)

## Descripción del Proyecto

Racional App es una aplicación web que proporciona una interfaz intuitiva para que los inversores puedan:

- Visualizar la evolución temporal de su portafolio de inversiones
- Analizar retornos diarios y mensuales en formato calendario
- Consultar estadísticas de rendimiento, ganancias y retornos
- Navegar entre diferentes períodos de tiempo para análisis comparativos

La aplicación se conecta con una API backend (racional-api) para obtener los datos de inversión y retornos del usuario.

## Ejecución Local

Para ejecutar la aplicación en tu entorno local, sigue estos pasos:

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno:**
   
   Crea un archivo `.env` en la raíz del proyecto (`racional-app/`) y agrega las siguientes variables de entorno de Firebase:

   ```env
   VITE_FIREBASE_API_KEY=tu_api_key
   VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain
   VITE_FIREBASE_DATABASE_URL=tu_database_url
   VITE_FIREBASE_PROJECT_ID=tu_project_id
   VITE_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
   VITE_FIREBASE_APP_ID=tu_app_id
   ```

   > **Nota:** Reemplaza los valores `tu_*` con las credenciales reales del proyecto Firebase. Estas variables son necesarias para que la aplicación se conecte correctamente a Firebase Firestore.

3. **Ejecutar la aplicación en modo desarrollo:**
   ```bash
   npm run dev
   ```

   La aplicación estará disponible en `http://localhost:5173` (o el puerto que Vite asigne automáticamente).

## Datos de Firestore

La aplicación consume datos desde Firebase Firestore, específicamente de la colección `investmentEvolutions`. Cada documento en esta colección corresponde a un usuario y contiene un array de puntos de datos históricos que representan la evolución de su portafolio a lo largo del tiempo.

Cada punto de datos incluye los siguientes campos:

- **`date`**: Timestamp de Firestore que indica la fecha del registro
- **`portfolioValue`**: Valor total del portafolio en ese momento
- **`portfolioIndex`**: Valor normalizado (base 100) que simula cómo le habría ido a la inversión si no hubieramos metido ni sacado plata extra. (Calidad pura de la inversión)
- **`dailyReturn`**: Retorno diario (ganancia o pérdida del día)
- **`contributions`**: Total acumulado de contribuciones o depósitos realizados hasta esa fecha

Estos datos se utilizan para alimentar tanto el gráfico de evolución temporal del portafolio como el calendario de retornos diarios y mensuales, permitiendo visualizar el rendimiento histórico de las inversiones.

## Páginas y Gráficos

### Landing Page (`/`)
Página de inicio que presenta la aplicación con un video promocional y un botón de acceso rápido para ver la evolución del portafolio.

### Evolución del Portafolio (`/evolution`)
Esta página muestra un gráfico interactivo de la evolución del portafolio de inversiones con las siguientes características:

**Gráfico de Evolución:**
- **Gráfico compuesto (ComposedChart)** que visualiza:
  - **Área con gradiente**: Representa el valor total del portafolio a lo largo del tiempo
  - **Línea de inversiones**: Muestra la evolución del valor total de las inversiones
  - **Línea de contribuciones**: Indica el total de depósitos realizados
- **Selector de período**: Permite filtrar los datos por diferentes rangos temporales:
  - 24 horas
  - 1 mes
  - Mes a la fecha (MTD)
  - Año a la fecha (YTD)
  - 1 año
  - Todos los datos disponibles

**Estadísticas mostradas:**
- Total Inversiones: Valor actual del portafolio
- Total Depósitos: Suma de todas las contribuciones realizadas
- Ganancias: Diferencia entre el valor actual y las contribuciones
- Retorno total: Porcentaje de retorno sobre las inversiones

### Retornos Diarios y Mensuales (`/returns`)
Esta página presenta un calendario interactivo para visualizar los retornos de inversión:

**Vista Mensual:**
- Calendario tipo grid que muestra los retornos diarios de cada día del mes
- Cada día muestra su retorno con código de colores (verde para ganancias, rojo para pérdidas)
- Navegación entre meses con botones anterior/siguiente

**Vista Anual:**
- Grid de 12 meses mostrando el retorno total de cada mes
- Cada mes es clickeable para navegar a su vista mensual detallada
- Visualización del número de días con datos disponibles por mes

**Estadísticas del período:**
- PNL Total: Ganancia o pérdida neta del período seleccionado
- Promedio: Retorno promedio diario o mensual
- Días/Meses con datos: Cantidad de períodos con información disponible

## Uso de IA

### Usos principales (Gemini 3 + Cursor)

1. **Planificación del Stack**: Le dí el contexto del desafío a Gemini, junto al contexto de las tecnologías que yo manejo, para conversar qué tecnologías serían las más apropiadas para desarrollar la tarea.

2. **Planificación de los gráficos**: Conversé mucho con Gemini sobre la representación de los datos que recibía desde Firestore, los gráficos que quería implementar, y qué gráficos tablas me recomendaba según los datos que recibía.

3. **Desarrollo**: Para el desarrollo, creación de estilos y organización del código, Cursor fue una tremenda ayuda, para dejar la aplicación de la mejor forma posible, usando el modo Ask para discutir lo que quería implementar; el modo Plan para planificar bien las implementaciones y resolver dudas; y el modo Agent para ejecutar las implementaciones planificadas.

## Funcionalidades Futuras

### Gráfico Comparativo con Benchmark

Una funcionalidad que me hubiera gustado implementar es un gráfico comparativo que permita visualizar el rendimiento del `portfolioIndex` (que representa la calidad pura de la inversión, normalizado a base 100) contra un benchmark de referencia como el S&P 500. Este gráfico permitiría a los usuarios evaluar si su estrategia de inversión está superando o quedando por debajo del mercado de referencia, proporcionando una perspectiva valiosa sobre la efectividad de sus decisiones de inversión.