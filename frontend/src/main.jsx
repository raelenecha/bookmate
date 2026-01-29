import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Layout from './components/Layout'
import { AuthProvider } from './components/UserAuth'

import Login from './pages/LoginPage'
import Signup from './pages/SignupPage'
import Home from './pages/HomePage'
import AccountOverviewPage from './pages/AccountOverviewPage'
import MyRewardsPage from './pages/MyRewardsPage'
import BookDetails from './pages/BookDetails'
import BookCataloguePage from './pages/BookCataloguePage'
import NotFound from './pages/NotFound'
import BookCreate from './pages/BookCreate'
import BookEdit from './pages/BookEdit'
import './styles/Global.scss'

createRoot(document.body).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/home" element={<Home />} />
            <Route path="/account" element={<AccountOverviewPage />} />
            <Route path="/rewards" element={<MyRewardsPage />} />
            <Route path="/book/new" element={<BookCreate />} />
            <Route path="/book/:bookId/edit" element={<BookEdit />} />
            <Route path="/book/:bookId" element={<BookDetails />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/catalogue" element={<BookCataloguePage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
