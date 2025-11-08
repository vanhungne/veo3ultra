'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    setMounted(true);
    
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  const downloadLink = 'https://drive.google.com/file/d/11iDaQ2TCjt4TMBqIiAALPM_6xaGf7Gno/view?usp=drive_link';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🎬</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                VeoProGen
              </span>
            </div>
            <div className="flex items-center space-x-6">
              <a href="#features" className="hover:text-purple-300 transition-colors">Features</a>
              <a href="#download" className="hover:text-purple-300 transition-colors">Download</a>
              <a href="#about" className="hover:text-purple-300 transition-colors">About</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-32 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            {/* Main Title */}
            <div className="mb-8 animate-fade-in-up">
              <h1 className="text-7xl md:text-8xl font-extrabold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-gradient">
                VeoProGen
              </h1>
              <p className="text-2xl md:text-3xl font-light text-gray-300 mb-4">
                Professional Video Generation Tool
              </p>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Tạo video chuyên nghiệp với AI mạnh mẽ. Công cụ hàng đầu cho content creators và marketers.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12 animate-fade-in-up animation-delay-400">
              <a
                href={downloadLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-xl font-semibold text-lg transform transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-purple-500/50"
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <span>⬇️</span>
                  <span>Download Now</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-0 group-hover:opacity-100 blur transition-opacity"></div>
              </a>
              
              <a
                href="#features"
                className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all transform hover:scale-105"
              >
                Learn More
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 animate-fade-in-up animation-delay-800">
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all">
                <div className="text-4xl font-bold text-purple-400 mb-2">10K+</div>
                <div className="text-gray-400">Active Users</div>
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all">
                <div className="text-4xl font-bold text-blue-400 mb-2">50K+</div>
                <div className="text-gray-400">Videos Created</div>
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all">
                <div className="text-4xl font-bold text-pink-400 mb-2">99%</div>
                <div className="text-gray-400">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Mọi thứ bạn cần để tạo video chuyên nghiệp
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '🎨',
                title: 'AI-Powered Generation',
                description: 'Tạo video chất lượng cao với AI thông minh, tự động hóa quy trình sáng tạo.',
                color: 'from-purple-500 to-pink-500'
              },
              {
                icon: '⚡',
                title: 'Lightning Fast',
                description: 'Xử lý nhanh chóng, tạo video trong vài phút thay vì hàng giờ.',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: '🎬',
                title: 'Professional Quality',
                description: 'Output chất lượng 4K, hỗ trợ nhiều format và resolution khác nhau.',
                color: 'from-indigo-500 to-purple-500'
              },
              {
                icon: '🔒',
                title: 'Secure & Licensed',
                description: 'Hệ thống license an toàn, bảo vệ sản phẩm và người dùng của bạn.',
                color: 'from-green-500 to-emerald-500'
              },
              {
                icon: '🎯',
                title: 'Easy to Use',
                description: 'Giao diện thân thiện, dễ sử dụng cho cả người mới bắt đầu.',
                color: 'from-orange-500 to-red-500'
              },
              {
                icon: '🚀',
                title: 'Regular Updates',
                description: 'Cập nhật thường xuyên với tính năng mới và cải tiến hiệu suất.',
                color: 'from-pink-500 to-rose-500'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 hover:border-white/30 transition-all transform hover:scale-105 hover:bg-white/10"
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-3xl mb-6 transform group-hover:rotate-12 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity -z-10`}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section id="download" className="py-32 relative">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-blue-600/20 backdrop-blur-md rounded-3xl p-12 border border-white/20 relative overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
              
              <div className="relative z-10 text-center">
                <div className="text-6xl mb-6">📦</div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Ready to Get Started?
                </h2>
                <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                  Tải xuống VeoProGen ngay bây giờ và bắt đầu tạo những video tuyệt vời. 
                  Hoàn toàn miễn phí với bản trial 1 ngày!
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <a
                    href={downloadLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative px-10 py-5 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-xl font-bold text-xl transform transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-purple-500/50"
                  >
                    <span className="relative z-10 flex items-center space-x-3">
                      <span>⬇️</span>
                      <span>Download VeoProGen</span>
                      <span className="group-hover:translate-x-2 transition-transform">→</span>
                    </span>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-0 group-hover:opacity-100 blur transition-opacity"></div>
                  </a>
                </div>

                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <div className="text-2xl mb-2">✅</div>
                    <div className="font-semibold mb-1">Free Trial</div>
                    <div className="text-sm text-gray-400">1 ngày miễn phí</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <div className="text-2xl mb-2">🔒</div>
                    <div className="font-semibold mb-1">Secure</div>
                    <div className="text-sm text-gray-400">An toàn & bảo mật</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <div className="text-2xl mb-2">⚡</div>
                    <div className="font-semibold mb-1">Fast Setup</div>
                    <div className="text-sm text-gray-400">Cài đặt nhanh chóng</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 relative">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                About VeoProGen
              </h2>
              <p className="text-xl text-gray-400">
                Công cụ tạo video thế hệ mới
              </p>
            </div>

            <div className="space-y-8">
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10">
                <h3 className="text-2xl font-bold mb-4 flex items-center space-x-2">
                  <span>🎯</span>
                  <span>Mission</span>
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  VeoProGen được tạo ra với mục tiêu mang đến công cụ tạo video chuyên nghiệp, 
                  dễ sử dụng và mạnh mẽ cho mọi người. Chúng tôi tin rằng mọi người đều có thể 
                  tạo ra nội dung video chất lượng cao mà không cần kỹ năng phức tạp.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10">
                <h3 className="text-2xl font-bold mb-4 flex items-center space-x-2">
                  <span>💡</span>
                  <span>Why Choose Us?</span>
                </h3>
                <ul className="space-y-4 text-gray-300">
                  <li className="flex items-start space-x-3">
                    <span className="text-purple-400 mt-1">✓</span>
                    <span>Công nghệ AI tiên tiến nhất trong ngành</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-purple-400 mt-1">✓</span>
                    <span>Hỗ trợ khách hàng 24/7</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-purple-400 mt-1">✓</span>
                    <span>Cập nhật thường xuyên với tính năng mới</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-purple-400 mt-1">✓</span>
                    <span>Giá cả hợp lý, phù hợp mọi đối tượng</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-white/10 bg-black/20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🎬</span>
                </div>
                <span className="text-xl font-bold">VeoProGen</span>
              </div>
              <p className="text-gray-400 text-sm">
                Professional Video Generation Tool powered by AI
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#download" className="hover:text-white transition-colors">Download</a></li>
                <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/login" className="hover:text-white transition-colors">Admin Login</Link></li>
                <li><a href="/api/health" className="hover:text-white transition-colors">API Status</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>License Agreement</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 text-center text-gray-400 text-sm">
            <p>© 2025 VeoProGen. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
