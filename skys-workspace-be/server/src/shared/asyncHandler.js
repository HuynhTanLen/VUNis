/**
 * @file asyncHandler.js
 * @description Wrapper giúp bắt lỗi bất đồng bộ (async) trong Express Controller tự động,
 * loại bỏ việc lặp lại khối try-catch ở tất cả các hàm Controller.
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
