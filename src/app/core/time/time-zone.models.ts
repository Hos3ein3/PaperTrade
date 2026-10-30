/**
 * Mirrors AzureTest.Domain.Enums.PreferredTimeZone with display names,
 * IANA identifiers for Intl.DateTimeFormat, and regional UTC offsets.
 */
export enum PreferredTimeZone {
  Utc = 0,
  Hawaii = 1,
  Alaska = 2,
  Pacific = 3,
  Mountain = 4,
  Central = 5,
  Eastern = 6,
  Atlantic = 7,
  Brasilia = 8,
  London = 9,
  CentralEuropean = 10,
  EasternEuropean = 11,
  Cairo = 12,
  Johannesburg = 13,
  Moscow = 14,
  Tehran = 15,
  Dubai = 16,
  Karachi = 17,
  India = 18,
  Bangkok = 19,
  Singapore = 20,
  Tokyo = 21,
  Sydney = 22,
  Auckland = 23,
}

export interface TimeZoneDefinition {
  enumValue: PreferredTimeZone;
  key: string;
  displayName: string;
  iana: string;
  offsetLabel: string;
}

export const TIME_ZONE_DEFINITIONS: Record<PreferredTimeZone, TimeZoneDefinition> = {
  [PreferredTimeZone.Utc]: {
    enumValue: PreferredTimeZone.Utc,
    key: 'Utc',
    displayName: 'UTC (Coordinated Universal Time)',
    iana: 'UTC',
    offsetLabel: 'UTC+00:00',
  },
  [PreferredTimeZone.Hawaii]: {
    enumValue: PreferredTimeZone.Hawaii,
    key: 'Hawaii',
    displayName: 'Honolulu (Hawaii Time)',
    iana: 'Pacific/Honolulu',
    offsetLabel: 'UTC-10:00',
  },
  [PreferredTimeZone.Alaska]: {
    enumValue: PreferredTimeZone.Alaska,
    key: 'Alaska',
    displayName: 'Anchorage (Alaska Time)',
    iana: 'America/Anchorage',
    offsetLabel: 'UTC-09:00',
  },
  [PreferredTimeZone.Pacific]: {
    enumValue: PreferredTimeZone.Pacific,
    key: 'Pacific',
    displayName: 'Los Angeles, San Francisco (Pacific Time)',
    iana: 'America/Los_Angeles',
    offsetLabel: 'UTC-08:00 / -07:00',
  },
  [PreferredTimeZone.Mountain]: {
    enumValue: PreferredTimeZone.Mountain,
    key: 'Mountain',
    displayName: 'Denver, Phoenix (Mountain Time)',
    iana: 'America/Denver',
    offsetLabel: 'UTC-07:00 / -06:00',
  },
  [PreferredTimeZone.Central]: {
    enumValue: PreferredTimeZone.Central,
    key: 'Central',
    displayName: 'Chicago, Dallas (Central Time)',
    iana: 'America/Chicago',
    offsetLabel: 'UTC-06:00 / -05:00',
  },
  [PreferredTimeZone.Eastern]: {
    enumValue: PreferredTimeZone.Eastern,
    key: 'Eastern',
    displayName: 'New York, Toronto (Eastern Time)',
    iana: 'America/New_York',
    offsetLabel: 'UTC-05:00 / -04:00',
  },
  [PreferredTimeZone.Atlantic]: {
    enumValue: PreferredTimeZone.Atlantic,
    key: 'Atlantic',
    displayName: 'Halifax (Atlantic Time)',
    iana: 'America/Halifax',
    offsetLabel: 'UTC-04:00 / -03:00',
  },
  [PreferredTimeZone.Brasilia]: {
    enumValue: PreferredTimeZone.Brasilia,
    key: 'Brasilia',
    displayName: 'São Paulo, Buenos Aires (Brasilia / Argentina Time)',
    iana: 'America/Sao_Paulo',
    offsetLabel: 'UTC-03:00',
  },
  [PreferredTimeZone.London]: {
    enumValue: PreferredTimeZone.London,
    key: 'London',
    displayName: 'London, Dublin, Lisbon (Greenwich Mean Time)',
    iana: 'Europe/London',
    offsetLabel: 'UTC+00:00 / +01:00',
  },
  [PreferredTimeZone.CentralEuropean]: {
    enumValue: PreferredTimeZone.CentralEuropean,
    key: 'CentralEuropean',
    displayName: 'Paris, Berlin, Amsterdam, Rome (Central European Time)',
    iana: 'Europe/Berlin',
    offsetLabel: 'UTC+01:00 / +02:00',
  },
  [PreferredTimeZone.EasternEuropean]: {
    enumValue: PreferredTimeZone.EasternEuropean,
    key: 'EasternEuropean',
    displayName: 'Athens, Istanbul, Bucharest (Eastern European Time)',
    iana: 'Europe/Athens',
    offsetLabel: 'UTC+02:00 / +03:00',
  },
  [PreferredTimeZone.Cairo]: {
    enumValue: PreferredTimeZone.Cairo,
    key: 'Cairo',
    displayName: 'Cairo (Egypt Time)',
    iana: 'Africa/Cairo',
    offsetLabel: 'UTC+02:00 / +03:00',
  },
  [PreferredTimeZone.Johannesburg]: {
    enumValue: PreferredTimeZone.Johannesburg,
    key: 'Johannesburg',
    displayName: 'Johannesburg (South Africa Time)',
    iana: 'Africa/Johannesburg',
    offsetLabel: 'UTC+02:00',
  },
  [PreferredTimeZone.Moscow]: {
    enumValue: PreferredTimeZone.Moscow,
    key: 'Moscow',
    displayName: 'Moscow, Riyadh, Baghdad (Arabia / Moscow Time)',
    iana: 'Europe/Moscow',
    offsetLabel: 'UTC+03:00',
  },
  [PreferredTimeZone.Tehran]: {
    enumValue: PreferredTimeZone.Tehran,
    key: 'Tehran',
    displayName: 'Tehran (Iran Time)',
    iana: 'Asia/Tehran',
    offsetLabel: 'UTC+03:30',
  },
  [PreferredTimeZone.Dubai]: {
    enumValue: PreferredTimeZone.Dubai,
    key: 'Dubai',
    displayName: 'Dubai, Abu Dhabi (Gulf Time)',
    iana: 'Asia/Dubai',
    offsetLabel: 'UTC+04:00',
  },
  [PreferredTimeZone.Karachi]: {
    enumValue: PreferredTimeZone.Karachi,
    key: 'Karachi',
    displayName: 'Karachi, Tashkent (Pakistan / West Asia Time)',
    iana: 'Asia/Karachi',
    offsetLabel: 'UTC+05:00',
  },
  [PreferredTimeZone.India]: {
    enumValue: PreferredTimeZone.India,
    key: 'India',
    displayName: 'Mumbai, New Delhi (India Time)',
    iana: 'Asia/Kolkata',
    offsetLabel: 'UTC+05:30',
  },
  [PreferredTimeZone.Bangkok]: {
    enumValue: PreferredTimeZone.Bangkok,
    key: 'Bangkok',
    displayName: 'Bangkok, Jakarta, Hanoi (Indochina Time)',
    iana: 'Asia/Bangkok',
    offsetLabel: 'UTC+07:00',
  },
  [PreferredTimeZone.Singapore]: {
    enumValue: PreferredTimeZone.Singapore,
    key: 'Singapore',
    displayName: 'Singapore, Hong Kong, Beijing (Singapore / China Time)',
    iana: 'Asia/Singapore',
    offsetLabel: 'UTC+08:00',
  },
  [PreferredTimeZone.Tokyo]: {
    enumValue: PreferredTimeZone.Tokyo,
    key: 'Tokyo',
    displayName: 'Tokyo, Seoul (Japan / Korea Time)',
    iana: 'Asia/Tokyo',
    offsetLabel: 'UTC+09:00',
  },
  [PreferredTimeZone.Sydney]: {
    enumValue: PreferredTimeZone.Sydney,
    key: 'Sydney',
    displayName: 'Sydney, Melbourne (Australian Eastern Time)',
    iana: 'Australia/Sydney',
    offsetLabel: 'UTC+10:00 / +11:00',
  },
  [PreferredTimeZone.Auckland]: {
    enumValue: PreferredTimeZone.Auckland,
    key: 'Auckland',
    displayName: 'Auckland, Wellington (New Zealand Time)',
    iana: 'Pacific/Auckland',
    offsetLabel: 'UTC+12:00 / +13:00',
  },
};

export function getTimeZoneDefinition(timeZone: PreferredTimeZone | string | number | undefined | null): TimeZoneDefinition {
  if (timeZone === undefined || timeZone === null) {
    return TIME_ZONE_DEFINITIONS[PreferredTimeZone.Utc];
  }

  // If number
  if (typeof timeZone === 'number' && timeZone in TIME_ZONE_DEFINITIONS) {
    return TIME_ZONE_DEFINITIONS[timeZone as PreferredTimeZone];
  }

  // If string key (e.g. "CentralEuropean" or "Utc")
  if (typeof timeZone === 'string') {
    const numeric = Number(timeZone);
    if (!isNaN(numeric) && numeric in TIME_ZONE_DEFINITIONS) {
      return TIME_ZONE_DEFINITIONS[numeric as PreferredTimeZone];
    }

    const match = Object.values(TIME_ZONE_DEFINITIONS).find(
      (def) =>
        def.key.toLowerCase() === timeZone.toLowerCase() ||
        def.iana.toLowerCase() === timeZone.toLowerCase() ||
        def.displayName.toLowerCase().includes(timeZone.toLowerCase())
    );
    if (match) {
      return match;
    }
  }

  return TIME_ZONE_DEFINITIONS[PreferredTimeZone.Utc];
}
