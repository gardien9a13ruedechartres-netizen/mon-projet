const ALLOWED_CLIENT_ORIGINS = [
  "https://player-engine.com",
  "https://trontv.win",
  "https://player-engine.com/pages/test5",
  "https://livewatch.top"
];

const ALLOWED_TARGET_ORIGINS = [
  "https://jsonplaceholder.typicode.com"
];

const ALLOWED_METHODS = ["GET", "POST", "OPTIONS"];

function setCors(req, res) {
  const origin = req.headers.origin;

  if (ALLOWED_CLIENT_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

export default async function handler(req, res) {
  setCors(req, res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (!ALLOWED_METHODS.includes(req.method)) {
    return res.status(405).json({
      error: "Méthode non autorisée"
    });
  }

  const target = req.query.url;

  if (!target) {
    return res.status(400).json({
      error: "Paramètre url manquant"
    });
  }

  let targetUrl;

  try {
    targetUrl = new URL(target);
  } catch {
    return res.status(400).json({
      error: "URL invalide"
    });
  }

  if (!ALLOWED_TARGET_ORIGINS.includes(targetUrl.origin)) {
    return res.status(403).json({
      error: "API externe non autorisée",
      origin: targetUrl.origin
    });
  }

  const requestBody =
    req.method === "POST" ? JSON.stringify(req.body || {}) : undefined;

  try {
    const response = await fetch(targetUrl.toString(), {
      method: req.method,
      headers: {
        Accept: req.headers.accept || "application/json",
        "Content-Type": req.headers["content-type"] || "application/json"
      },
      body: requestBody
    });

    const contentType = response.headers.get("content-type") || "text/plain";
    const body = await response.text();

    res.setHeader("Content-Type", contentType);

    return res.status(response.status).send(body);
  } catch (error) {
    return res.status(500).json({
      error: "Erreur proxy",
      details: error.message
    });
  }
}
