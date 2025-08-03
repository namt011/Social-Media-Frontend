import axiosInstance from "../service/axiosInstance";

const REPORT_API_URL = '/api/reports';

export const REPORT_TYPES = {
    USER: 'USER',
    POST: 'POST',
    COMMENT: 'COMMENT',
    GROUP: 'GROUP'
};

const ReportServices = {
    createReport: (reportData) => {
        return axiosInstance.post(REPORT_API_URL, reportData);
    }
};
export default ReportServices;