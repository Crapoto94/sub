// Générateur PDF minimal (sans dépendance externe) pour la rubrique
// « Pièces justificatives ». Les dossiers importés ne stockent que le nom du
// fichier lu dans l'Excel ; le bouton « Voir » sert donc un vrai PDF du
// récapitulatif de la pièce, généré à la volée (consultable et imprimable).
'use strict';

const A4_W = 595;
const A4_H = 842;

// Caractères hors Latin-1 : transposition vers un équivalent affichable.
const TRANSLIT = {
  '\u0153': 'oe', '\u0170': 'Oe', // œ Œ
  '\u2019': "'", '\u2018': "'",
  '\u201C': '"', '\u201D': '"',
  '\u00AB': '"', '\u00BB': '"',
  '\u2014': '-', '\u2013': '-',
  '\u2026': '...', '\u00A0': ' ',
};

function toLatin1(text) {
  let out = '';
  for (const ch of String(text ?? '')) {
    const mapped = TRANSLIT[ch];
    const target = mapped !== undefined ? mapped : ch;
    for (const c of target) {
      const code = c.codePointAt(0);
      if (code >= 32 && code <= 255) out += c;
      else out += code === 9 || code === 10 || code === 13 ? c : '?';
    }
  }
  return out;
}

function escPdf(text) {
  return toLatin1(text).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

// Découpe en lignes d'au plus ~72 caractères sans casser les mots (approx.).
function wrap(text, max = 72) {
  const src = String(text ?? '').replace(/\s+/g, ' ').trim() || ' ';
  const words = src.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    if ((current + ' ' + word).trim().length <= max) {
      current = (current + ' ' + word).trim();
    } else {
      if (current) lines.push(current);
      current = word.length > max ? word.slice(0, max) : word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function buildPdf(objects) {
  const head = Buffer.from('%PDF-1.4\n', 'latin1');
  let out = head;
  const offsets = [];
  objects.forEach((obj, i) => {
    offsets.push(out.length);
    out = Buffer.concat([
      out,
      Buffer.from(`${i + 1} 0 obj\n`, 'latin1'),
      obj,
      Buffer.from('\nendobj\n', 'latin1'),
    ]);
  });
  const xrefStart = out.length;
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) {
    xref += `${String(off).padStart(10, '0')} 00000 n \n`;
  }
  xref += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
  return Buffer.concat([out, Buffer.from(xref, 'latin1')]);
}

// Contenu commandes PDF (opérateurs) pour une page A4.
function renderContent(data, generatedAt) {
  const cmds = [];
  const BLUE = '0.09 0.247 0.451 rg';
  const DARK = '0.13 0.16 0.22 rg';
  const GRAY = '0.45 0.48 0.53 rg';
  const BAND = '0.955 0.963 0.972 rg';
  const GREEN = '0.13 0.5 0.35 rg';
  const RED = '0.78 0.18 0.2 rg';

  const text = (font, size, x, y, str, color = DARK) => {
    cmds.push(`BT ${font} ${size} Tf ${color} ${x} ${y} Tm (${escPdf(str)}) Tj ET`);
  };
  const rectStroke = (x, y, w, h) => cmds.push(`${x} ${y} ${w} ${h} re S`);
  const fillRect = (x, y, w, h) => {
    cmds.push(BAND);
    cmds.push(`${x} ${y} ${w} ${h} re f`);
    rectStroke(x, y, w, h);
  };
  const line = (x1, y1, x2, y2) => cmds.push(`${x1} ${y1} m ${x2} ${y2} l S`);

  // Cadre de page.
  rectStroke(30, 30, A4_W - 60, A4_H - 60);
  line(54, 740, A4_W - 54, 740);

  // En-tête institutionnel.
  text('/F2', 16, 54, 796, "VILLE D'IVRY-SUR-SEINE", BLUE);
  text('/F1', 9, 54, 782, "Subventions aux associations sportives - Dossier de demande d'aide", GRAY);
  text('/F1', 9, A4_W - 54, 796, data.annee, GRAY);

  // Titre de la rubrique.
  text('/F2', 20, 54, 706, 'PIECES JUSTIFICATIVES', DARK);
  line(54, 698, A4_W - 54, 698);
  text('/F1', 10, 54, 680, data.statut === 'PRESENT' ? 'Piece fournie dans le dossier de demande' : 'Piece manquante dans le dossier de demande', GRAY);

  // Récapitulatif de la pièce.
  const rows = [
    ['Dossier', data.reference],
    ['Association', data.association],
    ['Type de piece', data.typePiece],
    ['Fichier', data.fichier],
    ['Date de depot', data.dateDepot],
  ];

  let y = 632;
  for (const [label, value] of rows) {
    const lines = wrap(value, 78);
    const h = 16 + lines.length * 13;
    const top = y - h;
    fillRect(30, top, A4_W - 60, h);

    text('/F2', 10, 54, y - 14, label, BLUE);
    lines.forEach((ln, i) => {
      text('/F1', 10.5, 190, y - 14 - i * 13, ln, DARK);
    });

    line(30, top, A4_W - 30, top);
    y = top;
  }

  // Statut (case à cocher visuelle).
  const statutLabel = data.statut === 'PRESENT' ? 'PRESENT' : 'ABSENT';
  const statColor = data.statut === 'PRESENT' ? GREEN : RED;
  const yStatut = y - 36;
  fillRect(54, yStatut, 150, 20);
  text('/F2', 11, 64, yStatut + 6, `Statut : ${statutLabel}`, statColor);
  y = yStatut - 20;

  // Mention de génération automatique.
  line(54, 62, A4_W - 54, 62);
  text('/F1', 8, 54, 48, `Document generé automatiquement le ${generatedAt}`, GRAY);
  text('/F1', 8, 54, 39, "Outil de gestion des subventions - Ville d'Ivry-sur-Seine", GRAY);

  return cmds.join('\n');
}

function buildPiecePdf({ dossier, piece }) {
  const generatedAt = new Date().toLocaleString('fr-FR');
  const statut = piece.valide ? 'PRESENT' : 'ABSENT';
  const data = {
    reference: dossier.reference || '—',
    association: dossier.nom_officiel_association || '—',
    annee: dossier.annee ?? '—',
    typePiece: piece.type_piece || '—',
    fichier: piece.fichier || '—',
    dateDepot: piece.date_depot || '—',
    statut,
  };

  const content = renderContent(data, generatedAt);
  const streamBuf = Buffer.from(content, 'latin1');

  // objets : catalog, pages, page, F1, F2, contenu
  const objects = [
    Buffer.from('<< /Type /Catalog /Pages 2 0 R >>', 'latin1'),
    Buffer.from('<< /Type /Pages /Kids [3 0 R] /Count 1 >>', 'latin1'),
    Buffer.from(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${A4_W} ${A4_H}] ` +
        `/Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>`,
      'latin1'
    ),
    Buffer.from(
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
      'latin1'
    ),
    Buffer.from(
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
      'latin1'
    ),
    Buffer.concat([
      Buffer.from(`<< /Length ${streamBuf.length} >>\nstream\n`, 'latin1'),
      streamBuf,
      Buffer.from('\nendstream', 'latin1'),
    ]),
  ];

  return buildPdf(objects);
}

module.exports = { buildPiecePdf };