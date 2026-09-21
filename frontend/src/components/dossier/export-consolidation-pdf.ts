import type { Consolidation, ConsolidationCell } from '../../api/dossiers';

// Export PDF de la « Synthèse Globale » via la boîte de dialogue d'impression
// du navigateur (Enregistrer en PDF). Paysage, petite police, en-tête à deux
// niveaux (groupes fusionnés + titres de colonnes) : choix le plus lisible
// pour un tableau de 155 colonnes.

function fmt(cell: ConsolidationCell | null | undefined): string {
  if (!cell || cell.v === null || cell.v === undefined) return '';
  switch (cell.t) {
    case 'eur':
      return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Number(cell.v));
    case 'pct':
    case 'evol':
      return `${(Number(cell.v) * 100).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %`;
    case 'dec':
      return Number(cell.v).toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 2 });
    default:
      return typeof cell.v === 'string' ? cell.v : Number(cell.v).toLocaleString('fr-FR');
  }
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function isNum(cell: ConsolidationCell | null | undefined): boolean {
  return !!cell && cell.t !== 'text' && cell.v !== null && cell.v !== undefined;
}

function buildHtml(consolidation: Consolidation): string {
  const { groupes, lignes, totaux } = consolidation;

  const groupsHeader = groupes
    .map((g) => `<th class="group" colspan="${g.colonnes.length}" scope="colgroup">${esc(g.titre)}</th>`)
    .join('');

  const colsHeader = groupes
    .flatMap((g) => g.colonnes.map((c) => `<th scope="col" class="${c.key === 'A' || c.key === 'B' ? 'first' : ''}">${esc(c.titre)}<i>${esc(c.key)}</i></th>`))
    .join('');

  const keys = groupes.flatMap((g) => g.colonnes.map((c) => c.key));

  const bodyRows = lignes
    .map((l) => {
      const cells = keys
        .map((k) => {
          const cell = l.cells[k];
          return `<td class="${isNum(cell) ? 'num' : ''}${k === 'A' ? ' first' : ''}">${esc(fmt(cell))}</td>`;
        })
        .join('');
      return `<tr>${cells}</tr>`;
    })
    .join('');

  const totalsCells = keys
    .map((k) => {
      const cell = totaux[k] ?? null;
      return `<td class="${isNum(cell) ? 'num' : ''}${k === 'A' ? ' first' : ''}">${esc(fmt(cell))}</td>`;
    })
    .join('');

  const dated = new Date().toLocaleDateString('fr-FR');
  const nb = `${lignes.length} association${lignes.length > 1 ? 's' : ''}`;

  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<title>${esc(consolidation.titre)}</title>
<style>
  @page { size: A4 landscape; margin: 10mm; }
  * { box-sizing: border-box; }
  body { font-family: "Segoe UI", Arial, sans-serif; font-size: 8px; color: #0f172a; margin: 0; }
  h1 { font-size: 14px; color: #173F73; margin: 0 0 4px; }
  .note { font-size: 8px; color: #64748b; font-style: italic; margin: 0 0 6px; }
  .meta { font-size: 7.5px; color: #475569; margin-bottom: 10px; }
  table { border-collapse: collapse; width: 100%; table-layout: fixed; }
  th, td { border: 0.4pt solid #cbd5e1; padding: 2px 3px; vertical-align: top; word-wrap: break-word; overflow-wrap: anywhere; }
  thead th { background: #eef2f7; color: #173F73; font-weight: 600; text-align: left; }
  thead th.group { background: #dbe4f0; text-align: left; }
  thead th i { display: block; font: normal 6px Consolas, monospace; color: #94a3b8; }
  td.num { text-align: right; font-variant-numeric: tabular-nums; }
  td.first { font-weight: 600; color: #173F73; }
  tr.totaux td { background: #dbe4f0; font-weight: 700; color: #173F73; }
</style>
</head>
<body>
  <h1>${esc(consolidation.titre)}</h1>
  <p class="note">${esc(consolidation.note)}</p>
  <p class="meta">${nb} · ${consolidation.annee ? `Année ${consolidation.annee} · ` : ''}Imprimé le ${dated}</p>
  <table>
    <thead>
      <tr>${groupsHeader}</tr>
      <tr>${colsHeader}</tr>
    </thead>
    <tbody>
      ${bodyRows}
    </tbody>
    <tfoot>
      <tr class="totaux">${totalsCells}</tr>
    </tfoot>
  </table>
</body>
</html>`;
}

export function exportConsolidationPdf(consolidation: Consolidation) {
  const html = buildHtml(consolidation);
  const printWindow = window.open('', '_blank', 'width=1400,height=900');

  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.document.title = consolidation.titre;
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 300);
    return;
  }

  // Bloqueur de popups : repli sur un iframe masqué de la page courante.
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
  document.body.appendChild(iframe);
  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(html);
    doc.close();
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    }, 300);
  }
}