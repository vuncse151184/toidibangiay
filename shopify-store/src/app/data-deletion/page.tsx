import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Yêu cầu xóa dữ liệu | Tôi đi bán giày",
  description: "Hướng dẫn yêu cầu xóa dữ liệu cá nhân",
}

export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="text-xs text-white/40 hover:text-white/70 tracking-[0.2em] uppercase transition-colors mb-10 inline-block"
        >
          ← Về trang chủ
        </Link>

        <h1 className="text-3xl font-bold mb-2">Yêu cầu xóa dữ liệu</h1>
        <p className="text-white/40 text-sm mb-12">Data Deletion Instructions</p>

        <div className="space-y-8 text-white/70 leading-relaxed">
          <p>
            Nếu bạn đã đăng nhập vào <strong className="text-white">Tôi đi bán giày</strong> qua
            Facebook và muốn xóa dữ liệu cá nhân của mình khỏi hệ thống, bạn có thể thực hiện theo
            một trong các cách sau:
          </p>

          <div
            className="rounded-2xl p-6 space-y-4"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <h2 className="text-base font-semibold text-white">Cách 1 — Tự xóa trong tài khoản</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Đăng nhập vào tài khoản tại trang web</li>
              <li>Vào phần <strong className="text-white">Cài đặt tài khoản</strong></li>
              <li>Chọn <strong className="text-white">Xóa tài khoản</strong></li>
              <li>Xác nhận yêu cầu — toàn bộ dữ liệu sẽ được xóa trong vòng 30 ngày</li>
            </ol>
          </div>

          <div
            className="rounded-2xl p-6 space-y-4"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <h2 className="text-base font-semibold text-white">Cách 2 — Liên hệ trực tiếp</h2>
            <p className="text-sm">
              Gửi email tới{" "}
              <a
                href="mailto:vu12ace3@gmail.com?subject=Yêu cầu xóa dữ liệu"
                className="text-red-400 hover:text-red-300"
              >
                vu12ace3@gmail.com
              </a>{" "}
              với tiêu đề <strong className="text-white">"Yêu cầu xóa dữ liệu"</strong> kèm địa
              chỉ email hoặc ID Facebook đã dùng để đăng nhập. Chúng tôi sẽ xử lý trong vòng{" "}
              <strong className="text-white">7 ngày làm việc</strong>.
            </p>
          </div>

          <div
            className="rounded-2xl p-5"
            style={{ background: "rgba(220,38,38,0.05)", border: "1px solid rgba(220,38,38,0.12)" }}
          >
            <p className="text-sm text-white/50">
              <strong className="text-white/80">Dữ liệu sẽ được xóa bao gồm:</strong> thông tin tài
              khoản (họ tên, email), lịch sử đăng nhập, và liên kết với tài khoản Facebook. Đơn
              hàng đã hoàn tất có thể được lưu lại để đáp ứng yêu cầu pháp lý.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
