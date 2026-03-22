import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Film, Menu, X, User, LogOut, Crown, Sparkles, ChevronDown } from 'lucide-react'

function Navbar({ user, setUser }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)
    navigate('/')
  }

  const navLinks = [
    { to: '/', label: '首页' },
    { to: '/pricing', label: '定价' },
    ...(user ? [{ to: '/dashboard', label: '我的剧本' }] : []),
  ]

  const isActive = (path) => location.pathname === path

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/90 backdrop-blur-xl shadow-lg shadow-gray-200/50' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:shadow-violet-500/50 group-hover:scale-105 transition-all">
              <Film className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">影刃AI</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive(link.to)
                    ? 'text-violet-600 bg-violet-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                <Link
                  to="/create"
                  className="btn-primary text-sm px-5 py-2.5"
                >
                  <Sparkles className="w-4 h-4 mr-1.5" />
                  开始创作
                </Link>
                
                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold">
                      {user.username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left hidden lg:block">
                      <p className="text-sm font-medium text-gray-900">{user.username}</p>
                      <p className="text-xs text-gray-500 capitalize">
                        {user.subscription?.plan === 'free' ? '免费版' : 
                         user.subscription?.plan === 'standard' ? '标准版' : 
                         user.subscription?.plan === 'pro' ? '专业版' : '企业版'}
                      </p>
                    </div>
                    {user.subscription?.plan !== 'free' && (
                      <Crown className="w-4 h-4 text-amber-500" />
                    )}
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>

                  {/* Dropdown */}
                  {showUserMenu && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setShowUserMenu(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl shadow-gray-200/50 border border-gray-100 py-2 z-20">
                        <div className="px-4 py-3 border-b border-gray-100 lg:hidden">
                          <p className="font-medium text-gray-900">{user.username}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                        
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <User className="w-4 h-4 mr-3 text-gray-400" />
                          个人中心
                        </Link>
                        
                        <Link
                          to="/dashboard/settings"
                          className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Crown className="w-4 h-4 mr-3 text-gray-400" />
                          订阅管理
                        </Link>
                        
                        <div className="border-t border-gray-100 my-2" />
                        
                        <button
                          onClick={() => {
                            handleLogout()
                            setShowUserMenu(false)
                          }}
                          className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          退出登录
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-gray-600 hover:text-gray-900 font-medium text-sm px-4 py-2"
                >
                  登录
                </Link>
                <Link 
                  to="/register" 
                  className="btn-primary text-sm px-5 py-2.5"
                >
                  免费注册
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden transition-all duration-300 overflow-hidden ${
        isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="bg-white border-t border-gray-100 px-4 py-4 space-y-2 shadow-lg">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                isActive(link.to)
                  ? 'text-violet-600 bg-violet-50'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          
          {user ? (
            <>
              <Link
                to="/create"
                className="flex items-center px-4 py-3 rounded-xl text-base font-medium text-white bg-gradient-to-r from-violet-600 to-indigo-600"
                onClick={() => setIsOpen(false)}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                开始创作
              </Link>
              <div className="border-t border-gray-100 my-2" />
              <Link
                to="/profile"
                className="block px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
              >
                个人中心
              </Link>
              <button
                onClick={() => {
                  handleLogout()
                  setIsOpen(false)
                }}
                className="flex items-center w-full px-4 py-3 rounded-xl text-base font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-5 h-5 mr-2" />
                退出登录
              </button>
            </>
          ) : (
            <>
              <div className="border-t border-gray-100 my-2" />
              <Link
                to="/login"
                className="block px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
              >
                登录
              </Link>
              <Link
                to="/register"
                className="block px-4 py-3 rounded-xl text-base font-medium text-white bg-gradient-to-r from-violet-600 to-indigo-600 text-center"
                onClick={() => setIsOpen(false)}
              >
                免费注册
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
