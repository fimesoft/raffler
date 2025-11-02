# Modelo de Datos - Raffler

## Diagrama de Entidad-Relación

```mermaid
erDiagram
    User {
        int id PK
        string email UK
        string password
        string name
        string image
        datetime emailVerified
        boolean isActive
        string documentType FK
        string documentNumber UK
        string phone
        datetime dateOfBirth
        string address
        string city
        string country
        boolean documentVerified
        boolean phoneVerified
        datetime createdAt
        datetime updatedAt
        string resetToken
        datetime resetTokenExpires
    }

    Account {
        int id PK
        int userId FK
        string type
        string provider
        string providerAccountId
        string refresh_token
        string access_token
        int expires_at
        string token_type
        string scope
        string id_token
        string session_state
    }

    Session {
        int id PK
        string sessionToken UK
        int userId FK
        datetime expires
    }

    VerificationToken {
        string identifier
        string token UK
        datetime expires
    }

    Raffle {
        int id PK
        string title
        string description
        string prize
        string image
        float ticketPrice
        int maxTickets
        int soldTickets
        datetime endDate
        boolean isActive
        int winnerId
        datetime createdAt
        datetime updatedAt
        int userId FK
    }

    Ticket {
        int id PK
        int number
        int raffleId FK
        int buyerId FK
        string status FK
        string buyerDocument
        string phone
        datetime purchaseDate
        datetime updatedAt
    }

    DocumentType {
        string DNI
        string CC
        string CE
        string PASSPORT
        string NIT
    }

    TicketStatus {
        string SOLD
        string RESERVED
        string WINNER
        string REFUNDED
    }

    %% Relaciones principales
    User ||--o{ Account : "tiene"
    User ||--o{ Session : "tiene"
    User ||--o{ Raffle : "crea"
    User ||--o{ Ticket : "compra"
    
    Raffle ||--o{ Ticket : "contiene"
    
    User ||--o| DocumentType : "usa"
    Ticket ||--o| TicketStatus : "tiene"
    
    %% Relaciones adicionales
    Raffle ||--o| User : "winner (winnerId)"
```

## Descripción de Tablas

### 🧑‍💼 **User (Usuarios)**
**Tabla principal** que almacena toda la información de usuarios del sistema.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INT (PK) | Identificador único autoincremental |
| `email` | STRING (UK) | Email único del usuario |
| `password` | STRING | Hash de la contraseña |
| `name` | STRING | Nombre completo del usuario |
| `image` | STRING | URL del avatar del usuario |
| `emailVerified` | DATETIME | Fecha de verificación del email |
| `isActive` | BOOLEAN | Estado activo del usuario |
| `documentType` | ENUM | Tipo de documento (DNI, CC, CE, PASSPORT, NIT) |
| `documentNumber` | STRING (UK) | Número único del documento |
| `phone` | STRING | Teléfono de contacto |
| `dateOfBirth` | DATETIME | Fecha de nacimiento |
| `address` | STRING | Dirección física |
| `city` | STRING | Ciudad de residencia |
| `country` | STRING | País de residencia |
| `documentVerified` | BOOLEAN | Si el documento fue verificado |
| `phoneVerified` | BOOLEAN | Si el teléfono fue verificado |

### 🎫 **Raffle (Rifas)**
**Tabla central** que define las rifas disponibles.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INT (PK) | Identificador único de la rifa |
| `title` | STRING | Título de la rifa |
| `description` | STRING | Descripción detallada |
| `prize` | STRING | Descripción del premio |
| `image` | STRING | URL de la imagen del premio |
| `ticketPrice` | FLOAT | Precio por boleto |
| `maxTickets` | INT | Número máximo de boletos |
| `soldTickets` | INT | Contador de boletos vendidos |
| `endDate` | DATETIME | Fecha de finalización |
| `isActive` | BOOLEAN | Estado activo de la rifa |
| `winnerId` | INT (FK) | ID del usuario ganador |
| `userId` | INT (FK) | ID del creador de la rifa |

### 🎟️ **Ticket (Boletos)**
**Tabla de alta concurrencia** que almacena todos los boletos vendidos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INT (PK) | Identificador único del boleto |
| `number` | INT | Número del boleto en la rifa |
| `raffleId` | INT (FK) | ID de la rifa |
| `buyerId` | INT (FK) | ID del comprador |
| `status` | ENUM | Estado del boleto (SOLD, RESERVED, WINNER, REFUNDED) |
| `buyerDocument` | STRING | Documento del comprador para verificación |
| `buyerPhone` | STRING | Teléfono del comprador |

### 🔐 **Account & Session (Autenticación)**
**Tablas de NextAuth.js** para manejo de sesiones y proveedores OAuth.

### 📊 **Enums**
- **DocumentType**: DNI, CC, CE, PASSPORT, NIT
- **TicketStatus**: SOLD, RESERVED, WINNER, REFUNDED

## Relaciones Clave

### **1:N (Uno a Muchos)**
- `User` → `Raffle` (Un usuario puede crear múltiples rifas)
- `User` → `Ticket` (Un usuario puede comprar múltiples boletos)
- `Raffle` → `Ticket` (Una rifa puede tener múltiples boletos)
- `User` → `Account` (Un usuario puede tener múltiples cuentas OAuth)
- `User` → `Session` (Un usuario puede tener múltiples sesiones)

### **1:1 (Uno a Uno)**
- `Raffle` → `User` (winnerId) (Una rifa puede tener un ganador)

### **Índices Importantes**
```sql
-- Índices únicos
UNIQUE (email)
UNIQUE (documentNumber)
UNIQUE (sessionToken)
UNIQUE (token) -- VerificationToken
UNIQUE (raffleId, number) -- Un número por rifa

-- Índices compuestos
INDEX (provider, providerAccountId)
INDEX (identifier, token)
```

## Consideraciones de Escalabilidad

### 🔥 **Tabla Crítica: Tickets**
- **Alto volumen** de inserts durante compras
- **Queries frecuentes** por raffleId
- **Candidata para particionamiento** por fecha o raffleId

### 📈 **Optimizaciones Implementadas**
- `soldTickets` desnormalizado en `Raffle` para evitar COUNT(*)
- Índices únicos para prevenir duplicados
- Campos calculados para mejorar performance

### 🚀 **Próximas Optimizaciones**
- Particionamiento de tabla `Tickets`
- Cache de números disponibles en Redis
- Separación de rifas activas/completadas