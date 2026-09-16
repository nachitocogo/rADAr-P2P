/**
 * Convierte dist/index.html (build single-file) en un fragmento HTML sin
 * <!doctype>/<html>/<head>/<body>, listo para publicarse como Artifact
 * o pegarse dentro de cualquier página. Salida: dist/radar-p2p-artifact.html
 */
import { readFileSync, writeFileSync } from 'node:fs';

const src = readFileSync('dist/index.html', 'utf8');
const head = src.match(/<head>([\s\S]*?)<\/head>/i)?.[1] ?? '';
const body = src.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? '';

const keepHead = head
  .replace(/<meta[^>]*>/gi, '')                        // charset/viewport los pone el host
  .replace(/<link[^>]*rel="icon"[^>]*>/gi, '')          // favicon lo pone el host
  .trim();

const out = `${keepHead}\n${body.trim()}\n`;
writeFileSync('dist/radar-p2p-artifact.html', out);
console.log(`artifact: ${(out.length / 1024).toFixed(0)} KB`);
