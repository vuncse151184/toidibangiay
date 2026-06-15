import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Chính sách bảo mật | Tôi đi bán giày",
  description: "Chính sách bảo mật và quyền riêng tư của Tôi đi bán giày",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="text-xs text-white/40 hover:text-white/70 tracking-[0.2em] uppercase transition-colors mb-10 inline-block"
        >
          ← Về trang chủ
        </Link>

        <h1 className="text-3xl font-bold mb-2">Chính sách bảo mật</h1>
        <p className="text-white/40 text-sm mb-12">Cập nhật lần cuối: tháng 6 năm 2025</p>

        <div className="space-y-10 text-white/70 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Thông tin chúng tôi thu thập</h2>
            <p>
              Khi bạn đăng ký tài khoản hoặc đăng nhập qua mạng xã hội (Google, Facebook), chúng tôi
              thu thập các thông tin sau: họ tên, địa chỉ email. Nếu bạn thực hiện đơn hàng, chúng
              tôi cũng lưu trữ địa chỉ giao hàng và lịch sử mua hàng.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. Mục đích sử dụng</h2>
            <ul className="list-disc list-inside space-y-1.5">
              <li>Xác thực và quản lý tài khoản người dùng</li>
              <li>Xử lý và theo dõi đơn hàng</li>
              <li>Gửi thông báo liên quan đến đơn hàng</li>
              <li>Cải thiện trải nghiệm mua sắm</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. Chia sẻ thông tin</h2>
            <p>
              Chúng tôi không bán, cho thuê hoặc chia sẻ thông tin cá nhân của bạn với bên thứ ba
              vì mục đích thương mại. Thông tin chỉ được chia sẻ với các đối tác vận chuyển để thực
              hiện giao hàng.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. Đăng nhập qua mạng xã hội</h2>
            <p>
              Khi bạn chọn đăng nhập qua Facebook hoặc Google, chúng tôi chỉ nhận email và tên hiển
              thị từ nhà cung cấp. Chúng tôi không truy cập danh sách bạn bè, bài đăng hoặc bất kỳ
              thông tin nào khác ngoài phạm vi bạn đã cấp phép.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Bảo mật dữ liệu</h2>
            <p>
              Dữ liệu được lưu trữ trên hạ tầng bảo mật. Mật khẩu được mã hóa bằng bcrypt. Chúng
              tôi sử dụng HTTPS cho toàn bộ kết nối.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. Quyền của bạn</h2>
            <p>
              Bạn có quyền yêu cầu xem, chỉnh sửa hoặc xóa dữ liệu cá nhân. Để yêu cầu xóa dữ
              liệu, vui lòng truy cập{" "}
              <Link href="/data-deletion" className="text-red-400 hover:text-red-300">
                trang xóa dữ liệu
              </Link>{" "}
              hoặc liên hệ qua email bên dưới.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Liên hệ</h2>
            <p>
              Mọi thắc mắc về chính sách bảo mật, vui lòng liên hệ:{" "}
              <a href="mailto:vu12ace3@gmail.com" className="text-red-400 hover:text-red-300">
                vu12ace3@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
