# Racional API

API REST desarrollada con NestJS para la gestión de portafolios de inversión. Permite a los usuarios gestionar sus transacciones financieras, órdenes de compra/venta de acciones y portafolios de inversión.

## Descripción

Racional API es una aplicación backend que proporciona endpoints para:
- Gestión de usuarios y sus datos personales
- Registro de depósitos y retiros de fondos
- Creación y ejecución de órdenes de compra/venta de acciones
- Administración de portafolios de inversión
- Consulta de balances y movimientos

## Instrucciones para ejecutar la API

### Prerrequisitos

- Docker y Docker Compose instalados
- Make

### Ejecutar con Make

El comando `make up` es la forma más sencilla de levantar toda la aplicación:

```bash
make up
```

**¿Qué hace este `make up`?**

1. Verifica que Docker esté instalado y funcionando
2. Construye las imágenes Docker necesarias
3. Ejecuta los tests de integración primero:
   - Levanta una base de datos PostgreSQL temporal para tests (puerto 5433)
   - Ejecuta las migraciones en la base de datos de tests
   - Ejecuta todos los tests de integración
4. **Solo si los tests pasan exitosamente**, levanta los servicios de desarrollo:
   - **PostgreSQL**: Base de datos en el puerto 5432
   - **API**: Servidor NestJS en el puerto 3000
5. Ejecuta automáticamente las migraciones en la base de datos de desarrollo
6. Ejecuta el seed para poblar la base de datos con datos iniciales

**Importante**: Si los tests de integración fallan, los servicios de desarrollo (API y PostgreSQL) **no se iniciarán**, garantizando que solo se ejecute código que ha pasado todas las pruebas.

Una vez ejecutado exitosamente, la API estará disponible en:
- **API**: http://localhost:3000
- **Documentación Swagger**: http://localhost:3000/docs
- **PostgreSQL**: localhost:5432

### Otros comandos útiles

```bash
make dev      # Levanta solo servicios de desarrollo (sin tests)
make down     # Detiene todos los servicios
make clean    # Detiene servicios y elimina volúmenes (limpia datos)
make logs     # Muestra logs de todos los servicios
make status   # Muestra el estado de los servicios
```

## Data Seed

Al ejecutar `make up`, se crea automáticamente la siguiente data inicial:

- **Usuario de prueba**:
  - ID: `user-123`
  - Email: `usuario@example.com`
  - Nombre: Juan Pérez

- **Wallet**:
  - ID: `wallet-123`
  - Balance inicial: $0

- **Portafolio**:
  - ID: `portfolio-123`
  - Nombre: "Mi portafolio"
  - Descripción: "Portafolio de inversión a largo plazo"

- **Stocks disponibles**:
  - **AAPL** (Apple Inc.) - $150.50 - ID: `stock-1`
  - **TSLA** (Tesla Inc.) - $175.50 - ID: `stock-2`
  - **META** (Meta Inc.) - $215.50 - ID: `stock-3`

Esta data seed permite probar la API inmediatamente sin necesidad de crear datos manualmente.

## Rutas de la API

### 1. Registrar depósito/retiro de un usuario

**Endpoint**: `POST /transactions`

Registra una transacción de depósito o retiro para un usuario. Requiere:
- `userId`: ID del usuario
- `type`: Tipo de transacción (`DEPOSIT` o `WITHDRAWAL`)
- `amount`: Monto de la transacción
- `date`: Fecha de la transacción
- `description`: Descripción opcional

**Ejemplo**:
```json
{
  "userId": "user-123",
  "type": "DEPOSIT",
  "amount": 1000.00,
  "date": "2024-12-04T10:00:00Z",
  "description": "Depósito inicial"
}
```

### 2. Registrar orden de compra/venta de una Stock

**Endpoint**: `POST /orders`

Registra una orden de compra o venta de acciones. Requiere:
- `userId`: ID del usuario
- `stockId`: ID de la acción
- `portfolioId`: ID del portafolio
- `type`: Tipo de orden (`BUY` o `SELL`)
- `quantity`: Cantidad de acciones
- `unitPrice`: Precio unitario

**Ejemplo**:
```json
{
  "userId": "user-123",
  "stockId": "stock-1",
  "portfolioId": "portfolio-123",
  "type": "BUY",
  "quantity": 10,
  "unitPrice": 150.50
}
```

### 3. Editar información personal del usuario

**Endpoint**: `PATCH /users/:id`

