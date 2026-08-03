import ExcelJS from 'exceljs';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

type MaintenanceState = {
  organization?: { company?: string; city?: string; manager?: string };
  equipment?: Array<Record<string, unknown>>;
  maintenances?: Array<Record<string, unknown>>;
  calendarMarks?: Array<Record<string, unknown>>;
  personnel?: string[];
  frequencies?: Array<Record<string, unknown>>;
};

function text(value: unknown) {
  return value === null || value === undefined ? '' : String(value);
}

function num(value: unknown) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function addHeader(ws: ExcelJS.Worksheet, title: string) {
  ws.spliceRows(1, 0, [title]);
  ws.mergeCells(1, 1, 1, ws.columnCount || 6);
  ws.getCell(1, 1).font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 14 };
  ws.getCell(1, 1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF082944' } };
  ws.getRow(2).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  ws.getRow(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC99A2E' } };
}

export async function POST(request: NextRequest) {
  const state = (await request.json()) as MaintenanceState;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'GIBBOR Control Mantenimiento';
  workbook.created = new Date();

  const equipmentSheet = workbook.addWorksheet('Equipos y Actividades');
  equipmentSheet.columns = [
    { header: 'Codigo', key: 'code', width: 12 },
    { header: 'Equipo', key: 'name', width: 32 },
    { header: 'Marca', key: 'brand', width: 18 },
    { header: 'Cliente', key: 'client', width: 28 },
    { header: 'Caracteristicas', key: 'features', width: 44 },
    { header: 'Modelo', key: 'model', width: 18 },
    { header: 'Ubicacion', key: 'location', width: 20 },
    { header: 'Capacidad', key: 'capacity', width: 18 },
    { header: 'Direccion', key: 'address', width: 40 },
    { header: 'Telefono', key: 'phone', width: 18 },
    { header: 'Fecha apertura', key: 'openedAt', width: 16 },
    { header: 'Quien realiza', key: 'responsible', width: 28 },
    { header: 'Frecuencia dias', key: 'frequencyDays', width: 16 }
  ];
  (state.equipment || []).forEach((item) => equipmentSheet.addRow(item));
  addHeader(equipmentSheet, `${state.organization?.company || 'GIBBOR'} - Equipos`);

  const maintenanceSheet = workbook.addWorksheet('Registro Mto');
  maintenanceSheet.columns = [
    { header: 'Fecha', key: 'date', width: 14 },
    { header: 'Codigo', key: 'code', width: 12 },
    { header: 'Tipo de M/to', key: 'type', width: 18 },
    { header: 'Descripcion M/to', key: 'description', width: 55 },
    { header: 'Valor M/to', key: 'value', width: 16 },
    { header: 'MO + Insumos', key: 'laborCost', width: 16 },
    { header: 'Utilidad', key: 'utility', width: 16 },
    { header: 'Personal', key: 'personnel', width: 30 }
  ];
  (state.maintenances || []).forEach((item) => maintenanceSheet.addRow(item));
  maintenanceSheet.getColumn('value').numFmt = '$ #,##0';
  maintenanceSheet.getColumn('laborCost').numFmt = '$ #,##0';
  maintenanceSheet.getColumn('utility').numFmt = '$ #,##0';
  addHeader(maintenanceSheet, 'Registro de Mantenimiento');

  const programSheet = workbook.addWorksheet('Programacion Mto');
  programSheet.columns = [
    { header: 'Codigo', key: 'code', width: 12 },
    { header: 'Equipo', key: 'name', width: 32 },
    { header: 'Frecuencia dias', key: 'frequencyDays', width: 16 },
    { header: 'Fecha apertura', key: 'openedAt', width: 16 },
    { header: 'Fecha ultimo M/to', key: 'lastDate', width: 18 },
    { header: 'Fecha proximo M/to', key: 'nextDate', width: 18 },
    { header: 'Dias faltantes', key: 'daysLeft', width: 16 }
  ];
  const maintenances = state.maintenances || [];
  (state.equipment || []).forEach((item) => {
    const code = text(item.code);
    const preventiveDates = maintenances
      .filter(
        (maintenance) => text(maintenance.code) === code && text(maintenance.type) === 'PREVENTIVO'
      )
      .map((maintenance) => text(maintenance.date))
      .filter(Boolean)
      .toSorted();
    const lastDate = preventiveDates.at(-1) || text(item.openedAt);
    const frequency = num(item.frequencyDays);
    const nextDate = lastDate && frequency ? addDays(lastDate, frequency) : '';
    programSheet.addRow({
      code,
      name: item.name,
      frequencyDays: frequency,
      openedAt: item.openedAt,
      lastDate,
      nextDate,
      daysLeft: nextDate ? differenceInDays(nextDate) : ''
    });
  });
  addHeader(programSheet, 'Programacion de Mantenimiento');

  const statusSheet = workbook.addWorksheet('Estados E-R-N-P');
  statusSheet.columns = [
    { header: 'Codigo', key: 'code', width: 12 },
    { header: 'Fecha', key: 'date', width: 14 },
    { header: 'Estado', key: 'status', width: 12 },
    { header: 'Nota', key: 'note', width: 45 }
  ];
  (state.calendarMarks || []).forEach((item) => statusSheet.addRow(item));
  addHeader(statusSheet, 'Calendario de Estados');

  const summarySheet = workbook.addWorksheet('RESUMEN');
  const totalIncome = (state.maintenances || []).reduce((sum, item) => sum + num(item.value), 0);
  const totalCost = (state.maintenances || []).reduce((sum, item) => sum + num(item.laborCost), 0);
  const utility = totalIncome - totalCost;
  summarySheet.columns = [
    { header: 'Indicador', key: 'label', width: 34 },
    { header: 'Valor', key: 'value', width: 18 }
  ];
  [
    ['Ciudad', state.organization?.city || 'Cartagena'],
    ['Gerente', state.organization?.manager || 'Jose Ceden'],
    ['Total equipos', state.equipment?.length || 0],
    ['Mantenimientos realizados', state.maintenances?.length || 0],
    ['Ingreso total', totalIncome],
    ['MO + insumos', totalCost],
    ['Utilidad', utility],
    ['GIBBOR Soluciones 30%', utility * 0.3],
    ['Representante legal 40%', utility * 0.4],
    ['Coordinacion administrativa 15%', utility * 0.15],
    ['Gerente 7.5%', utility * 0.075],
    ['Analista RRHH 7.5%', utility * 0.075]
  ].forEach(([label, value]) => summarySheet.addRow({ label, value }));
  summarySheet.getColumn('value').numFmt = '$ #,##0';
  addHeader(summarySheet, 'Resumen');

  for (const ws of workbook.worksheets) {
    ws.views = [{ state: 'frozen', ySplit: 2 }];
    ws.eachRow((row) => {
      row.alignment = { vertical: 'middle', wrapText: true };
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return new Response(buffer as BodyInit, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="gibbor-control-mantenimiento.xlsx"'
    }
  });
}

function addDays(value: string, days: number) {
  const date = new Date(value);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function differenceInDays(value: string) {
  const due = new Date(value).getTime();
  const now = new Date();
  return Math.ceil((due - now.getTime()) / 86400000);
}
