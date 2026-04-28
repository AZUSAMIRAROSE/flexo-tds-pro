import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import type { TDSRecordWithRelations } from '@/types/tds.types'
import { computeOverallResult, formatDate } from './utils'

type CellValue = string | number | null | undefined
type UnitRow = NonNullable<TDSRecordWithRelations['units']>[number]

const UNIT_TABLE_START_ROW = 19
const UNIT_TEMPLATE_ROWS = 10
const UNIT_TEMPLATE_END_ROW = UNIT_TABLE_START_ROW + UNIT_TEMPLATE_ROWS - 1
const FIRST_ROW_AFTER_UNIT_TEMPLATE = UNIT_TEMPLATE_END_ROW + 1
const UNIT_DATA_COLUMNS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'] as const

const QUALITY_VALUES_TEMPLATE_ROW = 32
const QUALITY_NOTES_TEMPLATE_ROW = 34
const PREPARED_BY_TEMPLATE_ROW = 36
const PREPARED_AT_TEMPLATE_ROW = 37
const DATA_FONT_NAME = 'Arial'
const DATA_FONT_SIZE = 9
const BLACK = 'FF000000'
const PASS_GREEN = 'FF008000'
const FAIL_RED = 'FFFF0000'

type StyleOptions = {
  fontColor?: string
  fontName?: string
  fontSize?: number
  horizontal?: string
  vertical?: string
}

function getElements(parent: Document | Element, tagName: string, namespaceUri: string | null): Element[] {
  return Array.from(
    namespaceUri
      ? parent.getElementsByTagNameNS(namespaceUri, tagName)
      : parent.getElementsByTagName(tagName)
  ) as Element[]
}

function createElement(xmlDoc: Document, tagName: string, namespaceUri: string | null): Element {
  return namespaceUri ? xmlDoc.createElementNS(namespaceUri, tagName) : xmlDoc.createElement(tagName)
}

function findDirectChild(element: Element, tagName: string): Element | null {
  const child = Array.from(element.childNodes).find(
    (child) => child.nodeType === Node.ELEMENT_NODE && (child as Element).localName === tagName
  )
  return child ? (child as Element) : null
}

function appendStyleChild(parent: Element, child: Element) {
  parent.insertBefore(child, findDirectChild(parent, 'extLst'))
}

function parseCellReference(cellRef: string) {
  const match = cellRef.match(/^(\$?)([A-Z]+)(\$?)(\d+)$/)
  if (!match) return null

  return {
    absoluteColumn: match[1],
    column: match[2],
    absoluteRow: match[3],
    row: Number(match[4]),
  }
}

function columnNumber(column: string): number {
  return column.split('').reduce((total, char) => total * 26 + char.charCodeAt(0) - 64, 0)
}

function shiftReferencesInText(text: string, fromRow: number, delta: number): string {
  if (delta === 0) return text

  return text.replace(/(\$?)([A-Z]{1,3})(\$?)(\d+)/g, (match, absoluteColumn, column, absoluteRow, rowText) => {
    const row = Number(rowText)
    if (!Number.isFinite(row) || row < fromRow) return match
    return `${absoluteColumn}${column}${absoluteRow}${row + delta}`
  })
}

function parseRangeRows(rangeRef: string) {
  const parts = rangeRef.split(':')
  const start = parseCellReference(parts[0])
  const end = parseCellReference(parts[1] || parts[0])

  if (!start || !end) return null

  return {
    startRow: Math.min(start.row, end.row),
    endRow: Math.max(start.row, end.row),
  }
}

function isRangeFullyInsideRows(rangeRef: string, startRow: number, endRow: number): boolean {
  const ranges = rangeRef.trim().split(/\s+/)
  return ranges.every((range) => {
    const parsed = parseRangeRows(range)
    return parsed && parsed.startRow >= startRow && parsed.endRow <= endRow
  })
}

function getSheetData(xmlDoc: Document, namespaceUri: string | null): Element {
  const sheetData = getElements(xmlDoc, 'sheetData', namespaceUri)[0]
  if (!sheetData) {
    throw new Error('Could not find sheetData in worksheet XML')
  }
  return sheetData
}