Actualiza la información personal de un usuario. Permite actualizar:
- `email`: Email del usuario
- `firstName`: Nombre
- `lastName`: Apellido

**Ejemplo**:
```json
{
  "firstName": "Pedro",
  "lastName": "González"
}
```

### 4. Editar información del portafolio del usuario

**Endpoint**: `PATCH /portfolios/:id`

Actualiza la información de un portafolio. Permite actualizar:
- `name`: Nombre del portafolio
- `description`: Descripción del portafolio

**Ejemplo**:
```json
{
  "name": "Portafolio Agresivo",
  "description": "Estrategia de alto riesgo"
}
```

### 5. Consultar el total de un portafolio de un usuario

**Endpoint**: `GET /portfolios/:id/total`

Retorna el valor total del portafolio calculado con los precios actuales de las acciones, incluyendo detalles de cada holding.

**Respuesta**:
```json
{
  "portfolioId": "portfolio-123",
  "totalValue": 1505.00,
  "holdings": [...]
}
```

### 6. Consultar los últimos movimientos del usuario

**Endpoint**: `GET /users/:id/movements?limit=10`

Retorna los últimos movimientos del usuario (transacciones y órdenes), ordenados por fecha descendente. El parámetro `limit` es opcional (por defecto 10).

**Ejemplo**: `GET /users/user-123/movements?limit=20`

### Documentación completa

La documentación oficial de todos los endpoints está disponible en la ruta `/docs` cuando la API está corriendo. Esta documentación interactiva (Swagger) permite:
- Ver todos los endpoints disponibles
- Probar los endpoints directamente desde el navegador
- Ver los esquemas de request y response
- Ver ejemplos de uso

**Acceso**: http://localhost:3000/docs

## Modelo de Datos

### Entidades principales

- **User**: Representa a un usuario del sistema con información personal (email, nombre, apellido)
- **Wallet**: Billetera asociada a un usuario que almacena el balance disponible
- **Portfolio**: Portafolio de inversión de un usuario. Un usuario puede tener múltiples portafolios
- **Stock**: Acción disponible en el sistema con su símbolo, nombre y precio actual
- **Transaction**: Registro de depósitos y retiros de fondos de un usuario
- **Order**: Orden de compra o venta de acciones con estado (PENDING, EXECUTED, CANCELLED)
- **PortfolioHolding**: Relación entre un portafolio y una acción, almacenando la cantidad y precio promedio de compra

### Justificación de decisiones de diseño

1. **Implementación de Wallet**: La wallet se implementó como una entidad separada para centralizar el balance disponible del usuario, permitiendo un control claro de los fondos líquidos antes de ser invertidos en portafolios. Esto facilita la gestión de depósitos y retiros, y permite validar que el usuario tenga fondos suficientes antes de ejecutar órdenes de compra.

2. **Separación de Wallet y Portfolio**: Se separaron para permitir que un usuario tenga múltiples portafolios pero una sola billetera centralizada, facilitando la gestión de fondos.

3. **Múltiples portafolios por usuario**: Se permite que un usuario tenga varios portafolios (único por nombre por usuario) para poder organizar inversiones por estrategia, objetivo o riesgo.

4. **PortfolioHolding como entidad separada**: Permite rastrear el precio promedio de compra de cada acción en cada portafolio, facilitando el cálculo de ganancias/pérdidas.

5. **Decimal para montos**: Se utiliza `Decimal` en lugar de `Float` para evitar problemas de precisión en cálculos financieros.

**Diagrama ER**: Ver el diagrama de entidad-relación completo en [assets/racional_api_test.png](./assets/racional_api_test.png).

## Uso de IA

### Usos principales (Gemini 3 + Cursor)

1. **Planificación del Stack**: Le dí el contexto del desafío a Gemini, junto al contexto de las tecnologías que yo manejo, para conversar qué tecnologías serían las más apropiadas para desarrollar la tarea.

2. **Planificación del modelo de datos**: Conversé mucho con Gemini sobre el modelo de datos, las tablas que quería implementar, los beneficios/desventajas de lo que yo propuse en un inicio y cómo mejorarlo.

3. **Desarrollo de la API**: Para el desarrollo, testeo y perfeccionamiento del código, Cursor fue una tremenda ayuda, para dejar la aplicación de la mejor forma posible, usando el modo Ask para discutir nuevas features; el modo Plan para planificar bien las implementaciones y resolver dudas; y el modo Agent para ejecutar las implementaciones planificadas.