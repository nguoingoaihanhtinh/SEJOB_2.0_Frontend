import _ from 'lodash';
import api from '../src/app/modules/AxiosInstance'

const cvApi = {};
const mediaApi = {};
const applicationApi = {};

cvApi.getCV = async (studentId) => {
    try {
        const data = await api.get(`/api/student/${studentId}`);
        return _.get(data, 'data');
    } catch (error) {
        alert(error?.message || 'Có lỗi xảy ra khi lấy cv người dùng');
        return null;
    }
}

mediaApi.upload = async (formData) => {
    try {
        const data = await api.post(`/api/media/upload`, formData);
        return _.get(data, 'data');
    } catch (error) {
        alert(error?.message || 'Có lỗi xảy ra khi upload.');
        return null;
    }
}

applicationApi.create = async (data) => {
    const res = await api.post(`/api/applications`, data);
    return _.get(res, 'data');
}

applicationApi.getOneByJobId = async (jobId) => {
    const res = await api.get(`/api/applications/job/${jobId}`);
    return _.get(res, 'data');
}

export { cvApi, mediaApi, applicationApi };