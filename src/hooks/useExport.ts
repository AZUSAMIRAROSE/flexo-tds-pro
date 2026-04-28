import { useState } from 'react'
import { useTDSRecord } from './useTDS'
import { useTemplates } from './useTemplates'
import { toast } from '@/components/ui/use-toast'
import { injectDataIntoExcelTemplate, downloadExcel } from '@/lib/exportUtils'
import { generatePDF, downloadPDF } from '@/lib/pdfExport'
import { generateWordDocument, downloadWord } from '@/lib/wordExport'
import { formatDate } from '@/lib/utils'
import { logActivity } from '@/lib/activityLog'
import { supabase } from '@/lib/supabase'
import type { TDSRecordWithRelations } from '@/types/tds.types'

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Export failed. Please try again.'
}

export function useExport(tdsId: string, initialRecord?: TDSRecordWithRelations | null) {
  const [exporting, setExporting] = useState(false)
  const needsFullRecord = !initialRecord || initialRecord.units === undefined
  const { data: fetchedRecord } = useTDSRecord(needsFullRecord ? tdsId : undefined)
  const { downloadTemplate } = useTemplates()
  const tdsRecord = fetchedRecord || initialRecord

  const resolveRecordForExport = async () => {
    if (tdsRecord && tdsRecord.units !== undefined) return tdsRecord
    if (!tdsId) return tdsRecord || null

    const { data, error } = await supabase
      .from('tds_records')
      .select(`
        *,
        customer:customers(*),
        machine:machines(*),
        units:tds_units(*)
      `)
      .eq('id', tdsId)
      .single()

    if (error) throw error

    const record = data as unknown as TDSRecordWithRelations
    record.units?.sort((a, b) => Number(a.unit_no) - Number(b.unit_no))

    return record
  }

  const getFilename = (record: TDSRecordWithRelations | null | undefined, extension: string) => {
    if (!record) return `TDS.${extension}`
    return `Flexo_TDS_${record.order_number}_${formatDate(record.date, 'yyyy-MM-dd')}.${extension}`
  }

  const exportToExcel = async () => {
    if (!tdsRecord) return

    setExporting(true)
    try {
      const recordToExport = await resolveRecordForExport()
      if (!recordToExport) {
        throw new Error('TDS record is still loading. Please try again.')
      }

      const templateBuffer = await downloadTemplate()
      if (!templateBuffer) {
        throw new Error('Template not found. Please upload the Excel template first.')
      }

      const blob = await injectDataIntoExcelTemplate(templateBuffer, recordToExport)
      downloadExcel(blob, getFilename(recordToExport, 'xlsx'))

      await logActivity({
        tdsRecordId: tdsId,
        action: 'exported',
        newValue: 'Excel',
      })

      toast({
        title: 'Export successful',
        description: 'Excel file has been downloaded.',
      })
    } catch (error: unknown) {
      toast({
        variant: 'destructive',
        title: 'Export failed',
        description: getErrorMessage(error),
      })
    } finally {
      setExporting(false)
    }
  }

  const exportToPDF = async () => {
    if (!tdsRecord) return

    setExporting(true)
    try {
      const recordToExport = await resolveRecordForExport()
      if (!recordToExport) {
        throw new Error('TDS record is still loading. Please try again.')
      }

      const blob = await generatePDF(recordToExport)
      downloadPDF(blob, getFilename(recordToExport, 'pdf'))

      await logActivity({
        tdsRecordId: tdsId,
        action: 'exported',
        newValue: 'PDF',
      })

      toast({
        title: 'Export successful',
        description: 'PDF file has been downloaded.',
      })
    } catch (error: unknown) {
      toast({
        variant: 'destructive',
        title: 'Export failed',
        description: getErrorMessage(error),
      })
    } finally {
      setExporting(false)
    }
  }

  const exportToWord = async () => {
    if (!tdsRecord) return

    setExporting(true)
    try {
      const recordToExport = await resolveRecordForExport()
      if (!recordToExport) {
        throw new Error('TDS record is still loading. Please try again.')
      }

      const blob = await generateWordDocument(recordToExport)
      downloadWord(blob, getFilename(recordToExport, 'docx'))

      await logActivity({
        tdsRecordId: tdsId,
        action: 'exported',
        newValue: 'Word',
      })

      toast({
        title: 'Export successful',
        description: 'Word document has been downloaded.',
      })
    } catch (error: unknown) {
      toast({
        variant: 'destructive',
        title: 'Export failed',
        description: getErrorMessage(error),
      })
    } finally {
      setExporting(false)
    }
  }

  return {
    exportToExcel,
    exportToPDF,
    exportToWord,
    exporting,
  }
}
