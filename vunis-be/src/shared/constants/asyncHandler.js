/**
 * @file asyncHandler.js
 * @description Wrapper giúp bắt lỗi bất đồng bộ (async/await) trong Express Controller
 * và chuyển lỗi tự động về errorHandler middleware mà không cần viết try-catch lặp lại.
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
