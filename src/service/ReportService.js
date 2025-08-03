import axiosInstance from "./axiosInstance";

const REPORT_API_URL = '/api/admin/reports';

export const REPORT_TYPES = {
    USER: 'USER',
    POST: 'POST',
    COMMENT: 'COMMENT',
    GROUP: 'GROUP'
};

export const REPORT_STATUS = {
    PENDING: 'PENDING',
    RESOLVED: 'RESOLVED'
};

const ReportService = {
    getAllReports: (params) => {
        return axiosInstance.get(REPORT_API_URL, { 
            params: {
                status: params?.status,
                type: params?.type,
                page: params?.page,
                size: params?.size,
                sort: params?.sort,
                userId: params?.userId,
            }
        });
    },

    resolveReport: (reportId, resolveAction) => {
        return axiosInstance.put(`${REPORT_API_URL}/${reportId}/resolve`, {
            action: resolveAction
        });
    }
};

export default ReportService;