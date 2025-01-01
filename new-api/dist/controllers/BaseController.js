"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseController = void 0;
class BaseController {
    sendSuccess(res, data, status = 200) {
        res.status(status).json({
            success: true,
            data: data
        });
    }
    sendError(res, error, status = 500) {
        res.status(status).json({
            success: false,
            error: error.message
        });
    }
}
exports.BaseController = BaseController;
