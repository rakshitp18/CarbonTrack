const API_BASE = "";
const TOKEN_KEY = "carbontrack.accessToken";
const REFRESH_KEY = "carbontrack.refreshToken";

const ACTIVITY_OPTIONS = {
    TRANSPORT: [
        ["CAR_PETROL", "KM"],
        ["CAR_DIESEL", "KM"],
        ["CAR_ELECTRIC", "KM"],
        ["FLIGHT_SHORT_HAUL", "KM"],
        ["FLIGHT_LONG_HAUL", "KM"],
        ["PUBLIC_TRANSIT_BUS", "KM"],
        ["PUBLIC_TRANSIT_RAIL", "KM"]
    ],
    ELECTRICITY: [
        ["GRID_ELECTRICITY", "KWH"],
        ["RENEWABLE_ELECTRICITY", "KWH"]
    ],
    FOOD: [
        ["BEEF_MEAL", "SERVING"],
        ["CHICKEN_MEAL", "SERVING"],
        ["VEGETARIAN_MEAL", "SERVING"],
        ["VEGAN_MEAL", "SERVING"]
    ],
    SHOPPING: [
        ["CLOTHING", "USD"],
        ["ELECTRONICS", "USD"],
        ["GENERAL_RETAIL", "USD"]
    ]
};

const els = {
    serverDot: document.querySelector("#serverDot"),
    serverStatus: document.querySelector("#serverStatus"),
    loginForm: document.querySelector("#loginForm"),
    registerForm: document.querySelector("#registerForm"),
    tokenState: document.querySelector("#tokenState"),
    tokenPreview: document.querySelector("#tokenPreview"),
    tokenExpiry: document.querySelector("#tokenExpiry"),
    tokenType: document.querySelector("#tokenType"),
    userName: document.querySelector("#userName"),
    userEmail: document.querySelector("#userEmail"),
    categorySelect: document.querySelector("#categorySelect"),
    activityTypeSelect: document.querySelector("#activityTypeSelect"),
    unitInput: document.querySelector("#unitInput"),
    logDateInput: document.querySelector("#logDateInput"),
    activityForm: document.querySelector("#activityForm"),
    goalForm: document.querySelector("#goalForm"),
    goalList: document.querySelector("#goalList"),
    activityList: document.querySelector("#activityList"),
    todayCo2e: document.querySelector("#todayCo2e"),
    weeklyCo2e: document.querySelector("#weeklyCo2e"),
    monthlyCo2e: document.querySelector("#monthlyCo2e"),
    percentileRank: document.querySelector("#percentileRank"),
    recommendations: document.querySelector("#recommendations"),
    rawMethod: document.querySelector("#rawMethod"),
    rawPath: document.querySelector("#rawPath"),
    rawBody: document.querySelector("#rawBody"),
    apiOutput: document.querySelector("#apiOutput"),
    toast: document.querySelector("#toast")
};

function token() {
    return localStorage.getItem(TOKEN_KEY) || "";
}

function setToken(accessToken, refreshToken = "") {
    if (accessToken) {
        localStorage.setItem(TOKEN_KEY, accessToken);
    }
    if (refreshToken) {
        localStorage.setItem(REFRESH_KEY, refreshToken);
    }
    renderToken();
}

function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    renderToken();
}

function authHeaders() {
    return token() ? { Authorization: `Bearer ${token()}` } : {};
}

