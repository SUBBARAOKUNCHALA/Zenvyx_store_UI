import API from "./api";

export const createSupportTicketApi = (formData) =>
    API.post("/support/create", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

export const getMyTicketsApi = () =>
    API.get("/support/my-tickets");

export const getTicketApi = (id) =>
    API.get(`/support/${id}`);

// export const replyTicketApi = (id, formData) =>
//     API.post(`/support/${id}/reply`, formData, {
//         headers: {
//             "Content-Type": "multipart/form-data",
//         },
//     });

export const replyTicketApi = (id, data) =>
    API.post(`/support/${id}/reply`, data);