function findRow(xmlDoc: Document, namespaceUri: string | null, rowNumber: number): Element | null {
  return getElements(xmlDoc, 'row', namespaceUri).find((row) => row.getAttribute('r') === String(rowNumber)) || null
}

function findCell(rowElement: Element, namespaceUri: string | null, cellRef: string): Element | null {
  return getElements(rowElement, 'c', namespaceUri).find((cell) => cell.getAttribute('r') === cellRef) || null
}

function insertCellInColumnOrder(rowElement: Element, cellElement: Element, column: string, namespaceUri: string | null) {
  const newColumnNumber = columnNumber(column)
  const existingCells = getElements(rowElement, 'c', namespaceUri)
  const insertBeforeCell = existingCells.find((cell) => {
    const cellRef = cell.getAttribute('r')
    const parsed = cellRef ? parseCellReference(cellRef) : null
    return parsed ? columnNumber(parsed.column) > newColumnNumber : false
  })

  rowElement.insertBefore(cellElement, insertBeforeCell || null)
}

function clearCellContents(cellElement: Element) {
  cellElement.removeAttribute('t')
  while (cellElement.firstChild) {
    cellElement.removeChild(cellElement.firstChild)
  }
}

function removeDirectChildrenByName(element: Element, tagName: string) {
  Array.from(element.childNodes).forEach((child) => {
    if (child.nodeType === Node.ELEMENT_NODE && (child as Element).localName === tagName) {
      element.removeChild(child)
    }
  })
}

function setCellValueFactory(xmlDoc: Document, namespaceUri: string | null) {
  return (cellRef: string, value: CellValue) => {
    const parsed = parseCellReference(cellRef)
    if (!parsed) return null

    const rowElement = findRow(xmlDoc, namespaceUri, parsed.row)
    if (!rowElement) return null

    let cellElement = findCell(rowElement, namespaceUri, cellRef)

    if (value === null || value === undefined || value === '' || (typeof value === 'number' && !Number.isFinite(value))) {
      if (cellElement) {
        clearCellContents(cellElement)
      }
      return cellElement
    }

    if (!cellElement) {
      cellElement = createElement(xmlDoc, 'c', namespaceUri)
      cellElement.setAttribute('r', cellRef)
      insertCellInColumnOrder(rowElement, cellElement, parsed.column, namespaceUri)
    }

    clearCellContents(cellElement)

    if (typeof value === 'string') {
      cellElement.setAttribute('t', 'inlineStr')

      const inlineString = createElement(xmlDoc, 'is', namespaceUri)
      const text = createElement(xmlDoc, 't', namespaceUri)
      if (/^\s|\s$/.test(value)) {
        text.setAttribute('xml:space', 'preserve')
      }
      text.textContent = value
      inlineString.appendChild(text)
      cellElement.appendChild(inlineString)
      return cellElement
    }

    const valueElement = createElement(xmlDoc, 'v', namespaceUri)
    valueElement.textContent = String(value)
    cellElement.appendChild(valueElement)
    return cellElement
  }
}

function normalizeText(value: CellValue): string {
  return String(value ?? '').trim().toLowerCase()
}

function qualityFontColor(value: CellValue): string {
  const normalized = normalizeText(value).replace(/\s+/g, '')

  if (normalized === 'pass') return PASS_GREEN
  if (normalized === 'fail') return FAIL_RED
  return BLACK
}

function plateTapeFontColor(value: CellValue): string {
  switch (normalizeText(value)) {
    case 'red':
      return 'FFFF0000'
    case 'blue':
      return 'FF0000FF'
    case 'green':
      return 'FF008000'
    case 'orange':
      return 'FFFF6600'
    default:
      return BLACK
  }
}

class WorkbookStyleManager {
  private fontCache = new Map<string, number>()
  private styleCache = new Map<string, number>()
  private stylesXml: string | undefined
  private xmlDoc: Document | null = null
  private namespaceUri: string | null = null
  private fontsElement: Element | null = null
  private cellXfsElement: Element | null = null
  private zip: JSZip
  private parser: DOMParser
  private serializer: XMLSerializer

  constructor(zip: JSZip, parser: DOMParser, serializer: XMLSerializer) {
    this.zip = zip
    this.parser = parser
    this.serializer = serializer
  }

