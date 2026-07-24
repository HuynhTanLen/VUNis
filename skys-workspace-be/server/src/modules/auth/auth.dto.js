/**
 * @file auth.dto.js
 * @description Data Transfer Object (DTO) cho module Auth.
 * DTO làm sạch và xác thực dữ liệu đầu vào TRƯỚC khi đưa vào service.
 * Giúp service không cần quan tâm dữ liệu có bị thiếu/sai format không.
 */
const { ValidationError } = require('../../shared/errors/AppError');

class RegisterDTO {
    constructor(body) {
        this.name = body.name ? body.name.trim() : '';
        this.email = body.email ? body.email.toLowerCase().trim() : '';
        this.password = body.password ? body.password : '';
    }

    validate() {
        if (!this.name || this.name.length < 2) {
            throw new ValidationError('Họ tên phải có ít nhất 2 ký tự');
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!this.email || !emailRegex.test(this.email)) {
            throw new ValidationError('Email không đúng định dạng (Ví dụ: user@example.com)');
        }
        if (!this.password || this.password.length < 6) {
            throw new ValidationError('Mật khẩu phải có ít nhất 6 ký tự');
        }
        return this;
    }
}

class LoginDTO {
    constructor(body) {
        this.email = body.name ? body.email.toLowerCase().trim() : '';
        this.password = body.password ? body.password : '';
    }

    validate() {
        if (!this.email) throw new ValidationError('Vui lòng nhập email');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.email)) throw new ValidationError('Email không đúng định dạng');
        if (!this.password) throw new ValidationError('Vui lòng nhập mật khẩu');
        return this;
    }
}

module.exports = { RegisterDTO, LoginDTO };
