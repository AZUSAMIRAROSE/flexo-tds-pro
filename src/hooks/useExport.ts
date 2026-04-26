import { useState } from 'react'
import { useTDSRecord } from './useTDS'
import { useTemplates } from './useTemplates'
import { toast } from '@/components/ui/use-toast'
import { injectDataIntoExcelTemplate, downloadExcel } from '@/lib/exportUtils'
import { generatePDF, downloadPDF } from '@/lib/pdfExport'
import { generateWordDocument, downloadWord } from '@/lib/wordExport'
import { formatDate } from '@/lib/utils'

export function useExport(tdsId: string) {
  const [exporting, setExporting] = useState(false)
  const { data: tdsRecord } = useTDSRecord(tdsId)
  const { downloadTemplate } = useTemplates()

  const getFilename = (extension: string) => {
    if (!tdsRecord) return `TDS.${extension}`
    return `Flexo_TDS_${tdsRecord.order_number}_${formatDate(tdsRecord.date, 'yyyy-MM-dd')}.${extension}`
  }

  const exportToExcel = async () => {
    if (!tdsRecord) return

    setExporting(true)
    try {
      const templateBuffer = await downloadTemplate()
      if (!templateBuffer) {
        throw new Error('Template not found. Please upload the Excel template first.')
      }

      const blob = await injectDataIntoExcelTemplate(templateBuffer, tdsRecord)
      downloadExcel(blob, getFilename('xlsx'))

      // Log export activity
      await fetch('/api/log-activity', {
        method: 'POST',
        body: JSON.stringify({
          tds_record_id: tdsId,
          action: 'exported',
          new_value: 'Excel',
        }),
      })

      toast({
        title: 'Export successful',
        description: 'Excel file has been downloaded.',
      })
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Export failed',
        description: error.message,
      })
    } finally {
      setExporting(false)
    }
  }

  const exportToPDF = async () => {
    if (!tdsRecord) return

    setExporting(true)
    try {
      const blob = await generatePDF(tdsRecord)
      downloadPDF(blob, getFilename('pdf'))

      toast({
        title: 'Export successful',
        description: 'PDF file has been downloaded.',
      })
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Export failed',
        description: error.message,
      })
    } finally {
      setExporting(false)
    }
  }

  const exportToWord = async () => {
    if (!tdsRecord) return

    setExporting(true)
    try {
      const blob = await generateWordDocument(tdsRecord)
      downloadWord(blob, getFilename('docx'))

      toast({
        title: 'Export successful',
        description: 'Word document has been downloaded.',
      })
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Export failed',
        description: error.message,
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