chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.vin) {
    try {
      const response = await axios.get(
        `https://vpic.nhtsa.dot.gov/api/vehicles/decodevinextended/${message.vin}?format=json`
      );
      const data = response?.data?.Results;
      const filteredResults = data.filter(
        (result) => !result.Variable.includes("Error") && result.Value
      );

      let resultsHTML =
        '<div style="position: fixed; top: 10%; left: 30%; width: 40%; background-color: white; z-index: 10000; border: 2px solid black; padding: 20px;">';
      filteredResults.forEach((result) => {
        resultsHTML += `<strong>${result.Variable}:</strong> ${result.Value}<br>`;
      });
      resultsHTML += "</div>";

      // Append to body
      document.body.insertAdjacentHTML("beforeend", resultsHTML);
    } catch (error) {
      // Handle error
      console.error("Error fetching VIN data.", error);
    }
  }
});
