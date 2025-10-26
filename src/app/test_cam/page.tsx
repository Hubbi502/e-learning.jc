// app/test_cam/page.tsx
import Camera from '../../components/camera/Camera';

export default function TestCameraPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4 drop-shadow-lg">
            📸 Camera Test App
          </h1>
          <p className="text-lg sm:text-xl text-white/90 drop-shadow-md">
            Test fitur kamera dengan dukungan front & back camera
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transform hover:scale-[1.01] transition-transform duration-300">
          {/* Camera Section */}
          <div className="p-6 sm:p-8 lg:p-10">
            <Camera />
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200"></div>

        </div>

        {/* Footer */}
        <footer className="text-center mt-8 text-white/80 text-sm">
          <p className="drop-shadow-md">
            © 2025 E-Learning JC • Built with ❤️ using Next.js & Tailwind CSS
          </p>
        </footer>
      </div>
    </main>
  );
}

