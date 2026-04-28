import {
  Document,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  HeadingLevel,
  Packer,
  TextRun,
  ShadingType,
} from 'docx'
import { saveAs } from 'file-saver'
import type { TDSRecordWithRelations } from '@/types/tds.types'
import { formatDate } from './utils'

export async function generateWordDocument(data: TDSRecordWithRelations): Promise<Blob> {
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              orientation: 'landscape' as any,
            },
          },
        },
        children: [
          // Header
          new Paragraph({
            text: `${data.customer?.name}${data.customer?.location ? ', ' + data.customer.location : ''}`,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: 'FLEXO NARROW WEB · TECHNICAL DATA SHEET',
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: `Machine: ${data.machine?.machine_code} | ${data.machine?.machine_name}`,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ text: '' }), // Spacer

          // Job Information Section
          new Paragraph({
            children: [
              new TextRun({
                text: '▶ JOB INFORMATION',
                bold: true,
                color: 'FFFFFF',
              }),
            ],
            shading: {
              type: ShadingType.SOLID,
              color: '1F4E79',
            },
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createCell('Date', true),
                  createCell(formatDate(data.date)),
                  createCell('Order Number', true),
                  createCell(data.order_number),
                  createCell('No. of Units', true),
                  createCell(data.num_units?.toString() || ''),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Job Type', true),
                  createCell(data.job_type || '—'),
                  createCell('Operator', true),
                  createCell(data.operator_name || '—'),
                  createCell('Shift', true),
                  createCell(data.shift_no || '—'),
                ],
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          // Substrate Section
          new Paragraph({
            children: [
              new TextRun({
                text: '▶ SUBSTRATE · CORONA · FOIL DETAILS',
                bold: true,
                color: 'FFFFFF',
              }),
            ],
            shading: {
              type: ShadingType.SOLID,
              color: '1F4E79',
            },
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createCell('Substrate', true),
                  createCell(data.substrate_laminate || '—'),
                  createCell('Surface Type', true),
                  createCell(data.surface_type || '—'),
                  createCell('Width (mm)', true),
                  createCell(data.width_mm?.toString() || '—'),
                ],
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          // Unit Sequence Table
          new Paragraph({
            children: [
              new TextRun({
                text: '▶ PRINTING UNIT SEQUENCE',
                bold: true,
                color: 'FFFFFF',
              }),
            ],
            shading: {
              type: ShadingType.SOLID,
              color: '1F4E79',
            },
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              // Header row
              new TableRow({
                children: [
                  createCell('Unit', true),
                  createCell('Color/Station', true),
                  createCell('Anilox', true),
                  createCell('Volume', true),
                  createCell('Ink Name', true),
                  createCell('Batch Code', true),
                  createCell('Lamp Hrs', true),
                  createCell('Intensity', true),
                  createCell('Tape', true),
                ],
              }),
              // Data rows
              ...(data.units?.map(
                (unit) =>
                  new TableRow({
                    children: [
                      createCell(unit.unit_no.toString()),
                      createCell(unit.color_station || '—'),
                      createCell(`${unit.anilox_value || ''} ${unit.anilox_unit || ''}`),
                      createCell(`${unit.volume_value || ''} ${unit.volume_unit || ''}`),
                      createCell(unit.ink_name || '—'),
                      createCell(unit.batch_code || '—', false, 'FEF3C7'), // Yellow highlight
                      createCell(unit.lamp_hrs?.toString() || '—'),
                      createCell(unit.intensity_pct?.toString() || '—'),
                      createCell(unit.plate_tape || '—'),
                    ],
                  })
              ) || []),
            ],
          }),
          new Paragraph({ text: '' }),

          // Quality Parameters
          new Paragraph({
            children: [
              new TextRun({
                text: '▶ QUALITY PARAMETERS',
                bold: true,
                color: 'FFFFFF',
              }),
            ],
            shading: {
              type: ShadingType.SOLID,
              color: '1F4E79',
            },
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createCell('Tape Test', true),
                  createCell(data.tape_test || 'N/A'),
                  createCell('Flow Marks', true),
                  createCell(data.flow_marks || 'N/A'),
                  createCell('Flex Test', true),
                  createCell(data.flex_test || 'N/A'),
                  createCell('Overall Result', true),
                  createCell(data.overall_result || 'Conditional'),
                ],
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          // Footer
          new Paragraph({
            text: `Prepared By: ${data.prepared_by} | ${formatDate(data.prepared_at)}`,
            alignment: AlignmentType.LEFT,
          }),
          new Paragraph({
            text: `Status: ${data.status}`,
            alignment: AlignmentType.LEFT,
          }),
        ],
      },
    ],
  })

  return await Packer.toBlob(doc)
}

function createCell(
  text: string,
  isHeader: boolean = false,
  backgroundColor?: string
): TableCell {
  return new TableCell({
    children: [
      new Paragraph({
        text,
        alignment: AlignmentType.LEFT,
      }),
    ],
    shading: backgroundColor
      ? {
          type: ShadingType.SOLID,
          color: backgroundColor,
        }
      : isHeader
      ? {
          type: ShadingType.SOLID,
          color: 'F3F4F6',
        }
      : undefined,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
      left: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
      right: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
    },
  })
}

export function downloadWord(blob: Blob, filename: string) {
  saveAs(blob, filename)
}