import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/toaster'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import Login from '@/pages/Login'
import ResetPassword from '@/pages/ResetPassword'
import Dashboard from '@/pages/Dashboard'
import TDSList from '@/pages/TDSList'
import TDSEditor from '@/pages/TDSEditor'
import Customers from '@/pages/Customers'
import Machines from '@/pages/Machines'
import Settings from '@/pages/Settings'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Protected routes — any authenticated user */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/tds"
            element={
              <ProtectedRoute>
                <TDSList />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/tds/new"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Technical Officer']}>
                <TDSEditor />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/tds/:id"
            element={
              <ProtectedRoute>
                <TDSEditor />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/customers"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Technical Officer']}>
                <Customers />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/machines"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Technical Officer']}>
                <Machines />
              </ProtectedRoute>
            }
          />
          
          {/* Account settings with admin-only controls inside the page */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
