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
    <div className="min-h-screen text-white overflow-x-hidden relative">
      {/* Space Background with Stars */}
      <div className="fixed inset-0 z-0 space-background-enhanced">
        <div className="stars"></div>
        <div className="stars2"></div>
        <div className="stars3"></div>
        <div className="nebula"></div>
        <div className="nebula2"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/30 backdrop-blur-xl border-b border-white/10 shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                <span className="text-2xl">🎬</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                VeoProGen
              </span>
            </div>
            <div className="flex items-center space-x-8">
              <a href="#features" className="hover:text-purple-300 transition-all duration-300 hover:scale-110 relative group">
                <span>Features</span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 group-hover:w-full transition-all duration-300"></span>
              </a>
              <a href="#download" className="hover:text-purple-300 transition-all duration-300 hover:scale-110 relative group">
                <span>Download</span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 group-hover:w-full transition-all duration-300"></span>
              </a>
              <a href="#about" className="hover:text-purple-300 transition-all duration-300 hover:scale-110 relative group">
                <span>About</span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 group-hover:w-full transition-all duration-300"></span>
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 pb-32 overflow-hidden">
        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 10}s`
              }}
            ></div>
          ))}
        </div>

        {/* Animated Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-screen filter blur-3xl animate-orb-1"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-screen filter blur-3xl animate-orb-2"></div>
          <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-pink-500/20 rounded-full mix-blend-screen filter blur-3xl animate-orb-3"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-6xl mx-auto">
            {/* Badge */}
            <div className="mb-6 animate-fade-in-up">
              <span className="inline-block px-6 py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-md border border-purple-400/30 rounded-full text-purple-300 text-sm font-semibold shadow-lg">
                ✨ AI-Powered Video Generation
              </span>
            </div>

            {/* Main Title */}
            <div className="mb-8 animate-fade-in-up animation-delay-200">
              <h1 className="text-8xl md:text-9xl font-black mb-6 leading-tight">
                <span className="block bg-gradient-to-r from-purple-400 via-pink-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent animate-gradient-text drop-shadow-2xl">
                  VeoProGen
                </span>
              </h1>
              <div className="w-32 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent mx-auto mb-6"></div>
              <p className="text-3xl md:text-4xl font-light text-gray-200 mb-6 leading-relaxed">
                Công Cụ Tạo Video Chuyên Nghiệp
              </p>
              <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                Khám phá sức mạnh của AI trong việc tạo video. VeoProGen mang đến cho bạn công cụ mạnh mẽ nhất 
                để biến ý tưởng thành những video chất lượng cao, chuyên nghiệp chỉ trong vài phút.
              </p>
            </div>

            {/* Key Points */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12 animate-fade-in-up animation-delay-400">
              {[
                { icon: '🚀', text: 'Tốc Độ Cực Nhanh' },
                { icon: '🎨', text: 'Chất Lượng 4K' },
                { icon: '🔒', text: 'Bảo Mật Tuyệt Đối' }
              ].map((point, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/10 hover:border-purple-400/50 transition-all duration-300 transform hover:scale-105">
                  <div className="text-4xl mb-3">{point.icon}</div>
                  <div className="text-lg font-semibold text-gray-300">{point.text}</div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-12 animate-fade-in-up animation-delay-600">
              <a
                href={downloadLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative px-10 py-5 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl font-bold text-xl transform transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-purple-500/50 overflow-hidden"
              >
                <span className="relative z-10 flex items-center space-x-3">
                  <span className="text-2xl">⬇️</span>
                  <span>Tải Xuống Ngay</span>
                  <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"></div>
                <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              </a>
              
              <a
                href="#features"
                className="px-10 py-5 bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-2xl font-bold text-xl hover:bg-white/20 hover:border-purple-400/50 transition-all duration-300 transform hover:scale-105"
              >
                Khám Phá Tính Năng
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 animate-fade-in-up animation-delay-800">
              {[
                { number: '10K+', label: 'Người Dùng', color: 'from-purple-400 to-pink-400' },
                { number: '50K+', label: 'Video Đã Tạo', color: 'from-blue-400 to-cyan-400' },
                { number: '99%', label: 'Hài Lòng', color: 'from-pink-400 to-rose-400' }
              ].map((stat, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 hover:bg-white/10 hover:border-purple-400/50 transition-all duration-300 transform hover:scale-105 hover:-translate-y-2">
                  <div className={`text-5xl font-black mb-3 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    {stat.number}
                  </div>
                  <div className="text-gray-400 text-lg">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="flex flex-col items-center space-y-2">
            <span className="text-sm text-gray-400">Scroll để khám phá</span>
            <div className="w-6 h-10 border-2 border-purple-400/50 rounded-full flex justify-center">
              <div className="w-1.5 h-3 bg-gradient-to-b from-purple-400 to-blue-400 rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <div className="inline-block mb-4">
              <span className="px-6 py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-md border border-purple-400/30 rounded-full text-purple-300 text-sm font-semibold">
                TÍNH NĂNG NỔI BẬT
              </span>
            </div>
            <h2 className="text-6xl md:text-7xl font-black mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Sức Mạnh Của VeoProGen
            </h2>
            <p className="text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Mọi thứ bạn cần để tạo ra những video chuyên nghiệp, ấn tượng
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '🤖',
                title: 'AI Thông Minh',
                description: 'Công nghệ AI tiên tiến nhất, tự động hóa toàn bộ quy trình tạo video từ ý tưởng đến sản phẩm cuối cùng. Chỉ cần mô tả, AI sẽ làm phần còn lại.',
                color: 'from-purple-500 to-pink-500',
                features: ['Text-to-Video', 'Auto Editing', 'Smart Templates']
              },
              {
                icon: '⚡',
                title: 'Tốc Độ Cực Nhanh',
                description: 'Xử lý video với tốc độ ánh sáng. Tạo video 4K trong vài phút thay vì hàng giờ. Tối ưu hóa GPU để đạt hiệu suất tối đa.',
                color: 'from-blue-500 to-cyan-500',
                features: ['GPU Accelerated', 'Batch Processing', 'Cloud Rendering']
              },
              {
                icon: '🎬',
                title: 'Chất Lượng Chuyên Nghiệp',
                description: 'Output chất lượng 4K, 8K với độ phân giải cao. Hỗ trợ đầy đủ các format phổ biến: MP4, MOV, AVI, và nhiều codec khác.',
                color: 'from-indigo-500 to-purple-500',
                features: ['4K/8K Support', 'Multiple Formats', 'HDR Support']
              },
              {
                icon: '🔒',
                title: 'Bảo Mật Tuyệt Đối',
                description: 'Hệ thống license an toàn với mã hóa RSA-2048. Bảo vệ sản phẩm và dữ liệu của bạn một cách tuyệt đối. Tuân thủ các tiêu chuẩn bảo mật quốc tế.',
                color: 'from-green-500 to-emerald-500',
                features: ['RSA Encryption', 'Device Tracking', 'Secure License']
              },
              {
                icon: '🎯',
                title: 'Dễ Sử Dụng',
                description: 'Giao diện trực quan, thân thiện với người dùng. Không cần kỹ năng phức tạp, ai cũng có thể tạo video chuyên nghiệp chỉ sau vài phút làm quen.',
                color: 'from-orange-500 to-red-500',
                features: ['Intuitive UI', 'Drag & Drop', 'One-Click Export']
              },
              {
                icon: '🚀',
                title: 'Cập Nhật Thường Xuyên',
                description: 'Luôn được cập nhật với các tính năng mới nhất, cải tiến hiệu suất và sửa lỗi. Đội ngũ phát triển luôn lắng nghe phản hồi từ người dùng.',
                color: 'from-pink-500 to-rose-500',
                features: ['Monthly Updates', 'New Features', 'Bug Fixes']
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 hover:border-purple-400/50 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2"
              >
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-4xl mb-6 transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed mb-6">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.features.map((f, i) => (
                    <li key={i} className="flex items-center text-sm text-gray-500">
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2"></span>
                      {f}
                    </li>
                  ))}
                </ul>
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 -z-10`}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section id="download" className="py-32 relative">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="relative bg-gradient-to-br from-purple-600/30 via-pink-600/30 to-blue-600/30 backdrop-blur-xl rounded-3xl p-12 md:p-16 border border-white/20 overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
              
              <div className="relative z-10 text-center">
                <div className="text-7xl mb-8 animate-bounce">📦</div>
                <h2 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  Sẵn Sàng Bắt Đầu?
                </h2>
                <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto leading-relaxed">
                  Tải xuống VeoProGen ngay bây giờ và bắt đầu tạo những video tuyệt vời
                </p>
                <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
                  Hoàn toàn miễn phí với bản trial 1 ngày. Không cần thẻ tín dụng. Bắt đầu ngay!
                </p>
                
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
                  <a
                    href={downloadLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative px-12 py-6 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl font-black text-2xl transform transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-purple-500/50 overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center space-x-4">
                      <span className="text-3xl">⬇️</span>
                      <span>Tải VeoProGen</span>
                      <span className="group-hover:translate-x-3 transition-transform duration-300">→</span>
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-300"></div>
                    <div className="absolute inset-0 bg-white/30 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                  </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { icon: '✅', title: 'Miễn Phí Trial', desc: '1 ngày dùng thử' },
                    { icon: '🔒', title: 'An Toàn', desc: 'Bảo mật tuyệt đối' },
                    { icon: '⚡', title: 'Cài Đặt Nhanh', desc: 'Chỉ vài phút' }
                  ].map((item, i) => (
                    <div key={i} className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all">
                      <div className="text-3xl mb-3">{item.icon}</div>
                      <div className="font-bold text-lg mb-1">{item.title}</div>
                      <div className="text-sm text-gray-400">{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 relative">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-block mb-4">
                <span className="px-6 py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-md border border-purple-400/30 rounded-full text-purple-300 text-sm font-semibold">
                  VỀ CHÚNG TÔI
                </span>
              </div>
              <h2 className="text-6xl md:text-7xl font-black mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                VeoProGen
              </h2>
              <p className="text-2xl text-gray-400">
                Công cụ tạo video thế hệ mới
              </p>
            </div>

            <div className="space-y-8">
              <div className="bg-white/5 backdrop-blur-md rounded-3xl p-10 border border-white/10 hover:border-purple-400/50 transition-all">
                <h3 className="text-3xl font-bold mb-6 flex items-center space-x-3">
                  <span className="text-4xl">🎯</span>
                  <span>Sứ Mệnh</span>
                </h3>
                <p className="text-gray-300 leading-relaxed text-lg">
                  VeoProGen được tạo ra với mục tiêu mang đến công cụ tạo video chuyên nghiệp, 
                  dễ sử dụng và mạnh mẽ cho mọi người. Chúng tôi tin rằng mọi người đều có thể 
                  tạo ra nội dung video chất lượng cao mà không cần kỹ năng phức tạp hay kinh nghiệm 
                  chuyên sâu. Với sức mạnh của AI, chúng tôi đang cách mạng hóa cách mọi người tạo video.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-md rounded-3xl p-10 border border-white/10 hover:border-purple-400/50 transition-all">
                <h3 className="text-3xl font-bold mb-6 flex items-center space-x-3">
                  <span className="text-4xl">💡</span>
                  <span>Tại Sao Chọn VeoProGen?</span>
                </h3>
                <ul className="space-y-4 text-gray-300 text-lg">
                  {[
                    'Công nghệ AI tiên tiến nhất trong ngành, được cập nhật liên tục',
                    'Hỗ trợ khách hàng 24/7, luôn sẵn sàng giải đáp mọi thắc mắc',
                    'Cập nhật thường xuyên với tính năng mới và cải tiến hiệu suất',
                    'Giá cả hợp lý, phù hợp với mọi đối tượng từ cá nhân đến doanh nghiệp',
                    'Cộng đồng người dùng lớn, chia sẻ kinh nghiệm và templates'
                  ].map((item, i) => (
                    <li key={i} className="flex items-start space-x-4">
                      <span className="text-purple-400 mt-1 text-xl">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-white/10 bg-black/30 backdrop-blur-xl relative">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">🎬</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  VeoProGen
                </span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Professional Video Generation Tool powered by AI. 
                Tạo video chuyên nghiệp chỉ trong vài phút.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-6 text-lg">Sản Phẩm</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Tính Năng</a></li>
                <li><a href="#download" className="hover:text-white transition-colors">Tải Xuống</a></li>
                <li><a href="#about" className="hover:text-white transition-colors">Giới Thiệu</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-6 text-lg">Hỗ Trợ</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><Link href="/login" className="hover:text-white transition-colors">Đăng Nhập Admin</Link></li>
                <li><a href="/api/health" className="hover:text-white transition-colors">Trạng Thái API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Hướng Dẫn</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-6 text-lg">Pháp Lý</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li>Chính Sách Bảo Mật</li>
                <li>Điều Khoản Sử Dụng</li>
                <li>Thỏa Thuận License</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 text-center text-gray-400 text-sm">
            <p>© 2025 VeoProGen. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
      </footer>
    </div>
  );
}
