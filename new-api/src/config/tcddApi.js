"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tcddApi = void 0;
const axios_1 = __importDefault(require("axios"));
const tcddApi = {
    searchTickets: async (params) => {
        return axios_1.default.get('/api/v1/tcdd/search', { params });
    },
};
exports.tcddApi = tcddApi;