  async load() {
    this.stylesXml = await this.zip.file('xl/styles.xml')?.async('string')
    if (!this.stylesXml) return

    const xmlDoc = this.parser.parseFromString(this.stylesXml, 'text/xml')
    if (xmlDoc.getElementsByTagName('parsererror').length > 0) return

    this.xmlDoc = xmlDoc
    this.namespaceUri = xmlDoc.documentElement.namespaceURI
    this.fontsElement = getElements(xmlDoc, 'fonts', this.namespaceUri)[0] || null
    this.cellXfsElement = getElements(xmlDoc, 'cellXfs', this.namespaceUri)[0] || null
  }

  applyStyle(cellElement: Element | null, options: StyleOptions, fallbackStyleId?: string | null) {
    if (!cellElement || !this.xmlDoc || !this.fontsElement || !this.cellXfsElement) return

    const baseStyleId = Number(cellElement.getAttribute('s') ?? fallbackStyleId ?? 0)
    const safeBaseStyleId = Number.isFinite(baseStyleId) ? baseStyleId : 0
    const styleId = this.getOrCreateStyleId(safeBaseStyleId, options)
    cellElement.setAttribute('s', String(styleId))
  }

  save() {
    if (!this.xmlDoc || !this.stylesXml) return
    this.zip.file('xl/styles.xml', this.serializer.serializeToString(this.xmlDoc))
  }

  private getOrCreateFontId(options: StyleOptions): number {
    if (!this.xmlDoc || !this.fontsElement) return 0

    const fontName = options.fontName || DATA_FONT_NAME
    const fontSize = options.fontSize || DATA_FONT_SIZE
    const fontColor = options.fontColor || BLACK
    const key = `${fontName}|${fontSize}|${fontColor}`
    const cached = this.fontCache.get(key)
    if (cached !== undefined) return cached

    const fontElement = createElement(this.xmlDoc, 'font', this.namespaceUri)

    const sizeElement = createElement(this.xmlDoc, 'sz', this.namespaceUri)
    sizeElement.setAttribute('val', String(fontSize))
    fontElement.appendChild(sizeElement)

    const colorElement = createElement(this.xmlDoc, 'color', this.namespaceUri)
    colorElement.setAttribute('rgb', fontColor)
    fontElement.appendChild(colorElement)

    const nameElement = createElement(this.xmlDoc, 'name', this.namespaceUri)
    nameElement.setAttribute('val', fontName)
    fontElement.appendChild(nameElement)

    const familyElement = createElement(this.xmlDoc, 'family', this.namespaceUri)
    familyElement.setAttribute('val', '2')
    fontElement.appendChild(familyElement)

    appendStyleChild(this.fontsElement, fontElement)
    const fontId = getElements(this.fontsElement, 'font', this.namespaceUri).length - 1
    this.fontsElement.setAttribute('count', String(fontId + 1))
    this.fontCache.set(key, fontId)
    return fontId
  }

  private getOrCreateStyleId(baseStyleId: number, options: StyleOptions): number {
    if (!this.xmlDoc || !this.cellXfsElement) return baseStyleId

    const key = `${baseStyleId}|${options.fontName || DATA_FONT_NAME}|${options.fontSize || DATA_FONT_SIZE}|${options.fontColor || BLACK}|${options.horizontal || ''}|${options.vertical || ''}`
    const cached = this.styleCache.get(key)
    if (cached !== undefined) return cached

    const existingStyles = getElements(this.cellXfsElement, 'xf', this.namespaceUri)
    const baseStyle = existingStyles[baseStyleId] || existingStyles[0]
    if (!baseStyle) return baseStyleId

    const styleElement = baseStyle.cloneNode(true) as Element
    styleElement.setAttribute('fontId', String(this.getOrCreateFontId(options)))
    styleElement.setAttribute('applyFont', '1')

    if (options.horizontal || options.vertical) {
      let alignmentElement = findDirectChild(styleElement, 'alignment')
      if (!alignmentElement) {
        alignmentElement = createElement(this.xmlDoc, 'alignment', this.namespaceUri)
        styleElement.appendChild(alignmentElement)
      }

      if (options.horizontal) {
        alignmentElement.setAttribute('horizontal', options.horizontal)
      }
      if (options.vertical) {
        alignmentElement.setAttribute('vertical', options.vertical)
      }
      styleElement.setAttribute('applyAlignment', '1')
    }

    appendStyleChild(this.cellXfsElement, styleElement)
    const styleId = getElements(this.cellXfsElement, 'xf', this.namespaceUri).length - 1
    this.cellXfsElement.setAttribute('count', String(styleId + 1))
    this.styleCache.set(key, styleId)
    return styleId
  }
}

