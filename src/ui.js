import { api } from "./api.js";
import { showModal } from "./modal.js";

export function renderTickets(tickets) {
  const container = document.getElementById("tickets-list");

  container.innerHTML = tickets
    .map(
      (ticket) => `
        <div class="ticket ${ticket.status ? "done" : ""}" data-id="${
        ticket.id
      }">
          <div class="ticket-header" data-action="toggle-details">
            <div class="ticket-name">${ticket.name}</div>
            <div class="ticket-meta">Создано: ${new Date(
              ticket.created
            ).toLocaleString()}</div>
          </div>
          <div class="ticket-details hidden" data-details>
            <div class="ticket-description">${
              ticket.description
                ? `<strong>Описание:</strong><br>${ticket.description}`
                : "<em>Без описания</em>"
            }</div>
          </div>
          <div class="ticket-actions">
            <button type="button" class="toggle" title="${
              ticket.status ? "Отменить выполнение" : "Отметить как выполненное"
            }">
              ${ticket.status ? "✓" : "○"}
            </button>
            <button type="button" class="edit" title="Редактировать">✎</button>
            <button type="button" class="delete" title="Удалить">×</button>
          </div>
        </div>
      `
    )
    .join("");
}

export function showLoading(show = true) {
  const el = document.getElementById("loading");
  el.classList.toggle("hidden", !show);
}

export function bindEvents() {
  const container = document.getElementById("tickets-list");

  document.getElementById("add-ticket-btn").addEventListener("click", (e) => {
    e.preventDefault();
    showModal({
      title: "Новый тикет",
      fields: [
        { name: "name", label: "Краткое описание", type: "text" },
        {
          name: "description",
          label: "Подробное описание",
          type: "textarea",
          required: false,
        },
      ],
      onSubmit: async (data) => {
        try {
          showLoading(true);
          await api.createTicket(data);
          await refreshTickets();
        } catch (e) {
          alert("Ошибка при создании: " + e.message);
        } finally {
          showLoading(false);
        }
      },
      onCancel: () => {},
    });
  });

  // Делегирование кликов — ОСНОВНОЙ ФИКС: e.preventDefault() В НАЧАЛЕ!
  container.addEventListener("click", async (e) => {
    e.preventDefault();

    if (e.target.closest('[data-action="toggle-details"]')) {
      const ticketEl = e.target.closest(".ticket");
      if (!ticketEl) return;

      const details = ticketEl.querySelector("[data-details]");
      details.classList.toggle("hidden");
      return;
    }

    const ticketEl = e.target.closest(".ticket");
    if (!ticketEl) return;
    const id = ticketEl.dataset.id;

    if (e.target.classList.contains("toggle")) {
      try {
        const currentStatus = ticketEl.classList.contains("done");
        await api.updateTicket(id, { status: !currentStatus });
        ticketEl.classList.toggle("done", !currentStatus);
        e.target.textContent = !currentStatus ? "✓" : "○";
        e.target.title = !currentStatus
          ? "Отменить выполнение"
          : "Отметить как выполненное";
      } catch (e) {
        alert("Ошибка обновления статуса: " + e.message);
      }
      return;
    }

    if (e.target.classList.contains("edit")) {
      try {
        const ticket = await api.getTicketById(id);
        showModal({
          title: "Редактировать тикет",
          fields: [
            { name: "name", label: "Краткое описание", value: ticket.name },
            {
              name: "description",
              label: "Подробное описание",
              value: ticket.description || "",
              type: "textarea",
              required: false,
            },
          ],
          onSubmit: async (data) => {
            try {
              showLoading(true);
              await api.updateTicket(id, data);
              await refreshTickets();
            } catch (e) {
              alert("Ошибка при обновлении: " + e.message);
            } finally {
              showLoading(false);
            }
          },
          onCancel: () => {},
        });
      } catch (e) {
        alert("Ошибка загрузки для редактирования: " + e.message);
      }
      return;
    }

    if (e.target.classList.contains("delete")) {
      showModal({
        title: "Подтверждение удаления",
        message: `Вы уверены, что хотите удалить тикет "${
          ticketEl.querySelector(".ticket-name").textContent
        }"?`,
        submitText: "Удалить",
        danger: true,
        noForm: true,
        onSubmit: async () => {
          await api.deleteTicket(id);
          await refreshTickets();
        },
      });
    }
  });
}

export async function refreshTickets() {
  try {
    showLoading(true);
    const tickets = await api.getAllTickets();
    renderTickets(tickets);
  } catch (e) {
    alert("Ошибка загрузки тикетов: " + e.message);
  } finally {
    showLoading(false);
  }
}
