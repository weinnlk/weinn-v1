export const COUNTRIES = [
    { code: 'LK', dial: '94', flag: '🇱🇰' },
    { code: 'US', dial: '1', flag: '🇺🇸' },
    { code: 'GB', dial: '44', flag: '🇬🇧' },
    { code: 'AU', dial: '61', flag: '🇦🇺' },
    { code: 'IN', dial: '91', flag: '🇮🇳' },
    { code: 'JP', dial: '81', flag: '🇯🇵' },
];

export function getDialCodeByIso2(iso2: string) {
    return COUNTRIES.find((c) => c.code === iso2)?.dial ?? '94';
}
