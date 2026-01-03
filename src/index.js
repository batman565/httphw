import "./styles.css";
import { refreshTickets, bindEvents } from "./ui.js";

document.addEventListener("DOMContentLoaded", () => {
  bindEvents();
  refreshTickets();
});
