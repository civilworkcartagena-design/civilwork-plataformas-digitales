import ExcelJS from 'exceljs';

export const runtime = 'nodejs';

const kpis = [
  ['Contrato protegido', 171542976, 'AIU 3/3/3 + IVA sobre utilidad'],
  ['Costo directo', 156254703, 'Escenario mercado protegido'],
  ['Holgura frente a 180M', 8457024, 'Margen comercial disponible']
];

const chapters = [
  ['Electrico', 25000000, 'Cerrar alcance'],
  ['Fachada', 12000000, 'Agregar'],
  ['Ventaneria primer piso', null, 'Por cotizar'],
  ['Puerta principal primer piso', null, 'Por definir'],
  ['Patio y zona de labores', null, 'Incluir alcance'],
  ['Cocinas acero inoxidable', 12000000, 'Mantener'],
  ['Banos terminados', 11200000, 'Subir'],
  ['Puertas y closets', 14000000, 'Mantener']
];

export async function GET() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Civil Work Dashboard';

  const ws = workbook.addWorksheet('Los Corales');
  ws.columns = [
    { header: 'Tipo', key: 'type', width: 26 },
    { header: 'Concepto', key: 'concept', width: 36 },
    { header: 'Valor', key: 'value', width: 18 },
    { header: 'Estado / Nota', key: 'note', width: 48 }
  ];

  kpis.forEach(([concept, value, note]) => {
    ws.addRow({ type: 'KPI', concept, value, note });
  });

  ws.addRow({});

  chapters.forEach(([concept, value, note]) => {
    ws.addRow({ type: 'Capitulo', concept, value: value ?? 'Por cotizar', note });
  });

  ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF111827' } };
  ws.getColumn('value').numFmt = '$ #,##0';

  const buffer = await workbook.xlsx.writeBuffer();

  return new Response(buffer as BodyInit, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="los-corales-presupuesto.xlsx"'
    }
  });
}
