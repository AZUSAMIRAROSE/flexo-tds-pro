import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from '@/components/ui/use-toast'

const TEMPLATE_PATH = 'Flexo_NarrowWeb_TDS_v2.xlsx'

export function useTemplates() {
  const [uploading, setUploading] = useState(false)

  const uploadTemplate = async (file: File) => {
    setUploading(true)
    try {
      // Delete existing template if exists
      await supabase.storage.from('templates').remove([TEMPLATE_PATH])

      // Upload new template
      const { error } = await supabase.storage
        .from('templates')
        .upload(TEMPLATE_PATH, file, {
          cacheControl: '3600',
          upsert: true,
        })

      if (error) throw error

      toast({
        title: 'Template uploaded',
        description: 'Excel template has been successfully uploaded.',
      })
      
      return true
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: error.message,
      })
      return false
    } finally {
      setUploading(false)
    }
  }

  const getTemplateUrl = async () => {
    const { data } = await supabase.storage
      .from('templates')
      .createSignedUrl(TEMPLATE_PATH, 60) // 60 seconds expiry

    return data?.signedUrl || null
  }

  const downloadTemplate = async (): Promise<ArrayBuffer | null> => {
    try {
      const { data, error } = await supabase.storage
        .from('templates')
        .download(TEMPLATE_PATH)

      if (error) throw error
      
      return await data.arrayBuffer()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Template not found',
        description: 'Please upload the Excel template first.',
      })
      return null
    }
  }

  return {
    uploadTemplate,
    getTemplateUrl,
    downloadTemplate,
    uploading,
  }
}