function clearCellValue(xmlDoc: Document, namespaceUri: string | null, cellRef: string) {
  const parsed = parseCellReference(cellRef)
  if (!parsed) return

  const rowElement = findRow(xmlDoc, namespaceUri, parsed.row)
  if (!rowElement) return

  const cellElement = findCell(rowElement, namespaceUri, cellRef)
  if (cellElement) {
    clearCellContents(cellElement)
  }
}

function shiftRowsInSheetData(sheetData: Element, namespaceUri: string | null, fromRow: number, delta: number) {
  if (delta === 0) return

  const rows = getElements(sheetData, 'row', namespaceUri)
  rows.forEach((rowElement) => {
    const currentRow = Number(rowElement.getAttribute('r'))
    if (!Number.isFinite(currentRow) || currentRow < fromRow) return

    const newRow = currentRow + delta
    rowElement.setAttribute('r', String(newRow))

    getElements(rowElement, 'c', namespaceUri).forEach((cellElement) => {
      const cellRef = cellElement.getAttribute('r')
      const parsed = cellRef ? parseCellReference(cellRef) : null
      if (parsed && parsed.row >= fromRow) {
        cellElement.setAttribute('r', `${parsed.absoluteColumn}${parsed.column}${parsed.absoluteRow}${parsed.row + delta}`)
      }
    })
  })
}

function shiftWorksheetReferenceAttributes(xmlDoc: Document, fromRow: number, delta: number) {
  if (delta === 0) return

  const referenceAttributes = new Set(['ref', 'sqref', 'activeCell', 'topLeftCell'])
  const elements = Array.from(xmlDoc.getElementsByTagName('*')) as Element[]

  elements.forEach((element) => {
    Array.from(element.attributes).forEach((attribute) => {
      const attributeName = attribute.localName || attribute.name
      if (!referenceAttributes.has(attributeName)) return

      if ((element.localName === 'c' || element.localName === 'row') && attributeName === 'r') return

      const updatedValue = shiftReferencesInText(attribute.value, fromRow, delta)
      if (updatedValue !== attribute.value) {
        element.setAttribute(attribute.name, updatedValue)
      }
    })
  })
}

function shiftFormulaReferences(xmlDoc: Document, namespaceUri: string | null, fromRow: number, delta: number) {
  if (delta === 0) return

  getElements(xmlDoc, 'f', namespaceUri).forEach((formulaElement) => {
    const formula = formulaElement.textContent || ''
    const updatedFormula = shiftReferencesInText(formula, fromRow, delta)

    if (updatedFormula !== formula) {
      formulaElement.textContent = updatedFormula

      if (formulaElement.parentElement) {
        removeDirectChildrenByName(formulaElement.parentElement, 'v')
      }
    }
  })
}

function deleteSheetRows(sheetData: Element, namespaceUri: string | null, startRow: number, endRow: number) {
  if (endRow < startRow) return

  getElements(sheetData, 'row', namespaceUri).forEach((rowElement) => {
    const rowNumber = Number(rowElement.getAttribute('r'))
    if (rowNumber >= startRow && rowNumber <= endRow) {
      sheetData.removeChild(rowElement)
    }
  })
}

function getMergeCellsElement(xmlDoc: Document, namespaceUri: string | null): Element | null {
  return getElements(xmlDoc, 'mergeCells', namespaceUri)[0] || null
}

function updateMergeCellCount(mergeCellsElement: Element | null, namespaceUri: string | null) {
  if (!mergeCellsElement) return
  mergeCellsElement.setAttribute('count', String(getElements(mergeCellsElement, 'mergeCell', namespaceUri).length))
}

