export function showModal({
  title,
  message = "",
  fields = [],
  onSubmit,
  onCancel,
  submitText = "Сохранить",
  cancelText = "Отмена",
  submitClass = "submit",
  danger = false,
  noForm = false,
}) {
  const modal = document.createElement("div");
  modal.className = "modal";

  modal.innerHTML = `
      <div class="modal-content">
        <h2>${title}</h2>
  
        ${message ? `<p class="modal-message">${message}</p>` : ""}
  
        ${
          noForm
            ? `
          <div class="modal-buttons">
            <button type="button" class="cancel">${cancelText}</button>
            <button type="button" class="${submitClass} ${
                danger ? "delete" : ""
              }">
              ${submitText}
            </button>
          </div>
        `
            : `
          <form>
            ${fields
              .map(
                (f) => `
              <label for="${f.name}">${f.label}</label>
              ${
                f.type === "textarea"
                  ? `<textarea id="${f.name}" name="${f.name}" ${
                      f.required !== false ? "required" : ""
                    }>${f.value || ""}</textarea>`
                  : `<input type="${f.type || "text"}" id="${f.name}" name="${
                      f.name
                    }" value="${f.value || ""}" ${
                      f.required !== false ? "required" : ""
                    }>`
              }
            `
              )
              .join("")}
  
            <div class="modal-buttons">
              <button type="button" class="cancel">${cancelText}</button>
              <button type="submit" class="${submitClass} ${
                danger ? "delete" : ""
              }">${submitText}</button>
            </div>
          </form>
        `
        }
      </div>
    `;

  document.body.appendChild(modal);

  const cancelBtn = modal.querySelector(".cancel");
  const submitBtn = modal.querySelector(`.${submitClass}`);

  cancelBtn.addEventListener("click", () => {
    onCancel?.();
    modal.remove();
  });

  if (noForm) {
    submitBtn.addEventListener("click", async () => {
      await onSubmit?.();
      modal.remove();
    });
  } else {
    const form = modal.querySelector("form");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      await onSubmit?.(data);
      modal.remove();
    });
  }

  return modal;
}
