function getCustomKey(key) {
  const keyMap = {
    brandName: "Make",
    modelName: "Model",
    modelId: "Model ID",
    vin: "VIN",
    // ... add other custom key mappings as needed
  };

  // Return the custom key if it exists in the map, otherwise return the original key
  return keyMap[key] || key;
}

document.addEventListener("DOMContentLoaded", function () {
  // Listener for messages from the Chrome extension
  chrome.runtime.onMessage.addListener((message) => {
    if (message.vin) {
      displayVinData(message.vin);
    }
  });

  // Event listener for the submit button
  document
    .getElementById("submitBtn")
    .addEventListener("click", async function () {
      const vin = document.getElementById("vinInput").value;
      if (vin) {
        displayVinData(vin);
      }
    });

  // Event listener for the VIN input to accept the Enter key
  document.getElementById("vinInput").addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      const vin = document.getElementById("vinInput").value;
      if (vin) {
        displayVinData(vin);
      }
    }
  });

  // Function to fetch and display VIN data
  async function displayVinData(vin) {
    const resultsDiv = document.getElementById("resultsDiv");

    try {
      // Set up the API request options
      const options = {
        method: "GET",
        url: "https://cis-automotive.p.rapidapi.com/vinDecode",
        params: { vin },
        headers: {
          "X-RapidAPI-Key":
            "42ce5a5983msha5832eae9e62f15p1996a9jsneba1dc8291f1",
          "X-RapidAPI-Host": "cis-automotive.p.rapidapi.com",
        },
      };

      // Perform the API requests
      const decodeResponse = await axios.request(options);

      // Process the responses
      const vehicleData = decodeResponse?.data;
      // const historyData = historyResponse?.data?.data;

      // Clear previous results
      resultsDiv.innerHTML = "";

      // Build the results display HTML
      let resultsHTML = "<h2>Vehicle Information</h2>";

      if (vehicleData) {
        resultsHTML += '<div class="vehicle-data">';

        Object.keys(vehicleData).forEach((key) => {
          if (
            !key.includes("Error") &&
            vehicleData[key] &&
            key !== "data" &&
            key !== "recallInfo" &&
            key !== "cacheTimeLimit"
          ) {
            resultsHTML += `<p><strong>${getCustomKey(key)
              .replace(/([A-Z])/g, " $1")
              .trim()}:</strong> ${vehicleData[key]}</p>`;
          }

          if (key === "data" && typeof vehicleData.data === "object") {
            resultsHTML +=
              '<div class="vehicle-data-nested"><h3>Additional Details</h3>';
            Object.keys(vehicleData["data"]).forEach((nestedKey) => {
              const nestedValue = vehicleData["data"][nestedKey];
              // Handle recall information if present
              if (
                nestedKey === "RecallInfo" &&
                Array.isArray(vehicleData["data"]["RecallInfo"])
              ) {
                resultsHTML += '<div class="vehicle-recall-info">';
                vehicleData["data"]["RecallInfo"].forEach((recall, i) => {
                  resultsHTML += `<div class="recall-item"><h3>${
                    i + 1
                  }# RECALL</h3>`;
                  Object.keys(recall).forEach((recallKey) => {
                    resultsHTML += `<p><strong>${recallKey
                      .replace(/([A-Z])/g, " $1")
                      .trim()}:</strong> ${JSON.stringify(
                      recall[recallKey]
                    )}</p>`;
                  });
                  resultsHTML += `</div>`; // End of recall-item
                });
                resultsHTML += "</div>"; // End of vehicle-recall-info
              }

              if (nestedKey !== "RecallInfo") {
                if (typeof nestedValue !== "object") {
                  resultsHTML += `<p><strong>${getCustomKey(nestedKey)
                    .replace(/([A-Z])/g, " $1")
                    .trim()}:</strong> ${nestedValue}</p>`;
                } else {
                  // Here you could add further nesting, or convert the object to a JSON string
                  resultsHTML += `<p><strong>${getCustomKey(nestedKey)
                    .replace(/([A-Z])/g, " $1")
                    .trim()}:</strong> ${JSON.stringify(nestedValue)}</p>`;
                }
              }
            });
            resultsHTML += "</div>"; // End of vehicle-data-nested
          }
        });

        resultsHTML += "</div>"; // End of vehicle-data
      }

      // Display the results
      resultsDiv.innerHTML = resultsHTML;
    } catch (error) {
      console.error("Error fetching VIN data.", error);
      resultsDiv.innerHTML = `<p>Error fetching data. Please try again later.</p>`;
    }
  }
});
