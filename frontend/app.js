document
  .getElementById("projectionForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const month = document.getElementById("month").value;
    const year = document.getElementById("year").value;
    const chartsContainer = document.getElementById("chartsContainer");
    chartsContainer.innerHTML = "";

    const response = await fetch(
      `https://budgeting-app-73du.onrender.com/projections?month=${month}&year=${year}`
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
    });
    const BASE_URL = "https://budgeting-app-73du.onrender.com";

    // Load account options into dropdown
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

    document
      .getElementById("entryForm")
      .addEventListener("submit", async (e) => {
        e.preventDefault();

        const entry = {
          accountId: parseInt(document.getElementById("accountId").value),
          type: document.getElementById("type").value,
          amount: parseFloat(document.getElementById("amount").value),
          description: document.getElementById("description").value,
          startDate: document.getElementById("startDate").value,
          isRecurring: document.getElementById("isRecurring").checked,
          recurrence: document.getElementById("recurrence").value || null,
        };

        const res = await fetch(`${BASE_URL}/entries`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(entry),
        });

        if (res.ok) {
          alert("Entry added!");
          document.getElementById("entryForm").reset();
        } else {
          alert("Failed to add entry.");
        }
      });
  });
