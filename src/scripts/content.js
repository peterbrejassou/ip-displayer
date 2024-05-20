/**
 * Check if a string is a valid IP address
 *
 * @param string ip
 * @returns boolean
 */
function isValidIPAddress(ip) {
    const ipPattern = /^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}$/
    return ipPattern.test(ip)
}

/**
 * Function to asynchronously retrieve the IP address of the current site.
 *
 * @return {string|null} The IP address of the site or null if not found.
 */
async function getSiteIPAddress() {
    try {
        // Get domain name from current URL
        const domain = window.location.hostname

        // Performs a DNS-over-HTTPS query to get the IP address
        const response = await fetch(`https://dns.google/resolve?name=${domain}&type=A`)
        const data = await response.json()

        if (data && data.Status === 0 && data.Answer && data.Answer.length > 0) {
            // Go through the responses and return the first valid IP address
            for (const answer of data.Answer) {
                if (isValidIPAddress(answer.data)) {
                    return answer.data
                }
            }
            throw new Error("No valid IP address found in DNS response")
        } else {
            throw new Error("Unable to resolve site IP address")
        }
    } catch (error) {
        console.error("Error getting site IP address:", error)
        return null
    }
}

/**
 * Asynchronously retrieves the excluded domains from chrome storage.
 *
 * @return {Promise} An array of excluded domains.
 */
async function getExcludedDomains() {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get("excludedDomains", function (data) {
            resolve(data.excludedDomains || [])
        })
    })
}

/**
 * Asynchronously checks if a domain is in the list of excluded domains.
 *
 * @param {string} domain - The domain to check.
 * @param {Array} excludedDomains - The array of excluded domains.
 * @return {boolean} True if the domain is excluded, false otherwise.
 */
async function isDomainExcluded(domain, excludedDomains) {
    return excludedDomains.includes(domain)
}

/**
 * Asynchronously injects the site's IP address into the webpage if not excluded.
 */
async function injectSiteIPAddress() {
    const ip = await getSiteIPAddress()
    if (ip) {
        const domain = window.location.hostname
        const excludedDomains = await getExcludedDomains()

        if (!(await isDomainExcluded(domain, excludedDomains))) {
            const ipBubble = document.createElement("div")
            ipBubble.id = "ip-displayer"
            ipBubble.textContent = ip
            document.body.appendChild(ipBubble)

            // Adds an event handler to remove the bubble on click
            ipBubble.addEventListener("click", () => ipBubble.remove())
        }
    }
}

window.onload = () => {
    injectSiteIPAddress()
}