async function api(path, options = {}) {
    const headers = {
        Accept: "application/json",
        ...authHeaders(),
        ...(options.headers || {})
    };

    if (options.body && !headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const text = await response.text();
    const data = text ? tryJson(text) : null;

    if (!response.ok) {
        const message = data?.message || data?.error || text || `${response.status} ${response.statusText}`;
        throw new Error(message);
    }

    return data;
}

function tryJson(text) {
    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

function formData(form) {
    return Object.fromEntries(new FormData(form).entries());
}

function showToast(message) {
    els.toast.textContent = message;
    els.toast.classList.add("show");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => els.toast.classList.remove("show"), 2800);
}

function formatKg(value) {
    const number = Number(value || 0);
    return `${number.toFixed(2)} kg`;
}

function pretty(value) {
    return JSON.stringify(value, null, 2);
}

function decodeJwt(jwt) {
    const parts = jwt.split(".");
    if (parts.length < 2) {
        return null;
    }
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payload.padEnd(payload.length + ((4 - payload.length % 4) % 4), "=");
    return JSON.parse(atob(padded));
}

function renderToken() {
    const current = token();
    if (!current) {
        els.tokenState.textContent = "No token saved";
        els.tokenPreview.textContent = "Login or paste a token to inspect it.";
        els.tokenExpiry.textContent = "-";
        els.userName.textContent = "Not checked";
        els.userEmail.textContent = "-";
        return;
    }

    const shortToken = `${current.slice(0, 18)}...${current.slice(-12)}`;
    els.tokenState.textContent = shortToken;

    const decoded = decodeJwt(current);
    els.tokenPreview.textContent = decoded ? pretty(decoded) : "Token saved, but it is not a readable JWT.";
    els.tokenExpiry.textContent = decoded?.exp ? new Date(decoded.exp * 1000).toLocaleString() : "-";
    els.tokenType.textContent = "Bearer";
}

async function copyText(text, label) {
    if (!text) {
        showToast("Nothing to copy yet.");
        return;
    }
    await navigator.clipboard.writeText(text);
    showToast(`${label} copied.`);
}

function setServerStatus(ok, text) {
    els.serverDot.classList.toggle("ok", ok);
    els.serverDot.classList.toggle("fail", !ok);
    els.serverStatus.textContent = text;
}

async function checkServer() {
    try {
        await api("/v3/api-docs", { headers: {} });
        setServerStatus(true, "API online");
    } catch {
        setServerStatus(false, "API offline");
    }
}

async function login(event) {
    event.preventDefault();
    const payload = formData(els.loginForm);
    const result = await api("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify(payload)
    });
    setToken(result.accessToken, result.refreshToken);
    updateUser(result.user);
    showToast("Logged in.");
    await loadDashboard();
}

async function register(event) {
    event.preventDefault();
    const payload = formData(els.registerForm);
    const result = await api("/api/v1/auth/register", {
        method: "POST",
        body: JSON.stringify(payload)
    });
    setToken(result.accessToken, result.refreshToken);
    updateUser(result.user);
    showToast("Account created and logged in.");
    await loadDashboard();
}

function updateUser(user) {
    els.userName.textContent = user?.username || "Unknown";
    els.userEmail.textContent = user?.email || "-";
}

async function checkToken() {
    const user = await api("/api/v1/users/me");
    updateUser(user);
    showToast("Token is valid.");
}

async function loadDashboard() {
    const data = await api("/api/v1/analytics/dashboard");
    els.todayCo2e.textContent = formatKg(data.todayCo2e);
    els.weeklyCo2e.textContent = formatKg(data.weeklyCo2e);
    els.monthlyCo2e.textContent = formatKg(data.monthlyCo2e);
    els.percentileRank.textContent = data.percentileRank == null ? "-" : `${Number(data.percentileRank).toFixed(1)}%`;
    els.recommendations.innerHTML = "";
    (data.recommendations || []).slice(0, 4).forEach((item) => {
        const node = document.createElement("div");
        node.className = "recommendation";
        node.textContent = item;
        els.recommendations.appendChild(node);
    });
}

async function logActivity(event) {
    event.preventDefault();
    const payload = formData(els.activityForm);
    payload.quantity = Number(payload.quantity);
    await api("/api/v1/activities", {
        method: "POST",
        body: JSON.stringify(payload)
    });
    showToast("Activity saved.");
    await Promise.all([loadActivities(), loadDashboard()]);
}

async function loadActivities() {
    const data = await api("/api/v1/activities?size=10");
    const rows = data.content || [];
    els.activityList.innerHTML = "";
    if (!rows.length) {
        els.activityList.innerHTML = `<div class="list-item meta">No activities yet.</div>`;
        return;
    }
    rows.forEach((activity) => {
        const node = document.createElement("div");
        node.className = "list-item";
        node.innerHTML = `
            <strong>${activity.category} / ${activity.activityType}</strong>
            <span class="meta">${activity.quantity} ${activity.unit} on ${activity.logDate}</span>
            <span>${formatKg(activity.co2eKg)}</span>
        `;
        els.activityList.appendChild(node);
    });
}

async function createGoal(event) {
    event.preventDefault();
    const payload = formData(els.goalForm);
    payload.targetReductionPct = Number(payload.targetReductionPct);
    payload.periodDays = Number(payload.periodDays);
    await api("/api/v1/goals", {
        method: "POST",
        body: JSON.stringify(payload)
    });
    showToast("Goal created.");
    await loadGoals();
}

