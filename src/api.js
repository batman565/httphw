const API_URL = "http://localhost:7070";

export async function request(method, params = {}, data = null) {
  const url = new URL(API_URL);
  url.searchParams.set("method", method);
  for (const [key, value] of Object.entries(params)) {
    if (value != null) url.searchParams.set(key, value);
  }

  const options = {
    method: data ? "POST" : "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }

  if (response.status === 204) return null;
  return await response.json();
}

export const api = {
  getAllTickets: () => request("allTickets"),
  getTicketById: (id) => request("ticketById", { id }),
  createTicket: (ticket) => request("createTicket", {}, ticket),
  updateTicket: (id, data) => request("updateById", { id }, data),
  deleteTicket: (id) => request("deleteById", { id }),
};
