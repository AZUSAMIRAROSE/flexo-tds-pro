import { useState, useRef } from 'react'
import Layout from '@/components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserManagement } from '@/components/admin/UserManagement'
import { useAuth } from '@/hooks/useAuth'
import { useTemplates } from '@/hooks/useTemplates'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/use-toast'
import { User, Shield, Upload, Loader2, CheckCircle, Users } from 'lucide-react'

export default function Settings() {
  const { user, isAdmin } = useAuth()
  const { uploadTemplate, uploading } = useTemplates()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.name.endsWith('.xlsx')) {
      setUploadedFile(file)
    } else {
      toast({
        variant: 'destructive',
        title: 'Invalid file',
        description: 'Please select an Excel (.xlsx) file',
      })
    }
  }

  const handleUpload = async () => {
    if (!uploadedFile) return
    const success = await uploadTemplate(uploadedFile)
    if (success) {
      setUploadedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <Layout>
      <div className="space-y-6 fade-in max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel p-4 md:p-6 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
              SYSTEM CONFIGURATION
            </h1>
            <p className="text-sm text-muted-foreground mt-1 font-mono">
              Manage your account and administrative preferences
            </p>
          </div>
        </div>

        {/* User Profile */}
        <Card className="glass-panel border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          <CardHeader className="border-b border-white/5 bg-white/[0.02]">
            <CardTitle className="flex items-center text-lg">
              <User className="mr-2 h-5 w-5 text-primary" />
              Operator Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="label-caps text-muted-foreground">Operator Name</p>
                <p className="font-medium text-lg text-foreground">{user?.fullName}</p>
              </div>
              <div className="space-y-1">
                <p className="label-caps text-muted-foreground">System Email</p>
                <p className="font-medium text-lg text-foreground">{user?.email}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="label-caps text-muted-foreground mb-3">Security Clearance Levels</p>
              <div className="flex gap-2">
                {user?.roles?.map(role => (
                  <Badge key={role} variant="secondary" className="bg-primary/20 text-primary border-primary/30 font-mono tracking-wider">
                    {role.toUpperCase()}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Section */}
        {isAdmin() && (
          <div className="space-y-6 pt-4 border-t border-white/10">
            <h2 className="text-xl font-bold tracking-widest text-foreground uppercase mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-warning" />
              Administrative Controls
            </h2>

            <Card className="glass-panel border-white/5 border-l-4 border-l-warning">
              <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                <CardTitle className="flex items-center text-lg">
                  <Users className="mr-2 h-5 w-5 text-warning" />
                  Access Management
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <UserManagement />
              </CardContent>
            </Card>

            <Card className="glass-panel border-white/5">
              <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                <CardTitle className="flex items-center text-lg">
                  <Upload className="mr-2 h-5 w-5 text-secondary" />
                  Engine Template Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="bg-secondary/10 border border-secondary/20 p-4 rounded-md">
                  <p className="text-sm text-secondary-foreground font-medium">
                    Upload the master Excel template (`Flexo_NarrowWeb_TDS_v2.xlsx`) that will be used by the export engine. 
                    The template structure must match the original format exactly for data injection to work correctly.
                  </p>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 bg-background/50 p-4 rounded border border-white/5">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx"
                    onChange={handleFileChange}
                    disabled={uploading}
                    className="border-white/10 bg-white/[0.02] cursor-pointer file:text-primary file:font-semibold"
                  />
                  <Button
                    onClick={handleUpload}
                    disabled={!uploadedFile || uploading}
                    className="w-full md:w-auto shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        UPLOADING...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        DEPLOY TEMPLATE
                      </>
                    )}
                  </Button>
                </div>

                {uploadedFile && (
                  <div className="flex items-center gap-2 text-sm font-mono px-4 py-2 bg-success/10 border border-success/20 rounded text-success">
                    <CheckCircle className="h-4 w-4" />
                    <span>File staged for deployment: {uploadedFile.name}</span>
                  </div>
                )}

                <div className="bg-white/[0.02] border border-white/5 p-5 rounded-md">
                  <p className="font-semibold mb-3 tracking-widest text-sm uppercase text-foreground">Strict Engine Requirements</p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground list-inside list-disc">
                    <li>Must be `.xlsx` format (Excel 2007+)</li>
                    <li>Yellow highlighting on batch code (Col F)</li>
                    <li>Preserve all merged cells exactly</li>
                    <li>Preserve background colors/borders</li>
                    <li>Do not move data injection coordinates</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  )
}