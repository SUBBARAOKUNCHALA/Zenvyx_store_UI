import API from "./adminApi";

export const getSupportDashboardApi = () =>
    API.get("/adminRepply/support/dashboard");

export const getAllSupportTicketsApi = (params = {}) =>
    API.get("/adminRepply/support", {
        params,
    });

export const getAdminTicketApi = (id) =>
    API.get(`/adminRepply/support/${id}`);

export const adminReplyTicketApi = (id, data) =>
    API.post(`/adminRepply/support/${id}/reply`, data);

export const updateTicketStatusApi = (id, status) =>
    API.put(`/adminRepply/support/${id}/status`, {
        status,
    });

export const deleteSupportTicketApi = (id) =>
    API.delete(`/adminRepply/support/${id}`);