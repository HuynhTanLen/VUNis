/**
 * @file user.dto.js
 * @description Data Transfer Objects cho module Users.
 */
class UpdateProfileDTO {
    constructor(body) {
        this.name = body.name ? body.name.trim() : undefined;
        this.phone = body.phone ? body.phone.trim() : undefined;
        this.avatar = body.avatar ? body.avatar.trim() : undefined;
        this.jobTitle = body.jobTitle ? body.jobTitle.trim() : undefined;
        this.department = body.department ? body.department.trim() : undefined;
        this.company = body.company ? body.company.trim() : undefined;
    }

    validate() {
        if (this.name !== undefined && this.name.length === 0) {
            throw new Error('Tên người dùng không được để trống');
        }
        return this;
    }
}

class ChangeRoleDTO {
    constructor(body) {
        this.role = body.role ? body.role.trim() : undefined;
    }

    validate(validRoles) {
        if (!this.role) throw new Error('Vai trò mới là bắt buộc');
        if (!validRoles.includes(this.role)) {
            throw new Error(`Vai trò không hợp lệ. Danh sách hợp lệ: ${validRoles.join(', ')}`);
        }
        return this;
    }
}

class ToggleBlockDTO {
    constructor(body) {
        this.isBlocked = typeof body.isBlocked === 'boolean' ? body.isBlocked : undefined;
    }

    validate() {
        if (this.isBlocked === undefined) {
            throw new Error('Giá trị isBlocked (true/false) là bắt buộc');
        }
        return this;
    }
}

module.exports = { UpdateProfileDTO, ChangeRoleDTO, ToggleBlockDTO };

