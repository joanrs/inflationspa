#!/usr/bin/env node
const fs = require('fs');
const http = require('http');
const https = require('https');

const SOURCE = process.env.IPC_SOURCE_URL || 'https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/76125';
const OUT = process.env.IPC_OUTPUT || 'functions/ipc.json';

function fetchUrl(u) {
  return new Promise((resolve, reject) => {
    const lib = u.startsWith('https') ? https : http;
    lib.get(u, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        try {
          const loc = new URL(res.headers.location, u).href;
          return resolve(fetchUrl(loc));
        } catch (err) {
          return reject(new Error('Invalid redirect URL'));
        }
      }
      if (res.statusCode !== 200) return reject(new Error('Status ' + res.statusCode));
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks).toString()));
    }).on('error', reject);
  });
}

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const delim = lines[0].includes(';') ? ';' : ',';
  const headers = lines[0].split(delim).map(h => h.trim());
  const rows = lines.slice(1).map(l => {
    const parts = l.split(delim).map(p => p.trim().replace(/^"|"$/g, ''));
    const obj = {};
    headers.forEach((h, i) => { obj[h] = parts[i] !== undefined ? parts[i] : ''; });
    return obj;
  });
  return rows;
}

function monthNumber(m) {
  const mm = String(m).trim();
  const map = {enero:1,febrero:2,marzo:3,abril:4,mayo:5,junio:6,julio:7,agosto:8,septiembre:9,octubre:10,noviembre:11,diciembre:12};
  if (/^\d+$/.test(mm)) return parseInt(mm,10);
  const key = mm.toLowerCase();
  return map[key] || null;
}

function normalize(rows) {
  const out = [];
  if (!rows.length) return out;
  const keys = Object.keys(rows[0]);
  // Try to find date columns
  const hasYear = keys.find(k => /year|año|ano/i.test(k));
  const hasMonth = keys.find(k => /month|mes/i.test(k));
  const dateCol = keys.find(k => /date|fecha|periodo|period/i.test(k));
  const valueCol = keys.find(k => /ipc|índice|indice|valor|value|v/i.test(k)) || keys[keys.length-1];

  for (const r of rows) {
    let date = null;
    if (hasYear && hasMonth) {
      const y = r[hasYear];
      let m = r[hasMonth];
      const mn = monthNumber(m);
      const mm = mn ? String(mn).padStart(2,'0') : (String(m).padStart(2,'0'));
      date = `${y}-${mm}`;
    } else if (dateCol) {
      const d = r[dateCol];
      // try YYYY-MM or YYYY-MM-DD
      const m = d.match(/(\d{4}[-\/]\d{1,2}([-\/]\d{1,2})?)/);
      date = m ? m[1].slice(0,7) : d;
    }
    const rawVal = r[valueCol];
    const val = rawVal ? Number(String(rawVal).replace(/[, ]+/g, '').replace(/,/g, '.')) : null;
    if (date && (val !== null && !isNaN(val))) out.push({date: date, value: val});
  }
  return out.sort((a,b)=> a.date.localeCompare(b.date));
}

async function run(){
  console.log('Fetching IPC from', SOURCE);
  try{
    const text = await fetchUrl(SOURCE);
    let parsed = null;
    try{ parsed = JSON.parse(text); } catch(e) { parsed = null; }
    let series = [];
    if (parsed && Array.isArray(parsed) && parsed.length && parsed[0] && parsed[0].Data) {
      // WSTempus DATOS_TABLA response: array of series objects with .COD, .Nombre and .Data
      const target = parsed.find(s => /índice general|indice general/i.test(s.Nombre) || /^IPC/i.test(s.COD)) || parsed[0];
      const data = Array.isArray(target.Data) ? target.Data : [];
      series = data.map(d => {
        const date = new Date(d.Fecha).toISOString().slice(0,7);
        const val = (d.Valor === null || d.Valor === undefined) ? null : Number(d.Valor);
        return {date, value: val};
      }).filter(x => x.date && x.value !== null && !isNaN(x.value) && x.date >= '2018-01');
    } else if (parsed && Array.isArray(parsed) && parsed.length && typeof parsed[0] === 'object') {
      series = normalize(parsed);
    } else {
      const rows = parseCSV(text);
      series = normalize(rows);
    }
    const out = {source: SOURCE, fetchedAt: new Date().toISOString(), series};
    fs.mkdirSync(require('path').dirname(OUT), {recursive:true});
    fs.writeFileSync(OUT, JSON.stringify(out,null,2));
    console.log('Wrote', OUT, 'entries:', series.length);
  }catch(err){
    console.error('Error fetching/parsing IPC:', err.message);
    process.exit(1);
  }
}

run();
