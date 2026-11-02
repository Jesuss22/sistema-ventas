const crypto = require('crypto');

function responderError(res, error, contexto) {
  const id = crypto.randomUUID();
  console.error(`[${id}] ${contexto}`, error);
  return res.status(500).json({
    error: 'Error interno del servidor',
    id,
  });
}

module.exports = { responderError };
