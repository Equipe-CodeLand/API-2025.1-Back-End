// src/swagger.ts
import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Documentação da API',
    version: '1.0.0',
    description: 'Documentação gerada automaticamente com Swagger',
  },
  servers: [
    {
      url: 'http://localhost:3000', // Altere se sua API rodar em outra porta
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.ts'], // Caminho onde estão suas rotas documentadas
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
