import _ from 'lodash';
import api from '../src/app/modules/AxiosInstance'

const cvApi = {};
const jobApi = {};
const mediaApi = {};
const userApi = {};
const studentApi = {};
const companyApi = {};
const companyTypeApi = {};
const categoryApi = {};
const levelApi = {};
const addressApi = {};

const applicationApi = {};
const notificationApi = {};

cvApi.getCV = async (studentId) => {
    try {
        const data = await api.get(`/api/student/${studentId}`);
        return _.get(data, 'data');
    } catch (error) {
        alert(error?.message || 'Có lỗi xảy ra khi lấy cv người dùng');
        return null;
    }
}

jobApi.getJobById = async (jobId) => {
    try {
        const data = await api.get(`/api/jobs/${jobId}`);
        return _.get(data, 'data');
    } catch (error) {
        alert(error?.message || 'Có lỗi xảy ra khi lấy job');
        throw error;
    }
}

jobApi.findAllJob = async (params) => {
    try {
        params = buildSearchParams(params, {});
        const data = await api.get(`/api/jobs`, { params });
        return _.get(data, 'data');
    } catch (error) {
        alert(error?.message || 'Có lỗi xảy ra khi lấy danh sách job');
        throw error;
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

notificationApi.getNotifications = async (params) => {
    const res = await api.get(`/api/notifications`, { params });
    return _.get(res, 'data');
}

notificationApi.markAsRead = async (body) => {
    const res = await api.put(`/api/notifications/mark-as-read`, body);
    return _.get(res, 'data');
}

notificationApi.markAllAsRead = async (body) => {
    const res = await api.put(`/api/notifications/mark-all-as-read`, body);
    return _.get(res, 'data');
}

userApi.getUsers = async (filters = {}, options = {}) => {
  const params = buildSearchParams(filters, options);
  const res = await api.get(`/api/users`, { params });
  return _.get(res, "data");
};

userApi.updateUser = async (userId, data) => {
  const res = await api.put(`/api/users/${userId}`, data);
  return _.get(res, "data");
};

userApi.createUser = async (data) => {
  const res = await api.post(`/api/users`, data);
  return _.get(res, "data");
};

userApi.deleteUser = async (userId) => {
  const res = await api.delete(`/api/users/${userId}`);
  return _.get(res, "data");
};

userApi.activeUser = async (userId) => {
  const res = await api.put(`/api/users/${userId}/active`);
  return _.get(res, "data");
};

companyApi.getCompanies = async (filters = {}, options = {}) => {
  const params = buildSearchParams(filters, options);
  const res = await api.get(`/api/companies`, { params });
  return _.get(res, "data");
};

companyApi.adminUpdate = async (companyId, data) => {
  const res = await api.put(`/api/companies/${companyId}/admin`, data);
  return _.get(res, "data");
};

companyTypeApi.getTypes = async (filters = {}, options = {}) => {
  const params = buildSearchParams(filters, options);
  const res = await api.get(`/api/company_types`, { params });
  return _.get(res, "data");
};

categoryApi.getCategories = async (filters = {}, options = {}) => {
  const params = buildSearchParams(filters, options);
  const res = await api.get(`/api/categories`, { params });
  return _.get(res, "data");
};

levelApi.getLevels = async (filters = {}, options = {}) => {
  const params = buildSearchParams(filters, options);
  const res = await api.get(`/api/levels`, { params });
  return _.get(res, "data");
};

studentApi.getStudent = async (studentId) => {
  const res = await api.get(`/api/students/${studentId}`);
  return _.get(res, "data");
};

studentApi.updateStudent = async (studentId, data) => {
  const res = await api.put(`/api/students/${studentId}`, data);
  return _.get(res, "data");
};

addressApi.getProvinces = async () => {
  const res = await api.get(`/api/address/provinces`);
  return _.get(res, "data");
};

export { cvApi, mediaApi, applicationApi, notificationApi, jobApi, userApi, companyApi, companyTypeApi, categoryApi, levelApi, studentApi, addressApi };

// utils/buildSearchParams.js
export const buildSearchParams = (filters = {}, options = {}) => {
  const { page = 1, pageSize = 20, sortBy, sortOrder = "asc" } = options;

  const params = new URLSearchParams();

  // Pagination
  params.set("page", page);
  params.set("pageSize", pageSize);

  // Sorting
  if (sortBy) {
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);
  }

  // Filters — bỏ qua giá trị rỗng/null/undefined
  Object.entries(filters).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") return;

    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v)); // ?role=admin&role=user
    } else {
      params.set(key, value);
    }
  });

  return params;
};

export const parseErrorMessage = (response) => {
  const message = response?.message || "";

  const errors = message.split("; ");

  if (!errors.length) return "";

  // lấy lỗi đầu tiên
  const firstError = errors[0];

  // remove [field]
  return firstError.replace(/\[.*?\]\s*/, "");
};