function removeMergeCellsInsideRows(
  xmlDoc: Document,
  namespaceUri: string | null,
  startRow: number,
  endRow: number
) {
  if (endRow < startRow) return

  const mergeCellsElement = getMergeCellsElement(xmlDoc, namespaceUri)
  if (!mergeCellsElement) return

  getElements(mergeCellsElement, 'mergeCell', namespaceUri).forEach((mergeCell) => {
    const ref = mergeCell.getAttribute('ref')
    if (ref && isRangeFullyInsideRows(ref, startRow, endRow)) {
      mergeCellsElement.removeChild(mergeCell)
    }
  })

  updateMergeCellCount(mergeCellsElement, namespaceUri)
}

function collectSingleRowMergeTemplates(xmlDoc: Document, namespaceUri: string | null, templateRow: number) {
  const mergeCellsElement = getMergeCellsElement(xmlDoc, namespaceUri)
  if (!mergeCellsElement) return []

  return getElements(mergeCellsElement, 'mergeCell', namespaceUri)
    .map((mergeCell) => mergeCell.getAttribute('ref'))
    .filter((ref): ref is string => Boolean(ref))
    .map((ref) => {
      const [startRef, endRef] = ref.split(':')
      const start = parseCellReference(startRef)
      const end = parseCellReference(endRef || startRef)
      return start && end && start.row === templateRow && end.row === templateRow
        ? { startColumn: start.column, endColumn: end.column }
        : null
    })
    .filter((template): template is { startColumn: string; endColumn: string } => Boolean(template))
}

function appendSingleRowMerges(
  xmlDoc: Document,
  namespaceUri: string | null,
  mergeTemplates: { startColumn: string; endColumn: string }[],
  rowNumber: number
) {
  if (mergeTemplates.length === 0) return

  const mergeCellsElement = getMergeCellsElement(xmlDoc, namespaceUri)
  if (!mergeCellsElement) return

  mergeTemplates.forEach(({ startColumn, endColumn }) => {
    const mergeCell = createElement(xmlDoc, 'mergeCell', namespaceUri)
    mergeCell.setAttribute('ref', `${startColumn}${rowNumber}:${endColumn}${rowNumber}`)
    mergeCellsElement.appendChild(mergeCell)
  })

  updateMergeCellCount(mergeCellsElement, namespaceUri)
}

function cloneEmptyUnitRow(
  namespaceUri: string | null,
  templateRow: Element,
  newRowNumber: number
): Element {
  const clonedRow = templateRow.cloneNode(true) as Element
  clonedRow.setAttribute('r', String(newRowNumber))

  getElements(clonedRow, 'c', namespaceUri).forEach((cellElement) => {
    const cellRef = cellElement.getAttribute('r')
    const parsed = cellRef ? parseCellReference(cellRef) : null
    if (parsed) {
      cellElement.setAttribute('r', `${parsed.column}${newRowNumber}`)
    }
    clearCellContents(cellElement)
  })

  return clonedRow
}

