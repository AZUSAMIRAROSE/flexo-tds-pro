import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { TDSRecordWithRelations } from '@/types/tds.types'
import { formatDate } from './utils'

export async function injectDataIntoExcelTemplate(
  templateBuffer: ArrayBuffer,
  tdsData: TDSRecordWithRelations
): Promise<Blob> {
  const zip = await JSZip.loadAsync(templateBuffer)
  
  // Read the worksheet XML
  const sheetPath = 'xl/worksheets/sheet1.xml'
  const sheetXml = await zip.file(sheetPath)?.async('string')
  
  if (!sheetXml) {
    throw new Error('Could not find worksheet in template')
  }

  // Parse XML and inject data
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(sheetXml, 'text/xml')

  // Helper to set cell value
  const setCellValue = (cellRef: string, value: string | number | null | undefined) => {
    if (value === null || value === undefined) return
    
    // Find or create cell
    const rows = xmlDoc.getElementsByTagName('row')
    const cellRegex = /([A-Z]+)(\d+)/
    const match = cellRef.match(cellRegex)
    
    if (!match) return
    
    const colLetter = match[1]
    const rowNum = parseInt(match[2])
    
    // Find row
    let rowElement: Element | null = null
    for (let i = 0; i < rows.length; i++) {
      if (rows[i].getAttribute('r') === rowNum.toString()) {
        rowElement = rows[i]
        break
      }
    }
    
    if (!rowElement) return
    
    // Find or create cell
    const cells = rowElement.getElementsByTagName('c')
    let cellElement: Element | null = null
    
    for (let i = 0; i < cells.length; i++) {
      if (cells[i].getAttribute('r') === cellRef) {
        cellElement = cells[i]
        break
      }
    }
    
    if (!cellElement) {
      cellElement = xmlDoc.createElement('c')
      cellElement.setAttribute('r', cellRef)
      rowElement.appendChild(cellElement)
    }
    
    // Set value
    let valueElement = cellElement.getElementsByTagName('v')[0]
    if (!valueElement) {
      valueElement = xmlDoc.createElement('v')
      cellElement.appendChild(valueElement)
    }
    
    // For strings, we need to use shared strings (simplified: direct value)
    if (typeof value === 'string') {
      cellElement.setAttribute('t', 'inlineStr')
      const isElement = xmlDoc.createElement('is')
      const tElement = xmlDoc.createElement('t')
      tElement.textContent = value
      isElement.appendChild(tElement)
      cellElement.innerHTML = ''
      cellElement.appendChild(isElement)
    } else {
      valueElement.textContent = value.toString()
    }
  }

  // Cell mapping (based on template structure)
  // Header
  setCellValue('A1', `${tdsData.customer?.name}${tdsData.customer?.location ? ', ' + tdsData.customer.location : ''}`)
  
  // Machine info
  setCellValue('A3', tdsData.machine?.machine_code || '')
  setCellValue('E3', tdsData.machine?.machine_name || '')
  
  // Job Information (starting row 6)
  setCellValue('B6', formatDate(tdsData.date))
  setCellValue('D6', tdsData.order_number)
  setCellValue('F6', tdsData.num_units?.toString() || '')
  setCellValue('H6', tdsData.job_type || '')
  
  setCellValue('B7', tdsData.job_product_name || '')
  setCellValue('F7', tdsData.design_artwork_bromide || '')
  
  setCellValue('B8', tdsData.operator_name || '')
  setCellValue('D8', tdsData.speed_mpm?.toString() || '')
  setCellValue('F8', tdsData.downtime_min?.toString() || '')
  setCellValue('H8', tdsData.shift_no || '')
  
  setCellValue('B9', tdsData.action_on_job || '')
  
  // Substrate section (row 12)
  setCellValue('B12', tdsData.substrate_laminate || '')
  setCellValue('D12', tdsData.surface_type || '')
  setCellValue('F12', tdsData.width_mm?.toString() || '')
  
  // Corona (row 13)
  setCellValue('B13', tdsData.corona_treatment ? 'Yes' : 'No')
  if (tdsData.corona_treatment) {
    setCellValue('D13', tdsData.corona_wattage?.toString() || '')
    setCellValue('F13', tdsData.corona_treatment_side || '')
    setCellValue('H13', tdsData.corona_dyne_level?.toString() || '')
  }
  
  // Foil (row 14)
  setCellValue('B14', tdsData.foil_supplier || '')
  setCellValue('D14', tdsData.foil_type || '')
  setCellValue('F14', tdsData.foil_colour_finish || '')
  
  // Units table (starting row 19)
  tdsData.units?.forEach((unit, index) => {
    const row = 19 + index
    setCellValue(`A${row}`, unit.unit_no.toString())
    setCellValue(`B${row}`, unit.color_station || '')
    setCellValue(`C${row}`, `${unit.anilox_value || ''} ${unit.anilox_unit || ''}`)
    setCellValue(`D${row}`, `${unit.volume_value || ''} ${unit.volume_unit || ''}`)
    setCellValue(`E${row}`, unit.ink_name || '')
    setCellValue(`F${row}`, unit.batch_code || '') // This cell should have yellow background in template
    setCellValue(`G${row}`, unit.lamp_hrs?.toString() || '')
    setCellValue(`H${row}`, unit.intensity_pct?.toString() || '')
    setCellValue(`I${row}`, unit.unit_remarks || '')
    setCellValue(`J${row}`, unit.plate_tape || '')
  })
  
  // Quality parameters (row 40)
  const qualityRow = 40
  setCellValue(`B${qualityRow}`, tdsData.tape_test || '')
  setCellValue(`C${qualityRow}`, tdsData.flow_marks || '')
  setCellValue(`D${qualityRow}`, tdsData.flex_test || '')
  setCellValue(`E${qualityRow}`, tdsData.graphite_test || '')
  setCellValue(`F${qualityRow}`, tdsData.adhesion_test || '')
  setCellValue(`G${qualityRow}`, tdsData.rub_scuff_test || '')
  setCellValue(`H${qualityRow}`, tdsData.ink_lay_tone_check || '')
  setCellValue(`I${qualityRow}`, tdsData.overall_result || '')
  
  setCellValue('B42', tdsData.quality_notes || '')
  
  // Footer (row 45)
  setCellValue('B45', `Prepared By: ${tdsData.prepared_by}`)
  setCellValue('B46', formatDate(tdsData.prepared_at))
  
  // Serialize back to XML
  const serializer = new XMLSerializer()
  const updatedXml = serializer.serializeToString(xmlDoc)
  
  // Update ZIP
  zip.file(sheetPath, updatedXml)
  
  // Generate blob
  return await zip.generateAsync({ type: 'blob' })
}

export function downloadExcel(blob: Blob, filename: string) {
  saveAs(blob, filename)
}