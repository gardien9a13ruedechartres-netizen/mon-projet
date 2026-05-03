const ALLOWED_ORIGINS = [
  "https://jsonplaceholder.typicode.com",
  "https://api.exemple.com"
];

const ALLOWED_METHODS = ["GET", "POST"];

export default async function handler(req, res) {
  try {
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

    const origin = targetUrl.origin;

    if (!ALLOWED_ORIGINS.includes(origin)) {
      return res.status(403).json({
        error: "Domaine non autorisé"
      });
    }

    const headers = {
      "Accept": req.headers.accept || "application/json"
    };

    if (req.headers["content-type"]) {
      headers["Content-Type"] = req.headers["content-type"];
    }

    const fetchOptions = {
      method: req.method,
      headers
    };

    if (req.method === "POST") {
      fetchOptions.body = JSON.stringify(req.body || {});
    }

    const response = await fetch(targetUrl.toString(), fetchOptions);

    const contentType = response.headers.get("content-type") || "text/plain";
    const body = await response.text();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Content-Type", contentType);

    return res.status(response.status).send(body);
  } catch (error) {
    return res.status(500).json({
      error: "Erreur proxy",
      details: error.message
    });
  }
}