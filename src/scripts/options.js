document.addEventListener("DOMContentLoaded", function () {
    const saveButton = document.getElementById("saveButton")
    const addDomainButton = document.getElementById("addDomainButton")
    const excludedDomainsInput = document.getElementById("excludedDomains")

    // Loads excluded domains from memory and displays them in the text field
    chrome.storage.sync.get("excludedDomains", function (data) {
        if (data.excludedDomains) {
            excludedDomainsInput.value = data.excludedDomains.join("\n")
        }
    })

    // Adds the current domain to the text field when the Add Current Domain button is clicked
    addDomainButton.addEventListener("click", async () => {
        try {
            // Get the domain of the active tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
            const url = new URL(tab.url)
            const domain = url.hostname

            // Add the domain to the text box
            const textarea = document.getElementById("excludedDomains")
            if (textarea.value) {
                textarea.value += `\n${domain}`
            } else {
                textarea.value = domain
            }
        } catch (error) {
            console.error("Error getting current tab domain:", error)
        }
    })

    // Saves excluded domains when the Save button is clicked
    saveButton.addEventListener("click", function () {
        const excludedDomains = excludedDomainsInput.value
            .split("\n")
            .map((domain) => domain.trim())
            .filter(Boolean)
        chrome.storage.sync.set({ excludedDomains: excludedDomains }, function () {
            alert("Excluded domains saved successfully!")
        })
    })
})
