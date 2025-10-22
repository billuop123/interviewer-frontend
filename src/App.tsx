
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Suspense, lazy } from 'react'
import { UserProvider, useUser } from './contexts/userContext'
import { AuthGuard } from './components/AuthGuard'
import { GlobalLoader } from './components/GlobalLoader'
import { RoleGuard } from './components/RoleGuard'

// Lazy load all page components
const Home = lazy(() => import('./pages/Home').then(module => ({ default: module.Home })))
const Signin = lazy(() => import('./pages/Signin').then(module => ({ default: module.Signin })))
const Signup = lazy(() => import('./pages/Signup').then(module => ({ default: module.Signup })))
const Jobs = lazy(() => import('./pages/Jobs').then(module => ({ default: module.Jobs })))
const Jobdetails = lazy(() => import('./pages/Jobdetails').then(module => ({ default: module.Jobdetails })))
const Interview = lazy(() => import('./pages/Interview').then(module => ({ default: module.Interview })))
const CompanyJobs = lazy(() => import('./pages/CompanyJobs').then(module => ({ default: module.CompanyJobs })))
const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(module => ({ default: module.AdminDashboard })))
const CreateCompany = lazy(() => import('./pages/CreateCompany').then(module => ({ default: module.CreateCompany })))
const MyCompanies = lazy(() => import('./pages/MyCompanies').then(module => ({ default: module.MyCompanies })))
const UserDetails = lazy(() => import('./pages/UserDetails').then(module => ({ default: module.UserDetails })))
const PostJob = lazy(() => import('./pages/PostJob').then(module => ({ default: module.PostJob })))
const ApplicationDetails = lazy(() => import('./pages/ApplicationDetails').then(module => ({ default: module.ApplicationDetails })))
const EditCompany = lazy(() => import('./pages/EditCompany').then(module => ({ default: module.EditCompany })))
const ViewJobs = lazy(() => import('./pages/ViewJobs').then(module => ({ default: module.ViewJobs })))
const Applications = lazy(() => import('./pages/Applications').then(module => ({ default: module.Applications })))
const User = lazy(() => import('./pages/User').then(module => ({ default: module.User })))
const NotFound = lazy(() => import('./pages/NotFound').then(module => ({ default: module.NotFound })))

function AppContent() {
  const { user } = useUser()

  return (
    <>
      <Suspense fallback={<GlobalLoader />}>
        <Routes>
          {/* Public Routes - No authentication required */}
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup/>} />
          
          {/* Protected Routes - Authentication required */}
          <Route path="/jobs" element={
            <AuthGuard>
              <Jobs/>
            </AuthGuard>
          } />
          <Route path="/company-jobs" element={
            <AuthGuard>
              <CompanyJobs/>
            </AuthGuard>
          } />
          <Route path="/dashboard" element={
            <AuthGuard>
              <Dashboard/>
            </AuthGuard>
          } />
          <Route path="/admindashboard" element={
            <AuthGuard>
              <AdminDashboard/>
            </AuthGuard>
          } />
          <Route path="/create-company" element={
            <AuthGuard>
              <RoleGuard allowedRoles={["RECRUITER", "ADMIN"]}>
                <CreateCompany/>
              </RoleGuard>
            </AuthGuard>
          } />
          <Route path="/my-companies" element={
            <AuthGuard>
              <RoleGuard allowedRoles={["RECRUITER", "ADMIN"]}>
                <MyCompanies/>
              </RoleGuard>
            </AuthGuard>
          } />
          <Route path="/applications" element={
            <AuthGuard>
              <Applications/>
            </AuthGuard>
          } />
          <Route path="/user-details" element={
            <AuthGuard>
              <UserDetails/>
            </AuthGuard>
          } />
          <Route path="/job/:jobId" element={
            <AuthGuard>
              <Jobdetails/>
            </AuthGuard>
          } />
          <Route path="/interview/:jobId/:applicationId" element={
            <AuthGuard>
              <Interview/>
            </AuthGuard>
          } />
          <Route path="/company/:companyId/post-job" element={
            <AuthGuard>
              <PostJob/>
            </AuthGuard>
          } />
          <Route path="/application/:applicationId" element={
            <AuthGuard>
              <ApplicationDetails/>
            </AuthGuard>
          } />
          <Route path="/company/:companyId/edit" element={
            <AuthGuard>
              <EditCompany/>
            </AuthGuard>
          } />
          <Route path="/company/:companyId/jobs" element={
            <AuthGuard>
              <ViewJobs/>
            </AuthGuard>
          } />
          <Route path="/user/:userId" element={
            <AuthGuard>
              <User/>
            </AuthGuard>
          } />
          
          {/* 404 Not Found Route - Must be last */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
          },
        }}
      />
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </BrowserRouter>
  )
}

export default App
