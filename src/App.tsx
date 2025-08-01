import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { Button } from './components/ui/button'
import { Settings, Users, BarChart3, Package } from 'lucide-react'

function App(): JSX.Element {
  const headerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // GSAP animations
    const tl = gsap.timeline()

    // Header animation
    if (headerRef.current) {
      tl.fromTo(headerRef.current, 
        { y: -50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }
      )
    }

    // Content animation
    if (contentRef.current) {
      tl.fromTo(contentRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
        "-=0.4"
      )
    }

    // Cards animation
    if (cardsRef.current) {
      const cards = cardsRef.current.children
      tl.fromTo(cards,
        { y: 50, opacity: 0, scale: 0.9 },
        { 
          y: 0, 
          opacity: 1, 
          scale: 1, 
          duration: 0.5, 
          stagger: 0.1,
          ease: "back.out(1.7)"
        },
        "-=0.2"
      )
    }

    return () => {
      tl.kill()
    }
  }, [])

  const features = [
    {
      icon: <Settings className="h-6 w-6" />,
      title: "Dashboard Management",
      description: "Comprehensive admin dashboard with real-time analytics and user management."
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "User Management",
      description: "Efficient user management system with role-based access control."
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Analytics",
      description: "Advanced analytics and reporting tools for business insights."
    },
    {
      icon: <Package className="h-6 w-6" />,
      title: "Product Management",
      description: "Complete product catalog management with inventory tracking."
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header ref={headerRef} className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Admin Dashboard
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Modern React TypeScript admin interface with ShadCN UI and GSAP animations
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section ref={contentRef} className="text-center mb-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
              Welcome to Your Admin Panel
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg">
              Built with React, TypeScript, Tailwind CSS, and ShadCN UI for a modern and responsive experience.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Get Started
              </Button>
              <Button variant="outline" size="lg">
                View Documentation
              </Button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg mb-4">
                <div className="text-blue-600 dark:text-blue-400">
                  {feature.icon}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </section>

        {/* Stats Section */}
        <section className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-lg border border-slate-200 dark:border-slate-700">
          <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-6 text-center">
            Quick Stats
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">1,234</div>
              <div className="text-slate-600 dark:text-slate-400">Total Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">567</div>
              <div className="text-slate-600 dark:text-slate-400">Active Products</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">89</div>
              <div className="text-slate-600 dark:text-slate-400">Orders Today</div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16">
        <div className="text-center text-slate-600 dark:text-slate-400">
          <p>&copy; 2024 Admin Dashboard. Built with React + TypeScript + Tailwind CSS + ShadCN UI</p>
        </div>
      </footer>
    </div>
  )
}

export default App
