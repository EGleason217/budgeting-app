document
  .getElementById("projectionForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const month = document.getElementById("month").value;
    const year = document.getElementById("year").value;
    const chartsContainer = document.getElementById("chartsContainer");
    chartsContainer.innerHTML = "";

    const response = await fetch(
      `https://budget-visualizer.netlify.app/projections?month=${month}&year=${year}`
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
  });
