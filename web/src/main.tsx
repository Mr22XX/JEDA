/**
 * Titik masuk aplikasi: memasang React ke #root dengan I18nProvider membungkus App, lalu memuat index.css.
 * Provider global baru (misalnya konteks lain) ditambahkan di sini.
 */

import { createRoot } from "react-dom/client";
import App from "./App";
import { I18nProvider } from "./i18n";
import "./index.css";
createRoot(document.getElementById("root")!).render(<I18nProvider><App /></I18nProvider>);