function resizeUnitTable(xmlDoc: Document, namespaceUri: string | null, unitCount: number): number {
  const sheetData = getSheetData(xmlDoc, namespaceUri)
  const templateRow = findRow(xmlDoc, namespaceUri, UNIT_TABLE_START_ROW)
  const firstRowAfterTemplate = findRow(xmlDoc, namespaceUri, FIRST_ROW_AFTER_UNIT_TEMPLATE)

  if (!templateRow || !firstRowAfterTemplate) {
    throw new Error('Could not find the unit table template rows')
  }

  const displayUnitRows = Math.max(unitCount, 1)
  const rowDelta = displayUnitRows - UNIT_TEMPLATE_ROWS
  const templateMergeRows = collectSingleRowMergeTemplates(xmlDoc, namespaceUri, UNIT_TABLE_START_ROW)

  if (rowDelta > 0) {
    shiftRowsInSheetData(sheetData, namespaceUri, FIRST_ROW_AFTER_UNIT_TEMPLATE, rowDelta)
    shiftWorksheetReferenceAttributes(xmlDoc, FIRST_ROW_AFTER_UNIT_TEMPLATE, rowDelta)
    shiftFormulaReferences(xmlDoc, namespaceUri, FIRST_ROW_AFTER_UNIT_TEMPLATE, rowDelta)

    for (let offset = 1; offset <= rowDelta; offset += 1) {
      const newRowNumber = UNIT_TEMPLATE_END_ROW + offset
      const clonedRow = cloneEmptyUnitRow(namespaceUri, templateRow, newRowNumber)
      sheetData.insertBefore(clonedRow, firstRowAfterTemplate)
      appendSingleRowMerges(xmlDoc, namespaceUri, templateMergeRows, newRowNumber)
    }
  } else if (rowDelta < 0) {
    const deleteStartRow = UNIT_TABLE_START_ROW + displayUnitRows

    removeMergeCellsInsideRows(xmlDoc, namespaceUri, deleteStartRow, UNIT_TEMPLATE_END_ROW)
    deleteSheetRows(sheetData, namespaceUri, deleteStartRow, UNIT_TEMPLATE_END_ROW)
    shiftRowsInSheetData(sheetData, namespaceUri, FIRST_ROW_AFTER_UNIT_TEMPLATE, rowDelta)
    shiftWorksheetReferenceAttributes(xmlDoc, FIRST_ROW_AFTER_UNIT_TEMPLATE, rowDelta)
    shiftFormulaReferences(xmlDoc, namespaceUri, FIRST_ROW_AFTER_UNIT_TEMPLATE, rowDelta)
  }

  return rowDelta
}

function updateLookupFormulas(xmlDoc: Document, namespaceUri: string | null, lastUnitRow: number) {
  const formulaElements = [
    ...getElements(xmlDoc, 'f', namespaceUri),
    ...getElements(xmlDoc, 'formula1', namespaceUri),
    ...getElements(xmlDoc, 'formula2', namespaceUri),
  ]

  formulaElements.forEach((formulaElement) => {
    const formula = formulaElement.textContent || ''
    const updatedFormula = formula.replace(
      /(\$?[A-J])(\$?19):(\$?[A-J])(\$?)(\d+)/g,
      (_match, startColumn, startRow, endColumn, endRowAbsolute) =>
        `${startColumn}${startRow}:${endColumn}${endRowAbsolute}${lastUnitRow}`
    )

    if (updatedFormula !== formula) {
      formulaElement.textContent = updatedFormula

      if (formulaElement.parentElement) {
        removeDirectChildrenByName(formulaElement.parentElement, 'v')
      }
    }
  })
}

function clearRenderedUnitRows(xmlDoc: Document, namespaceUri: string | null, unitRowsToRender: number) {
  const lastUnitRow = UNIT_TABLE_START_ROW + Math.max(unitRowsToRender, 1) - 1

  for (let row = UNIT_TABLE_START_ROW; row <= lastUnitRow; row += 1) {
    UNIT_DATA_COLUMNS.forEach((column) => clearCellValue(xmlDoc, namespaceUri, `${column}${row}`))
  }
}

function getSortableUnitNumber(unit: UnitRow): number {
  const unitNumber = Number(unit.unit_no)
  return Number.isFinite(unitNumber) ? unitNumber : Number.MAX_SAFE_INTEGER
}

function normalizeUnitNumber(unitNumber: UnitRow['unit_no']): string | number {
  const numericUnitNumber = Number(unitNumber)
  return Number.isFinite(numericUnitNumber) ? numericUnitNumber : String(unitNumber ?? '')
}

function sortUnits(units: TDSRecordWithRelations['units']): UnitRow[] {
  return [...(units || [])].sort((a, b) => {
    const unitNumberDiff = getSortableUnitNumber(a) - getSortableUnitNumber(b)
    if (unitNumberDiff !== 0) return unitNumberDiff

    return String(a.unit_no ?? '').localeCompare(String(b.unit_no ?? ''), undefined, { numeric: true })
  })
}

