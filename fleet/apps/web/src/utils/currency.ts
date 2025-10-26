/**
 * Currency formatting utility
 * Formats currency based on user's country/locale settings
 */

// Country to currency mapping
const COUNTRY_TO_CURRENCY: Record<string, string> = {
  // North America
  'US': 'USD',
  'CA': 'CAD',
  'MX': 'MXN',
  
  // Europe
  'GB': 'GBP',
  'FR': 'EUR',
  'DE': 'EUR',
  'IT': 'EUR',
  'ES': 'EUR',
  'NL': 'EUR',
  'BE': 'EUR',
  'AT': 'EUR',
  'PT': 'EUR',
  'IE': 'EUR',
  'GR': 'EUR',
  'FI': 'EUR',
  'PL': 'PLN',
  'CZ': 'CZK',
  'SE': 'SEK',
  'NO': 'NOK',
  'DK': 'DKK',
  'CH': 'CHF',
  
  // Asia Pacific
  'AU': 'AUD',
  'NZ': 'NZD',
  'SG': 'SGD',
  'HK': 'HKD',
  'JP': 'JPY',
  'CN': 'CNY',
  'IN': 'INR',
  'KR': 'KRW',
  'MY': 'MYR',
  'TH': 'THB',
  'ID': 'IDR',
  'PH': 'PHP',
  'VN': 'VND',
  
  // Middle East & Africa
  'AE': 'AED',
  'SA': 'SAR',
  'ZA': 'ZAR',
  'EG': 'EGP',
  'NG': 'NGN',
  'KE': 'KES',
  
  // South America
  'BR': 'BRL',
  'AR': 'ARS',
  'CL': 'CLP',
  'CO': 'COP',
  'PE': 'PEN',
  
  // Default
  'default': 'USD'
};

// Get currency code from country
export function getCurrencyCode(country?: string | null): string {
  if (!country) {
    return COUNTRY_TO_CURRENCY['default'];
  }
  
  const code = COUNTRY_TO_CURRENCY[country.toUpperCase()] || COUNTRY_TO_CURRENCY['default'];
  return code;
}

// Format currency amount
export function formatCurrency(
  amount: number | string,
  currencyCode?: string,
  locale?: string
): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return 'Invalid amount';
  }
  
  try {
    const formatter = new Intl.NumberFormat(locale || 'en-US', {
      style: 'currency',
      currency: currencyCode || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    
    return formatter.format(numAmount);
  } catch (error) {
    // Fallback formatting
    return `${currencyCode || 'USD'} ${numAmount.toFixed(2)}`;
  }
}

// Get locale from country
export function getLocaleFromCountry(country?: string | null): string {
  if (!country) {
    return 'en-US';
  }
  
  const countryCode = country.toUpperCase();
  
  // Map countries to their common locales
  const countryToLocale: Record<string, string> = {
    'US': 'en-US',
    'CA': 'en-CA',
    'MX': 'es-MX',
    'GB': 'en-GB',
    'FR': 'fr-FR',
    'DE': 'de-DE',
    'IT': 'it-IT',
    'ES': 'es-ES',
    'NL': 'nl-NL',
    'BE': 'nl-BE',
    'AT': 'de-AT',
    'PT': 'pt-PT',
    'IE': 'en-IE',
    'GR': 'el-GR',
    'FI': 'fi-FI',
    'PL': 'pl-PL',
    'CZ': 'cs-CZ',
    'SE': 'sv-SE',
    'NO': 'nb-NO',
    'DK': 'da-DK',
    'CH': 'de-CH',
    'AU': 'en-AU',
    'NZ': 'en-NZ',
    'SG': 'en-SG',
    'HK': 'zh-HK',
    'JP': 'ja-JP',
    'CN': 'zh-CN',
    'IN': 'en-IN',
    'KR': 'ko-KR',
    'MY': 'en-MY',
    'TH': 'th-TH',
    'ID': 'id-ID',
    'PH': 'en-PH',
    'VN': 'vi-VN',
    'AE': 'ar-AE',
    'SA': 'ar-SA',
    'ZA': 'en-ZA',
    'EG': 'ar-EG',
    'NG': 'en-NG',
    'KE': 'en-KE',
    'BR': 'pt-BR',
    'AR': 'es-AR',
    'CL': 'es-CL',
    'CO': 'es-CO',
    'PE': 'es-PE',
  };
  
  return countryToLocale[countryCode] || 'en-US';
}

// Format currency for a specific country
export function formatCurrencyForCountry(
  amount: number | string,
  country?: string | null
): string {
  const currencyCode = getCurrencyCode(country);
  const locale = getLocaleFromCountry(country);
  
  return formatCurrency(amount, currencyCode, locale);
}

// Parse currency string to number
export function parseCurrency(currencyString: string): number {
  // Remove currency symbols and formatting
  const cleaned = currencyString
    .replace(/[^\d.-]/g, '')
    .trim();
  
  return parseFloat(cleaned) || 0;
}

