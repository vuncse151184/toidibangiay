import * as nodemailer from 'nodemailer';
import { Injectable, Logger } from '@nestjs/common';
import { env } from '../../../../shared/config/env';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    } as any);
  }

  async send(notification: { toEmail: string; type: string; payload: any }) {
    const { subject, html } = this.renderTemplate(notification.type, notification.payload ?? {});
    await this.transporter.sendMail({
      from: env.SMTP_FROM,
      to: notification.toEmail,
      subject,
      html,
    });
    this.logger.log(`Email sent to ${notification.toEmail} (${notification.type})`);
  }

  private renderTemplate(type: string, p: Record<string, any>): { subject: string; html: string } {
    const vnd = (n: number) => new Intl.NumberFormat('vi-VN').format(n || 0) + ' VNĐ';
    const base = '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">';
    const foot = '</div>';
    const templates: Record<string, { subject: string; html: string }> = {
      ORDER_CONFIRMED: {
        subject: `Xác nhận đơn hàng #${p.orderCode || ''}`,
        html: `${base}<h2 style="color:#333">Đơn hàng đã được xác nhận!</h2><p>Xin chào <strong>${p.customerName || 'Khách hàng'}</strong>,</p><p>Đơn hàng <strong>#${p.orderCode || ''}</strong> đã được xác nhận thành công.</p><p>Tổng cộng: <strong>${vnd(p.total)}</strong></p><p>Cảm ơn bạn đã mua hàng tại Shoe Store!</p>${foot}`,
      },
      ORDER_SHIPPED: {
        subject: `Đơn hàng #${p.orderCode || ''} đang được giao`,
        html: `${base}<h2>Đơn hàng đang trên đường!</h2><p>Mã vận đơn: <strong>${p.trackingNumber || 'Đang cập nhật'}</strong></p>${foot}`,
      },
      ORDER_DELIVERED: {
        subject: `Đơn hàng #${p.orderCode || ''} đã giao thành công`,
        html: `${base}<h2>Giao hàng thành công!</h2><p>Cảm ơn bạn đã tin tưởng Shoe Store.</p>${foot}`,
      },
      ORDER_CANCELLED: {
        subject: `Đơn hàng #${p.orderCode || ''} đã bị hủy`,
        html: `${base}<h2>Đơn hàng đã bị hủy</h2><p>Lý do: ${p.reason || 'Không có lý do'}</p>${foot}`,
      },
      PAYMENT_SUCCESS: {
        subject: 'Thanh toán thành công',
        html: `${base}<h2>Thanh toán thành công!</h2><p>Số tiền: <strong>${vnd(p.amount)}</strong></p>${foot}`,
      },
      PAYMENT_FAILED: {
        subject: 'Thanh toán thất bại',
        html: `${base}<h2>Thanh toán thất bại</h2><p>Vui lòng thử lại.</p>${foot}`,
      },
      WELCOME: {
        subject: 'Chào mừng đến với Shoe Store!',
        html: `${base}<h2>Xin chào ${p.name || 'bạn'}!</h2><p>Cảm ơn bạn đã đăng ký tài khoản tại Shoe Store.</p>${foot}`,
      },
      PASSWORD_RESET: {
        subject: 'Đặt lại mật khẩu',
        html: `${base}<h2>Đặt lại mật khẩu</h2><p><a href="${p.resetUrl}">Click đây để đặt lại mật khẩu</a></p>${foot}`,
      },
    };
    return templates[type] ?? { subject: 'Thông báo từ Shoe Store', html: `${base}<pre>${JSON.stringify(p, null, 2)}</pre>${foot}` };
  }
}