async function loadGoals() {
    const goals = await api("/api/v1/goals");
    els.goalList.innerHTML = "";
    if (!goals.length) {
        els.goalList.innerHTML = `<div class="list-item meta">No goals yet.</div>`;
        return;
    }
    goals.forEach((goal) => {
        const node = document.createElement("div");
        node.className = "list-item";
        node.innerHTML = `
            <strong>${goal.targetReductionPct}% reduction</strong>
            <span class="meta">${goal.periodDays} days, status ${goal.status || "ACTIVE"}</span>
        `;
        els.goalList.appendChild(node);
    });
}

async function sendRaw() {
    const method = els.rawMethod.value;
    const path = els.rawPath.value.trim();
    const bodyText = els.rawBody.value.trim();
    const options = { method };
    if (bodyText && method !== "GET") {
        options.body = bodyText;
    }

    try {
        const data = await api(path, options);
        els.apiOutput.textContent = pretty(data);
        showToast("Request complete.");
    } catch (error) {
        els.apiOutput.textContent = error.message;
        showToast("Request failed.");
    }
}

function setupActivityOptions() {
    Object.keys(ACTIVITY_OPTIONS).forEach((category) => {
        els.categorySelect.add(new Option(category, category));
    });
    syncActivityTypes();
}

function syncActivityTypes() {
    const category = els.categorySelect.value;
    els.activityTypeSelect.innerHTML = "";
    ACTIVITY_OPTIONS[category].forEach(([type, unit]) => {
        const option = new Option(type, type);
        option.dataset.unit = unit;
        els.activityTypeSelect.add(option);
    });
    syncUnit();
}

function syncUnit() {
    els.unitInput.value = els.activityTypeSelect.selectedOptions[0]?.dataset.unit || "";
}

function setupTabs() {
    document.querySelectorAll("[data-auth-tab]").forEach((button) => {
        button.addEventListener("click", () => {
            document.querySelectorAll("[data-auth-tab]").forEach((item) => item.classList.remove("active"));
            button.classList.add("active");
            const mode = button.dataset.authTab;
            els.loginForm.classList.toggle("hidden", mode !== "login");
            els.registerForm.classList.toggle("hidden", mode !== "register");
        });
    });
}

function setupEvents() {
    els.loginForm.addEventListener("submit", (event) => login(event).catch(handleError));
    els.registerForm.addEventListener("submit", (event) => register(event).catch(handleError));
    els.activityForm.addEventListener("submit", (event) => logActivity(event).catch(handleError));
    els.goalForm.addEventListener("submit", (event) => createGoal(event).catch(handleError));
    els.categorySelect.addEventListener("change", syncActivityTypes);
    els.activityTypeSelect.addEventListener("change", syncUnit);

    document.querySelector("#copyTokenBtn").addEventListener("click", () => copyText(token(), "Token"));
    document.querySelector("#copyHeaderBtn").addEventListener("click", () => copyText(token() ? `Authorization: Bearer ${token()}` : "", "Authorization header"));
    document.querySelector("#saveTokenBtn").addEventListener("click", () => {
        const pasted = document.querySelector("#manualTokenInput").value.trim().replace(/^Bearer\s+/i, "");
        setToken(pasted);
        showToast(pasted ? "Token saved." : "Paste a token first.");
    });
    document.querySelector("#clearTokenBtn").addEventListener("click", clearToken);
    document.querySelector("#checkTokenBtn").addEventListener("click", () => checkToken().catch(handleError));
    document.querySelector("#refreshDashboardBtn").addEventListener("click", () => loadDashboard().catch(handleError));
    document.querySelector("#loadActivitiesBtn").addEventListener("click", () => loadActivities().catch(handleError));
    document.querySelector("#loadGoalsBtn").addEventListener("click", () => loadGoals().catch(handleError));
    document.querySelector("#sendRawBtn").addEventListener("click", sendRaw);
}

function handleError(error) {
    showToast(error.message);
    els.apiOutput.textContent = error.message;
}

function init() {
    setupTabs();
    setupActivityOptions();
    setupEvents();
    els.logDateInput.value = new Date().toISOString().slice(0, 10);
    renderToken();
    checkServer();
    if (token()) {
        checkToken().catch(() => {});
    }
}

init();
