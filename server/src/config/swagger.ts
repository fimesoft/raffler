import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Raffler API',
      version: '1.0.0',
      description: 'API para gestión de rifas y sorteos - Sistema de autenticación y usuarios',
      contact: {
        name: 'Equipo Raffler',
        email: 'support@raffler.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5001}`,
        description: 'Servidor de desarrollo'
      },
      {
        url: 'https://api.raffler.com',
        description: 'Servidor de producción'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtenido del endpoint de login'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'ID único del usuario'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email del usuario'
            },
            name: {
              type: 'string',
              description: 'Nombre completo del usuario'
            },
            image: {
              type: 'string',
              nullable: true,
              description: 'URL de la imagen de perfil'
            },
            emailVerified: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Fecha de verificación del email'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación de la cuenta'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización'
            }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'name'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Email del usuario',
              example: 'usuario@ejemplo.com'
            },
            password: {
              type: 'string',
              minLength: 6,
              description: 'Contraseña (mínimo 6 caracteres)',
              example: 'miContraseña123'
            },
            name: {
              type: 'string',
              minLength: 2,
              description: 'Nombre completo del usuario',
              example: 'Juan Pérez'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Email del usuario',
              example: 'usuario@ejemplo.com'
            },
            password: {
              type: 'string',
              description: 'Contraseña del usuario',
              example: 'miContraseña123'
            }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Mensaje de respuesta'
            },
            user: {
              $ref: '#/components/schemas/User'
            },
            accessToken: {
              type: 'string',
              description: 'Token JWT de acceso (expira en 15 minutos)'
            },
            refreshToken: {
              type: 'string',
              description: 'Token de renovación (expira en 7 días)'
            }
          }
        },
        RefreshTokenRequest: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: {
              type: 'string',
              description: 'Token de renovación válido'
            }
          }
        },
        ForgotPasswordRequest: {
          type: 'object',
          required: ['email'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Email del usuario',
              example: 'usuario@ejemplo.com'
            }
          }
        },
        ResetPasswordRequest: {
          type: 'object',
          required: ['token', 'password'],
          properties: {
            token: {
              type: 'string',
              description: 'Token de recuperación de contraseña'
            },
            password: {
              type: 'string',
              minLength: 6,
              description: 'Nueva contraseña (mínimo 6 caracteres)',
              example: 'nuevaContraseña123'
            }
          }
        },
        UpdateProfileRequest: {
          type: 'object',
          required: ['name'],
          properties: {
            name: {
              type: 'string',
              minLength: 2,
              description: 'Nuevo nombre del usuario',
              example: 'Juan Carlos Pérez'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Mensaje de error'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  msg: {
                    type: 'string'
                  },
                  param: {
                    type: 'string'
                  },
                  location: {
                    type: 'string'
                  }
                }
              },
              description: 'Errores de validación detallados'
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Mensaje de éxito'
            }
          }
        },
        HealthResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'OK'
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            },
            uptime: {
              type: 'number',
              description: 'Tiempo de actividad en segundos'
            }
          }
        },
        CreateRaffleRequest: {
          type: 'object',
          required: ['title', 'description', 'prize', 'ticketPrice', 'maxTickets', 'endDate'],
          properties: {
            title: {
              type: 'string',
              minLength: 3,
              maxLength: 200,
              description: 'Título de la rifa',
              example: 'iPhone 15 Pro'
            },
            description: {
              type: 'string',
              minLength: 10,
              maxLength: 2000,
              description: 'Descripción detallada de la rifa',
              example: 'Sorteamos un iPhone 15 Pro de 256GB color azul natural'
            },
            prize: {
              type: 'string',
              minLength: 3,
              maxLength: 200,
              description: 'Premio de la rifa',
              example: 'iPhone 15 Pro 256GB'
            },
            ticketPrice: {
              type: 'number',
              minimum: 0.01,
              description: 'Precio por boleto',
              example: 10000
            },
            maxTickets: {
              type: 'integer',
              minimum: 1,
              maximum: 10000,
              description: 'Número máximo de boletos',
              example: 500
            },
            endDate: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha y hora de finalización del sorteo',
              example: '2024-12-31T23:59:59Z'
            },
            image: {
              type: 'string',
              format: 'uri',
              description: 'URL de imagen del premio (opcional)',
              example: 'https://example.com/images/iphone.jpg'
            }
          }
        },
        UpdateRaffleRequest: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              minLength: 3,
              maxLength: 200,
              description: 'Título de la rifa'
            },
            description: {
              type: 'string',
              minLength: 10,
              maxLength: 2000,
              description: 'Descripción detallada de la rifa'
            },
            prize: {
              type: 'string',
              minLength: 3,
              maxLength: 200,
              description: 'Premio de la rifa'
            },
            ticketPrice: {
              type: 'number',
              minimum: 0.01,
              description: 'Precio por boleto'
            },
            maxTickets: {
              type: 'integer',
              minimum: 1,
              maximum: 10000,
              description: 'Número máximo de boletos'
            },
            endDate: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha y hora de finalización del sorteo'
            },
            image: {
              type: 'string',
              format: 'uri',
              description: 'URL de imagen del premio'
            }
          }
        },
        Raffle: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'ID único de la rifa'
            },
            title: {
              type: 'string',
              description: 'Título de la rifa'
            },
            description: {
              type: 'string',
              description: 'Descripción de la rifa'
            },
            prize: {
              type: 'string',
              description: 'Premio de la rifa'
            },
            ticketPrice: {
              type: 'number',
              description: 'Precio por boleto'
            },
            maxTickets: {
              type: 'integer',
              description: 'Número máximo de boletos'
            },
            soldTickets: {
              type: 'integer',
              description: 'Boletos vendidos'
            },
            endDate: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de finalización'
            },
            image: {
              type: 'string',
              nullable: true,
              description: 'URL de imagen'
            },
            isActive: {
              type: 'boolean',
              description: 'Si la rifa está activa'
            },
            winnerId: {
              type: 'string',
              nullable: true,
              description: 'ID del ganador'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación'
            },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                email: { type: 'string' }
              }
            }
          }
        },
        RaffleDetail: {
          allOf: [
            { $ref: '#/components/schemas/Raffle' },
            {
              type: 'object',
              properties: {
                tickets: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      number: { type: 'integer' },
                      status: { type: 'string', enum: ['SOLD', 'RESERVED', 'WINNER', 'REFUNDED'] },
                      purchaseDate: { type: 'string', format: 'date-time' },
                      buyer: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          name: { type: 'string' },
                          email: { type: 'string' }
                        }
                      }
                    }
                  }
                }
              }
            }
          ]
        },
        RaffleResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Mensaje de respuesta'
            },
            raffle: {
              $ref: '#/components/schemas/Raffle'
            }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            current: {
              type: 'integer',
              description: 'Página actual'
            },
            pages: {
              type: 'integer',
              description: 'Total de páginas'
            },
            total: {
              type: 'integer',
              description: 'Total de elementos'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Health',
        description: 'Endpoints para verificar el estado del servidor'
      },
      {
        name: 'Authentication',
        description: 'Endpoints para registro, login y gestión de tokens'
      },
      {
        name: 'Users',
        description: 'Endpoints para gestión de perfil de usuario'
      },
      {
        name: 'Raffles',
        description: 'Endpoints para gestión de rifas y sorteos'
      }
    ]
  },
  apis: [
    './server/src/routes/*.ts',
    './server/src/controllers/*.ts'
  ]
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Application): void => {
  // Swagger UI
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info h1 { color: #2563eb; }
      .swagger-ui .scheme-container { background: #f8fafc; padding: 10px; border-radius: 4px; }
    `,
    customSiteTitle: 'Raffler API Documentation',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      showRequestHeaders: true
    }
  }));

  // JSON endpoint
  app.get('/api/docs.json', (_, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });

  console.log(`📚 Swagger documentation available at: http://localhost:${process.env.PORT || 5001}/api/docs`);
};

export default specs;