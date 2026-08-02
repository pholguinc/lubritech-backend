
export const AUTH_SWAGGER_TAG = {
  name: '🔐 Autenticación',
  description: 'Endpoints de acceso y gestión de sesiones',
};


// Agrupa todos los tags para registrar en el DocumentBuilder
export const ALL_SWAGGER_TAGS = [

  AUTH_SWAGGER_TAG,

] as const;
