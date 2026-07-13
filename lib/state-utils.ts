/**
 * Utility functions for handling state/province names across countries
 */

// Mapping of common state codes to full names (for backward compatibility)
const STATE_CODE_MAP: Record<string, string> = {
  // Nigeria
  "NG-AB": "Abia",
  "NG-AD": "Adamawa",
  "NG-AK": "Akwa Ibom",
  "NG-AN": "Anambra",
  "NG-BA": "Bauchi",
  "NG-BY": "Bayelsa",
  "NG-BE": "Benue",
  "NG-BO": "Borno",
  "NG-CR": "Cross River",
  "NG-DE": "Delta",
  "NG-EB": "Ebonyi",
  "NG-ED": "Edo",
  "NG-EK": "Ekiti",
  "NG-EN": "Enugu",
  "NG-FC": "Federal Capital Territory",
  "NG-GO": "Gombe",
  "NG-IM": "Imo",
  "NG-JI": "Jigawa",
  "NG-KD": "Kaduna",
  "NG-KN": "Kano",
  "NG-KT": "Katsina",
  "NG-KE": "Kebbi",
  "NG-KO": "Kogi",
  "NG-KW": "Kwara",
  "NG-LA": "Lagos",
  "NG-NA": "Nasarawa",
  "NG-NI": "Niger",
  "NG-OG": "Ogun",
  "NG-ON": "Ondo",
  "NG-OS": "Osun",
  "NG-OY": "Oyo",
  "NG-PL": "Plateau",
  "NG-RI": "Rivers",
  "NG-SO": "Sokoto",
  "NG-TA": "Taraba",
  "NG-YO": "Yobe",
  "NG-ZA": "Zamfara",
}

/**
 * Get the display name for a state/province
 * If the state is already a full name, return it as-is
 * If it's a code like "NG-EB", convert it to the full name
 * 
 * @param state - The state code or name
 * @returns The full state name for display
 */
export function getStateDisplayName(state: string | null | undefined): string {
  if (!state) return ""
  
  // If it's already a full name (doesn't match the code pattern), return as-is
  // State codes typically follow patterns like "NG-EB", "US-CA", etc.
  if (!state.includes("-") || state.length <= 3) {
    return state
  }
  
  // Check if we have a mapping for this code
  const mappedName = STATE_CODE_MAP[state.toUpperCase()]
  if (mappedName) {
    return mappedName
  }
  
  // If no mapping found, return the original (might be a full name with a dash)
  return state
}

/**
 * Format location for display (Country, State)
 * 
 * @param country - The country name
 * @param state - The state code or name
 * @returns Formatted location string like "Nigeria, Ebonyi" or "Nigeria"
 */
export function formatLocation(country: string | null | undefined, state: string | null | undefined): string {
  if (!country) return ""
  
  const stateName = getStateDisplayName(state)
  if (stateName) {
    return `${country}, ${stateName}`
  }
  
  return country
}

/**
 * Check if a state value appears to be a code rather than a full name
 * 
 * @param state - The state value to check
 * @returns true if it looks like a code, false if it looks like a full name
 */
export function isStateCode(state: string | null | undefined): boolean {
  if (!state) return false
  // Codes typically have format like "NG-EB", "US-CA", etc.
  return state.includes("-") && state.length > 3
}