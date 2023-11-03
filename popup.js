chrome.runtime.onMessage.addListener((message) => {
  if (message.vin) {
    document.getElementById("vinInput").value = message.vin;
    // Trigger the submit button click event to fetch and display the VIN details
    document.getElementById("submitBtn").click();
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const vin = urlParams.get("vin");
  if (vin) {
    document.getElementById("vinInput").value = decodeURIComponent(vin);
    document.getElementById("submitBtn").click();
  }
});

// New code added here
document.getElementById("vinInput").addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    const vin = document.getElementById("vinInput").value;
    if (vin) {
      document.getElementById("submitBtn").click();
    }
  }
});

document
  .getElementById("submitBtn")
  .addEventListener("click", async function () {
    const vin = document.getElementById("vinInput").value;
    const resultsDiv = document.getElementById("resultsDiv");

    if (!vin) {
      resultsDiv.textContent = "Please enter a VIN.";
      return;
    }

    try {
      const response = await axios.get(
        `https://vpic.nhtsa.dot.gov/api/vehicles/decodevinextended/${vin}?format=json`
      );

      const data = response?.data?.Results;

      if (!data || data.length === 0) {
        resultsDiv.textContent = "No data found for the entered VIN.";
        return;
      }

      const filteredResults = data.filter(
        (result) => !result.Variable.includes("Error") && result.Value
      );

      let resultsHTML = `
  <table class="vin-results-table">
    <thead>
      <tr class="header-row">
        <th>Attribute</th>
        <th>Value</th>
      </tr>
    </thead>
    <tbody>
`;

      filteredResults.forEach((result, index) => {
        resultsHTML += `
    <tr class="${index % 2 === 0 ? "even-row" : "odd-row"}">
      <td class="attribute-cell">${result.Variable}</td>
      <td class="value-cell">${result.Value}</td>
    </tr>
  `;
      });

      resultsHTML += `</tbody></table>`;
      resultsDiv.innerHTML = resultsHTML;
    } catch (error) {
      // If the error object has a message, display that, otherwise use a default error message
      resultsDiv.textContent = error.message || "Error fetching VIN data.";
    }

    const vinLink = `https://www.vindecoderfree.com/vin/${vin}`;
    document.getElementById(
      "linkDiv"
    ).innerHTML = `<a href="${vinLink}" target="_blank">View full details on VinDecoderFree.com</a>`;
  });
