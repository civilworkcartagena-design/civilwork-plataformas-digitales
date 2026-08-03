import ExcelJS from 'exceljs';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

type MaintenanceType = 'PREVENTIVO' | 'CORRECTIVO';
type StatusCode = 'E' | 'R' | 'N' | 'P';

function asText(value: ExcelJS.CellValue) {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'object') {
    if ('result' in value) return asText(value.result as ExcelJS.CellValue);
    if ('text' in value) return String(value.text || '').trim();
    if ('richText' in value)
      return value.richText
        .map((part) => part.text)
        .join('')
        .trim();
    if ('hyperlink' in value && 'text' in value) return String(value.text || '').trim();
  }
  return String(value).trim();
}

function asNumber(value: ExcelJS.CellValue) {
  if (typeof value === 'number') return value;
  const parsed = Number(asText(value).replace(/[^\d.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function asDate(value: ExcelJS.CellValue) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'number') {
    const epoch = new Date(Date.UTC(1899, 11, 30));
    epoch.setUTCDate(epoch.getUTCDate() + value);
    return epoch.toISOString().slice(0, 10);
  }
  const text = asText(value);
  if (!text) return '';
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
}

function code(value: ExcelJS.CellValue) {
  const raw = asText(value);
  if (!raw) return '';
  return raw.padStart(4, '0');
}

function uid(prefix: string, index: number) {
  return `${prefix}-${Date.now().toString(36)}-${index}`;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Archivo no encontrado' }, { status: 400 });
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await file.arrayBuffer());

  const equipmentSheet = workbook.getWorksheet('Equipos y Actividades');
  const maintenanceSheet = workbook.getWorksheet('Registro Mto');
  const programSheet = workbook.getWorksheet('Programa');

  if (!equipmentSheet) {
    return NextResponse.json(
      { error: 'No se encontro la hoja Equipos y Actividades' },
      { status: 400 }
    );
  }

  const frequencies = [];
  for (let row = 5; row <= 13; row++) {
    const days = asNumber(equipmentSheet.getCell(row, 21).value);
    const label = asText(equipmentSheet.getCell(row, 22).value);
    if (days && label) frequencies.push({ days, label });
  }

  const personnel = [];
  for (let row = 5; row <= 74; row++) {
    const name = asText(equipmentSheet.getCell(row, 25).value);
    if (name) personnel.push(name);
  }

  const equipment = [];
  for (let row = 5; row <= 404; row++) {
    const itemCode = code(equipmentSheet.getCell(row, 2).value);
    const name = asText(equipmentSheet.getCell(row, 3).value);
    if (!itemCode || !name) continue;
    equipment.push({
      code: itemCode,
      name,
      brand: asText(equipmentSheet.getCell(row, 4).value),
      client: asText(equipmentSheet.getCell(row, 5).value),
      features: asText(equipmentSheet.getCell(row, 6).value),
      model: asText(equipmentSheet.getCell(row, 7).value),
      location: asText(equipmentSheet.getCell(row, 8).value),
      capacity: asText(equipmentSheet.getCell(row, 10).value),
      address: asText(equipmentSheet.getCell(row, 11).value),
      phone: asText(equipmentSheet.getCell(row, 12).value),
      openedAt: asDate(equipmentSheet.getCell(row, 15).value),
      frequencyDays: asNumber(equipmentSheet.getCell(row, 18).value) || 120,
      responsible: asText(equipmentSheet.getCell(row, 17).value)
    });
  }

  const equipmentByCode = new Map(equipment.map((item) => [item.code, item]));
  const maintenances = [];
  if (maintenanceSheet) {
    for (let row = 6; row <= 500; row++) {
      const itemCode = code(maintenanceSheet.getCell(row, 2).value);
      const date = asDate(maintenanceSheet.getCell(row, 1).value);
      const description = asText(maintenanceSheet.getCell(row, 5).value);
      if (!itemCode || !date || !description) continue;
      const value = asNumber(maintenanceSheet.getCell(row, 6).value);
      const laborCost = asNumber(maintenanceSheet.getCell(row, 7).value);
      maintenances.push({
        id: uid('mto', row),
        date,
        code: itemCode,
        type: (asText(maintenanceSheet.getCell(row, 4).value).toUpperCase() ||
          'PREVENTIVO') as MaintenanceType,
        description,
        value,
        laborCost,
        utility: value - laborCost,
        personnel: asText(maintenanceSheet.getCell(row, 9).value),
        equipment: equipmentByCode.get(itemCode)?.name || ''
      });
    }
  }

  const calendarMarks = [];
  if (programSheet) {
    const dates = new Map<number, string>();
    for (let col = 20; col <= 390; col++) {
      const date = asDate(programSheet.getCell(9, col).value);
      if (date) dates.set(col, date);
    }
    let index = 0;
    for (let row = 11; row <= 500; row++) {
      const itemCode = code(programSheet.getCell(row, 4).value);
      if (!itemCode) continue;
      for (let col = 20; col <= 390; col++) {
        const status = asText(programSheet.getCell(row, col).value).toUpperCase();
        if (!['E', 'R', 'N', 'P'].includes(status)) continue;
        const date = dates.get(col);
        if (!date) continue;
        calendarMarks.push({
          id: uid('mark', ++index),
          code: itemCode,
          date,
          status: status as StatusCode,
          note: ''
        });
      }
    }
  }

  return NextResponse.json({
    organization: {
      company: 'GIBBOR Soluciones S.A.S.',
      city: 'Cartagena',
      manager: 'Jose Ceden'
    },
    equipment,
    maintenances,
    calendarMarks,
    personnel,
    frequencies: frequencies.length ? frequencies : undefined,
    importedAt: new Date().toISOString()
  });
}
