const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // 发送验证邮件
  async sendVerificationEmail(to, token) {
    const verificationUrl = `${process.env.FRONTEND_URL}/#/verify-email?token=${token}`;
    
    const mailOptions = {
      from: `"影刃AI" <${process.env.SMTP_USER}>`,
      to,
      subject: '验证你的邮箱 - 影刃AI',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0ea5e9;">欢迎加入影刃AI！</h2>
          <p>感谢你注册影刃AI账户。请点击下面的按钮验证你的邮箱地址：</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background: #0ea5e9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              验证邮箱
            </a>
          </div>
          <p>或者复制以下链接到浏览器：</p>
          <p style="background: #f3f4f6; padding: 10px; border-radius: 5px; word-break: break-all;">${verificationUrl}</p>
          <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
            此链接将在24小时后过期。如果你没有注册影刃AI，请忽略此邮件。
          </p>
        </div>
      `
    };

    return this.transporter.sendMail(mailOptions);
  }

  // 发送密码重置邮件
  async sendPasswordResetEmail(to, token) {
    const resetUrl = `${process.env.FRONTEND_URL}/#/reset-password?token=${token}`;
    
    const mailOptions = {
      from: `"影刃AI" <${process.env.SMTP_USER}>`,
      to,
      subject: '重置密码 - 影刃AI',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0ea5e9;">重置密码</h2>
          <p>你请求重置影刃AI账户的密码。请点击下面的按钮重置密码：</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: #0ea5e9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              重置密码
            </a>
          </div>
          <p>或者复制以下链接到浏览器：</p>
          <p style="background: #f3f4f6; padding: 10px; border-radius: 5px; word-break: break-all;">${resetUrl}</p>
          <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
            此链接将在1小时后过期。如果你没有请求重置密码，请忽略此邮件。
          </p>
        </div>
      `
    };

    return this.transporter.sendMail(mailOptions);
  }

  // 发送欢迎邮件
  async sendWelcomeEmail(to, username) {
    const mailOptions = {
      from: `"影刃AI" <${process.env.SMTP_USER}>`,
      to,
      subject: '欢迎来到影刃AI！',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0ea5e9;">欢迎，${username}！</h2>
          <p>感谢你加入影刃AI，开始你的AI短剧创作之旅！</p>
          <div style="background: #f0f9ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="margin-top: 0;">你可以：</h3>
            <ul style="padding-left: 20px;">
              <li>🎬 使用AI生成80集完整短剧剧本</li>
              <li>🎨 获取Midjourney视觉资产生成提示词</li>
              <li>💰 获得专业付费卡点设计</li>
              <li>🤖 选择多种AI模型进行创作</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}" 
               style="background: #0ea5e9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              开始创作
            </a>
          </div>
          <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
            如果你有任何问题，请随时联系我们的客服团队。
          </p>
        </div>
      `
    };

    return this.transporter.sendMail(mailOptions);
  }

  // 发送支付成功邮件
  async sendPaymentSuccessEmail(to, plan, amount) {
    const mailOptions = {
      from: `"影刃AI" <${process.env.SMTP_USER}>`,
      to,
      subject: '支付成功 - 影刃AI',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0ea5e9;">支付成功！</h2>
          <p>感谢你升级影刃AI会员。</p>
          <div style="background: #f0fdf4; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="margin-top: 0;">订单详情</h3>
            <p><strong>会员方案：</strong>${plan}</p>
            <p><strong>支付金额：</strong>¥${amount}</p>
            <p><strong>支付时间：</strong>${new Date().toLocaleString('zh-CN')}</p>
          </div>
          <p>你现在可以享受所有会员功能了！</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/#/create" 
               style="background: #0ea5e9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              开始创作
            </a>
          </div>
        </div>
      `
    };

    return this.transporter.sendMail(mailOptions);
  }

  // 发送剧本生成完成邮件
  async sendScriptCompleteEmail(to, scriptTitle, scriptId) {
    const scriptUrl = `${process.env.FRONTEND_URL}/#/script/${scriptId}`;
    
    const mailOptions = {
      from: `"影刃AI" <${process.env.SMTP_USER}>`,
      to,
      subject: '剧本生成完成 - 影刃AI',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0ea5e9;">剧本生成完成！</h2>
          <p>你的短剧剧本《${scriptTitle}》已经生成完毕。</p>
          <div style="background: #f0f9ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="margin-top: 0;">剧本包含：</h3>
            <ul style="padding-left: 20px;">
              <li>📖 80集完整剧本</li>
              <li>🎭 详细角色设定</li>
              <li>🎨 Midjourney视觉资产生成提示词</li>
              <li>💰 专业付费卡点设计</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${scriptUrl}" 
               style="background: #0ea5e9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              查看剧本
            </a>
          </div>
        </div>
      `
    };

    return this.transporter.sendMail(mailOptions);
  }
}

module.exports = new EmailService();