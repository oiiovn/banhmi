'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="vi">
      <body>
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Lỗi nghiêm trọng!</h2>
            <p className="text-gray-600 mb-6">
              {error.message || 'Đã xảy ra lỗi nghiêm trọng trong ứng dụng'}
            </p>
            <button
              onClick={reset}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
            >
              Thử lại
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
