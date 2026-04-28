import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/use-toast'
import { Loader2, ShieldCheck, ShieldAlert, Eye } from 'lucide-react'
import { USER_ROLES } from '@/lib/constants'
import { useAuth } from '@/hooks/useAuth'

interface UserWithRole {
  user_id: string
  role: string
  email: string
  full_name: string
  created_at: string
}

export function UserManagement() {
  const { user: currentUser } = useAuth()
  const queryClient = useQueryClient()
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    userId: string
    newRole: string
    currentRole: string
  }>({ open: false, userId: '', newRole: '', currentRole: '' })

  // Fetch all user roles with profile data from user_roles table
  // This does NOT use auth.admin — it reads from the public user_roles table
  // which the admin can access via RLS policy.
  const { data: users, isLoading } = useQuery({
    queryKey: ['user-management'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) throw error
      return (data || []) as UserWithRole[]
    },
  })

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: string }) => {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-management'] })
      queryClient.invalidateQueries({ queryKey: ['user-roles'] })
      toast({
        title: 'Role updated',
        description: 'User role has been successfully changed.',
      })
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Failed to update role',
        description: error.message,
      })
    },
  })

  const handleRoleChange = (userId: string, newRole: string, currentRole: string) => {
    // Prevent changing your own role
    if (userId === currentUser?.id) {
      toast({
        variant: 'destructive',
        title: 'Action blocked',
        description: 'You cannot change your own role. Ask another admin.',
      })
      return
    }

    setConfirmDialog({ open: true, userId, newRole, currentRole })
  }

  const confirmRoleChange = () => {
    updateRoleMutation.mutate({
      userId: confirmDialog.userId,
      newRole: confirmDialog.newRole,
    })
    setConfirmDialog({ open: false, userId: '', newRole: '', currentRole: '' })
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Admin': return <ShieldAlert className="h-3.5 w-3.5" />
      case 'Technical Officer': return <ShieldCheck className="h-3.5 w-3.5" />
      case 'Viewer': return <Eye className="h-3.5 w-3.5" />
      default: return null
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'Admin': return 'destructive' as const
      case 'Technical Officer': return 'default' as const
      case 'Viewer': return 'secondary' as const
      default: return 'secondary' as const
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Registered Users</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Users register themselves via the signup page. You control their role & access level here.
          </p>
        </div>
        <Badge variant="outline" className="font-mono">
          {users?.length || 0} users
        </Badge>
      </div>

      {users && users.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Current Role</TableHead>
              <TableHead>Change Role</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => {
              const isSelf = u.user_id === currentUser?.id
              return (
                <TableRow key={u.user_id} className={isSelf ? 'bg-primary/5' : ''}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {u.full_name || 'Unknown'}
                      {isSelf && (
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5">YOU</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">
                    {u.email || '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(u.role)} className="gap-1">
                      {getRoleIcon(u.role)}
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {isSelf ? (
                      <span className="text-xs text-muted-foreground italic">Protected</span>
                    ) : (
                      <Select
                        value={u.role}
                        onValueChange={(newRole) => handleRoleChange(u.user_id, newRole, u.role)}
                        disabled={updateRoleMutation.isPending}
                      >
                        <SelectTrigger className="w-[180px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {USER_ROLES.map((role) => (
                            <SelectItem key={role} value={role} className="text-xs">
                              <div className="flex items-center gap-2">
                                {getRoleIcon(role)}
                                {role}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">No users registered yet.</p>
          <p className="text-xs mt-1">Users will appear here after they sign up.</p>
        </div>
      )}

      {/* Role Change Confirmation */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => 
        setConfirmDialog(prev => ({ ...prev, open }))
      }>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Role Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change this user's role from{' '}
              <strong>{confirmDialog.currentRole}</strong> to{' '}
              <strong>{confirmDialog.newRole}</strong>? This will immediately
              change their access permissions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRoleChange}>
              Confirm Change
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}