async function forceWorkbookRecalculation(zip: JSZip, parser: DOMParser, serializer: XMLSerializer) {
  const workbookPath = 'xl/workbook.xml'
  const workbookXml = await zip.file(workbookPath)?.async('string')

  if (!workbookXml) return

  const workbookDoc = parser.parseFromString(workbookXml, 'text/xml')
  const workbookNamespace = workbookDoc.documentElement.namespaceURI
  let calcPr = getElements(workbookDoc, 'calcPr', workbookNamespace)[0]

  if (!calcPr) {
    calcPr = createElement(workbookDoc, 'calcPr', workbookNamespace)
    workbookDoc.documentElement.appendChild(calcPr)
  }

  calcPr.setAttribute('calcMode', 'auto')
  calcPr.setAttribute('fullCalcOnLoad', '1')
  calcPr.setAttribute('forceFullCalc', '1')

  zip.file(workbookPath, serializer.serializeToString(workbookDoc))
  zip.remove('xl/calcChain.xml')
}

export async function injectDataIntoExcelTemplate(
  templateBuffer: ArrayBuffer,
  tdsData: TDSRecordWithRelations
): Promise<Blob> {
  const zip = await JSZip.loadAsync(templateBuffer)

  const sheetPath = 'xl/worksheets/sheet1.xml'
  const sheetXml = await zip.file(sheetPath)?.async('string')

  if (!sheetXml) {
    throw new Error('Could not find worksheet in template')
  }

  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(sheetXml, 'text/xml')

  if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
    throw new Error('Could not parse worksheet XML')
  }

  const serializer = new XMLSerializer()
  const styleManager = new WorkbookStyleManager(zip, parser, serializer)
  await styleManager.load()

  const namespaceUri = xmlDoc.documentElement.namespaceURI
  const setCellValue = setCellValueFactory(xmlDoc, namespaceUri)
  const getCellStyleId = (cellRef: string) => {
    const parsed = parseCellReference(cellRef)
    if (!parsed) return null
    const rowElement = findRow(xmlDoc, namespaceUri, parsed.row)
    const cellElement = rowElement ? findCell(rowElement, namespaceUri, cellRef) : null
    return cellElement?.getAttribute('s') || null
  }
  const setStyledCellValue = (
    cellRef: string,
    value: CellValue,
    options: StyleOptions = {},
    fallbackCellRef?: string
  ) => {
    const cellElement = setCellValue(cellRef, value)
    styleManager.applyStyle(cellElement, {
      fontName: DATA_FONT_NAME,
      fontSize: DATA_FONT_SIZE,
      ...options,
    }, fallbackCellRef ? getCellStyleId(fallbackCellRef) : null)
    return cellElement
  }

  const sortedUnits = sortUnits(tdsData.units)
  const renderedUnitRows = Math.max(sortedUnits.length, 1)
  const rowDelta = resizeUnitTable(xmlDoc, namespaceUri, sortedUnits.length)
  const shiftedRow = (templateRow: number) => templateRow + rowDelta
  const lastUnitRow = UNIT_TABLE_START_ROW + renderedUnitRows - 1

  updateLookupFormulas(xmlDoc, namespaceUri, lastUnitRow)
  clearRenderedUnitRows(xmlDoc, namespaceUri, renderedUnitRows)

  // Header
  setCellValue('A1', `${tdsData.customer?.name}${tdsData.customer?.location ? ', ' + tdsData.customer.location : ''}`)

  // Machine info
  setCellValue('C2', tdsData.machine?.machine_code || '')
  setCellValue('D2', tdsData.machine?.machine_name || '')

  // Job Information
  setStyledCellValue('B4', formatDate(tdsData.date))
  setStyledCellValue('E4', tdsData.order_number)
  setStyledCellValue('G4', tdsData.num_units?.toString() || '')
  setStyledCellValue('I4', tdsData.job_type || '')

  setStyledCellValue('D5', tdsData.job_product_name || '')
  setStyledCellValue('D6', tdsData.design_artwork_bromide || '')

  setStyledCellValue('C7', tdsData.operator_name || '')
  setStyledCellValue('E7', tdsData.speed_mpm?.toString() || '')
  setStyledCellValue('G7', tdsData.downtime_min?.toString() || '')
  setStyledCellValue('I7', tdsData.shift_no || '')

  setStyledCellValue('C8', tdsData.action_on_job || '')

  // Substrate section
  setStyledCellValue('C11', tdsData.substrate_laminate || '')
  setStyledCellValue('G11', tdsData.surface_type || '')
  setStyledCellValue('I11', tdsData.width_mm?.toString() || '')

  // Corona
  setStyledCellValue('C12', tdsData.corona_treatment ? 'Yes' : 'No')
  setStyledCellValue('E12', tdsData.corona_treatment ? tdsData.corona_wattage?.toString() || '' : '')
  setStyledCellValue('G12', tdsData.corona_treatment ? tdsData.corona_treatment_side || '' : '')
  setStyledCellValue('I12', tdsData.corona_treatment ? tdsData.corona_dyne_level?.toString() || '' : '')

  // Foil
  setStyledCellValue('C13', tdsData.foil_supplier || '')
  setStyledCellValue('E13', tdsData.foil_type || '')
  setStyledCellValue('G13', tdsData.foil_colour_finish || '')

  // Units table
  sortedUnits.forEach((unit, index) => {
    const row = UNIT_TABLE_START_ROW + index

    setCellValue(`A${row}`, normalizeUnitNumber(unit.unit_no))
    setCellValue(`B${row}`, unit.color_station || '')
    setCellValue(`C${row}`, `${unit.anilox_value || ''} ${unit.anilox_unit || ''}`)
    setCellValue(`D${row}`, `${unit.volume_value || ''} ${unit.volume_unit || ''}`)
    setCellValue(`E${row}`, unit.ink_name || '')
    setCellValue(`F${row}`, unit.batch_code || '')
    setCellValue(`G${row}`, unit.lamp_hrs?.toString() || '')
    setCellValue(`H${row}`, unit.intensity_pct?.toString() || '')
    setCellValue(`I${row}`, unit.unit_remarks || '')
    setStyledCellValue(`J${row}`, unit.plate_tape || '', {
      fontColor: plateTapeFontColor(unit.plate_tape),
      horizontal: 'center',
      vertical: 'center',
    }, `J${UNIT_TABLE_START_ROW}`)
  })

  // Quality parameters
  const qualityRow = shiftedRow(QUALITY_VALUES_TEMPLATE_ROW)
  const overallResult = tdsData.overall_result || computeOverallResult({
    tape_test: tdsData.tape_test,
    flow_marks: tdsData.flow_marks,
    flex_test: tdsData.flex_test,
    graphite_test: tdsData.graphite_test,
    adhesion_test: tdsData.adhesion_test,
    rub_scuff_test: tdsData.rub_scuff_test,
    ink_lay_tone_check: tdsData.ink_lay_tone_check,
  })
  const qualityValues = [
    { column: 'A', value: tdsData.tape_test || '' },
    { column: 'B', value: tdsData.flow_marks || '' },
    { column: 'C', value: tdsData.flex_test || '' },
    { column: 'D', value: tdsData.graphite_test || '' },
    { column: 'E', value: tdsData.adhesion_test || '' },
    { column: 'F', value: tdsData.rub_scuff_test || '' },
    { column: 'G', value: tdsData.ink_lay_tone_check || '' },
    { column: 'H', value: overallResult },
  ]

  qualityValues.forEach(({ column, value }) => {
    setStyledCellValue(`${column}${qualityRow}`, value, {
      fontColor: qualityFontColor(value),
      horizontal: 'center',
      vertical: 'center',
    }, `A${qualityRow}`)
  })
  clearCellValue(xmlDoc, namespaceUri, `I${qualityRow}`)

  setStyledCellValue(`C${shiftedRow(QUALITY_NOTES_TEMPLATE_ROW)}`, tdsData.quality_notes || '')

  // Footer
  setCellValue(`A${shiftedRow(PREPARED_BY_TEMPLATE_ROW)}`, tdsData.prepared_by)
  setCellValue(`A${shiftedRow(PREPARED_AT_TEMPLATE_ROW)}`, formatDate(tdsData.prepared_at))

  zip.file(sheetPath, serializer.serializeToString(xmlDoc))
  styleManager.save()
  await forceWorkbookRecalculation(zip, parser, serializer)

  return await zip.generateAsync({ type: 'blob' })
}

export function downloadExcel(blob: Blob, filename: string) {
  saveAs(blob, filename)
}
