// Formatage monétaire / numéraire au format français (style Excel).
export function formatEur(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('fr-FR').format(value);
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %`;
}

export function pctChange(previous: number | null | undefined, current: number | null | undefined): number | null {
  if (!previous || previous === 0 || current === null || current === undefined) return null;
  return ((current - previous) / previous) * 100;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('fr-FR');
}

// Coloration d'une évolution : hausse vert, baisse rouge, stable gris.
export function evolutionClass(value: number | null): string {
  if (value === null) return 'text-slate-400';
  if (value > 0.05) return 'text-emerald-600';
  if (value < -0.05) return 'text-red-600';
  return 'text-slate-400';
}

export function sign(value: number | null): string {
  if (value === null) return '—';
  return value > 0 ? `+${value.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %` : `${value.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %`;
}
