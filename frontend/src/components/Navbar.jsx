import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Film, Menu, X, User, LogOut, Crown } from 'lucide-react'

function Navbar({ user, setUser }) {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)
    navigate('/')
  }

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
              <Film className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">影刃AI</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 hover:text-gray-900 transition-colors">
              首页
            </Link>
            <Link to="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
              价格
            </Link>
            {user && (
              <>
                <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
                  我的剧本
                </Link>
                <Link to="/profile" className="text-gray-600 hover:text-gray-900 transition-colors">
                  个人中心
                </Link>
              </>
            )}
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/create"
                  className="btn-primary"
                >
                  开始创作
                </Link>
                <div className="flex items-center space-x-2">
                  {user.membership?.type !== 'free' && (
                    <Crown className="w-4 h-4 text-yellow-500" />
                  )}
                  <span className="text-sm text-gray-600">{user.username}</span>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-600 hover:text-gray-900 transition-colors">
                  登录
                </Link>
                <Link to="/register" className="btn-primary">
                  免费注册
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-4 pt-2 pb-4 space-y-1">
            <Link
              to="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              首页
            </Link>
            <Link
              to="/pricing"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              价格
            </Link>
            {user && (
              <Link
                to="/dashboard"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
              >
                我的剧本
              </Link>
            )}
            {user ? (
              <>
                <Link
                  to="/create"
                  className="block px-3 py-2 rounded-md text-base font-medium text-primary-600 hover:bg-primary-50"
                  onClick={() => setIsOpen(false)}
                >
                  开始创作
                </Link>
                <button
                  onClick={() => {
                    handleLogout()
                    setIsOpen(false)
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                >
                  退出登录
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  登录
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium text-primary-600 hover:bg-primary-50"
                  onClick={() => setIsOpen(false)}
                >
                  免费注册
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar