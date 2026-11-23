const { createServer } = require("node:http");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");

const datos = JSON.parse(readFileSync(join(__dirname, "especialidades.json"), "utf8"));
const especialidades = datos.especialidades;
const puerto = Number(process.env.PORT) || 3000;

const servidor = createServer((solicitud, respuesta) => {
  respuesta.setHeader("Access-Control-Allow-Origin", "*");
  respuesta.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  respuesta.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (solicitud.method === "OPTIONS") {
    respuesta.writeHead(204);
    respuesta.end();
    return;
  }

  if (solicitud.method !== "GET") {
    respuesta.writeHead(405, { "Content-Type": "application/json; charset=utf-8" });
    respuesta.end(JSON.stringify({ error: "Método no permitido" }));
    return;
  }

  const ruta = new URL(solicitud.url || "/", "http://localhost").pathname;
  if (ruta === "/health") {
    respuesta.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    respuesta.end(JSON.stringify({ ok: true }));
    return;
  }

  if (ruta === "/especialidades") {
    respuesta.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    respuesta.end(JSON.stringify(especialidades));
    return;
  }

  respuesta.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
  respuesta.end(JSON.stringify({ error: "Ruta no encontrada" }));
});

servidor.listen(puerto, "0.0.0.0", () => {
  console.log(`API lista en el puerto ${puerto}`);
});
