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
import { User, Shield, Upload, Loader2, CheckCircle } from 'lucide-react'

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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account and system preferences
          </p>
        </div>

        {/* User Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              User Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{user?.fullName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Roles</p>
              <div className="flex gap-2">
                {user?.roles?.map(role => (
                  <Badge key={role} variant="secondary">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Section */}
        {isAdmin() && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <UserManagement />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="mr-2 h-5 w-5" />
                  Excel Template Upload
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Upload the master Excel template (Flexo_NarrowWeb_TDS_v2.xlsx) that will be used for all exports.
                  The template structure must match the original format exactly.
                </p>

                <div className="flex items-center gap-4">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx"
                    onChange={handleFileChange}
                    disabled={uploading}
                  />
                  <Button
                    onClick={handleUpload}
                    disabled={!uploadedFile || uploading}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload
                      </>
                    )}
                  </Button>
                </div>

                {uploadedFile && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>Selected: {uploadedFile.name}</span>
                  </div>
                )}

                <div className="bg-muted/50 p-4 rounded-md text-sm">
                  <p className="font-semibold mb-2">Template Requirements:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>File format: .xlsx (Excel 2007+)</li>
                    <li>Yellow highlighting on batch code column (Column F)</li>
                    <li>Preserve all cell merging and formatting</li>
                    <li>Keep lookup formulas intact</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </Layout>
  )
}