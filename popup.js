chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
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

      // If you want to log the response for debugging purposes:
      console.log(response);

      const data = response?.data?.Results;

      if (!data || data.length === 0) {
        resultsDiv.textContent = "No data found for the entered VIN.";
        return;
      }

      const filteredResults = data.filter(
        (result) => !result.Variable.includes("Error") && result.Value
      );

      let resultsHTML = "";
      filteredResults.forEach((result) => {
        resultsHTML += `<strong>${result.Variable}:</strong> ${result.Value}<br>`;
      });

      resultsDiv.innerHTML = resultsHTML;
    } catch (error) {
      // If the error object has a message, display that, otherwise use a default error message
      resultsDiv.textContent = error.message || "Error fetching VIN data.";
    }
  });
