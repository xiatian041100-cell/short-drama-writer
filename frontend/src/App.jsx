import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import CreateScript from './pages/CreateScript'
import ScriptDetail from './pages/ScriptDetail'
import Pricing from './pages/Pricing'
import Payment from './pages/Payment'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Register from './pages/Register'
import Admin from './pages/Admin'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 检查本地存储的token
    const token = localStorage.getItem('token')
    if (token) {
      // 验证token并获取用户信息
      fetchUserInfo(token)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUserInfo = async (token) => {
    try {
      // 这里后续会调用真实API
      // const response = await api.get('/auth/me')
      // setUser(response.data)
      setLoading(false)
    } catch (error) {
      localStorage.removeItem('token')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} setUser={setUser} />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register setUser={setUser} />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/payment" element={
            user ? <Payment /> : <Navigate to="/login" />
          } />
          <Route path="/profile" element={
            user ? <Profile user={user} /> : <Navigate to="/login" />
          } />
          <Route path="/dashboard" element={
            user ? <Dashboard user={user} /> : <Navigate to="/login" />
          } />
          <Route path="/create" element={
            user ? <CreateScript user={user} /> : <Navigate to="/login" />
          } />
          <Route path="/script/:id" element={
            user ? <ScriptDetail user={user} /> : <Navigate to="/login" />
          } />
          <Route path="/admin" element={
            user?.isAdmin ? <Admin user={user} /> : <Navigate to="/" />
          } />
        </Routes>
      </main>
    </div>
  )
}

export default App