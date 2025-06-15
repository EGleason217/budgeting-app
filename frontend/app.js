const BASE_URL = "https://budgeting-app-73du.onrender.com";

// -------------------------------
// Load Account Dropdown for Entry Form
// -------------------------------
async function loadAccounts() {
  const res = await fetch(`${BASE_URL}/accounts`);
  const accounts = await res.json();
  const select = document.getElementById("accountId");
  select.innerHTML = "";
  accounts.forEach((account) => {
    const opt = document.createElement("option");
    opt.value = account.id;
    opt.textContent = account.name;
    select.appendChild(opt);
  });
}

loadAccounts();

// -------------------------------
// Entry Form Submission
// -------------------------------
document.getElementById("entryForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  console.clear();
  console.log("Submitting new entry...");

  const entry = {
    accountId: parseInt(document.getElementById("accountId").value),
    type: document.getElementById("type").value,
    amount: parseFloat(document.getElementById("amount").value),
    description: document.getElementById("description").value,
    startDate: document.getElementById("startDate").value,
    isRecurring: document.getElementById("isRecurring").checked,
    recurrence: document.getElementById("isRecurring").checked
      ? document.getElementById("recurrence").value
      : null,
  };

  console.log("Sending entry:", entry);

  const res = await fetch(`${BASE_URL}/entries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  });

  console.log("Response status:", res.status);

  if (res.ok) {
    alert("Entry added!");
    document.getElementById("entryForm").reset();
    await loadProjections(); // Re-render charts after adding entry
  } else {
    alert("Failed to add entry.");
  }
});

// -------------------------------
// Load & Display Projections
// -------------------------------
async function loadProjections() {
  const month = document.getElementById("month").value;
  const year = document.getElementById("year").value;
  const chartsContainer = document.getElementById("chartsContainer");
  chartsContainer.innerHTML = "";

  const response = await fetch(
    `${BASE_URL}/projections?month=${month}&year=${year}`
  );
  const data = await response.json();

  data.forEach((account) => {
    const labels = Object.keys(account.dailyBalances);
    const balances = Object.values(account.dailyBalances);

    const canvas = document.createElement("canvas");
    chartsContainer.appendChild(canvas);

    new Chart(canvas, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: `${account.account} Balance`,
            data: balances,
            borderColor: "green",
            backgroundColor: "rgba(0, 128, 0, 0.1)",
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: `Projection for ${account.account}`,
          },
        },
        scales: {
          y: {
            beginAtZero: false,
          },
        },
      },
    });

    // 🔔 Optional visual alerts (Phase 2 — coming next!)
    if (account.alerts?.length) {
      const alertBox = document.createElement("div");
      alertBox.style.color = "red";
      alertBox.style.margin = "0.5rem 0";
      alertBox.textContent = `⚠️ ALERT: ${account.alerts.length} overdraft day(s)`;
      chartsContainer.appendChild(alertBox);
    }
  });
}

// -------------------------------
// Handle Projections Form Submit
// -------------------------------
document
  .getElementById("projectionForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    await loadProjections();
  });
