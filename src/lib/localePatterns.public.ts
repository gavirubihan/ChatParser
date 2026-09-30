// =============================================
// localePatterns.public.ts
// Public fallback for open-source / local builds
// without private decryption key.
// =============================================

export interface PlatformConfig {
    attachment: RegExp;
    omitted: RegExp;
    deleted: RegExp;
    location: RegExp;
    systemContent: RegExp;
}

export interface LocaleConfig {
    label: string;
    android: PlatformConfig;
    ios: PlatformConfig;
    filenamePrefixes: RegExp;
    zipHeuristics: string[];
}

const EN: LocaleConfig = {
    label: 'English',

    android: {
        attachment: /(.+?)\s*\(file attached\)/i,
        omitted: /^(?:(image|video|audio|sticker|gif|document|voice message)\s+omitted|<media omitted>)$/i,
        deleted: /<this message was deleted>|this message was deleted|you deleted this message/i,
        location: /location:\s*https?:\/\//i,
        systemContent: /messages and calls are end-to-end encrypted|default timer for disappearing messages|messages will disappear from this chat|turned (?:on|off) disappearing messages|secured with end-to-end encryption/i,
    },

    ios: {
        attachment: /<attached:\s*(.+?)>/i,
        omitted: /^<media omitted>$/i,
        deleted: /<this message was deleted>|this message was deleted|you deleted this message/i,
        location: /location:\s*https?:\/\//i,
        systemContent: /messages and calls are end-to-end encrypted|default timer for disappearing messages|messages will disappear from this chat|turned (?:on|off) disappearing messages|secured with end-to-end encryption/i,
    },

    filenamePrefixes: /whatsapp chat\s*(?:with|-)|chat with|whatsapp/gi,
    zipHeuristics: ['whatsapp chat', 'whatsapp-chat'],
};

export const LOCALES: Record<string, LocaleConfig> = {
    en: EN,
};

function mergeRegex(...patterns: RegExp[]): RegExp {
    return new RegExp(patterns.map(r => r.source).join('|'), 'i');
}

function mergeRegexGlobal(...patterns: RegExp[]): RegExp {
    return new RegExp(patterns.map(r => r.source).join('|'), 'gi');
}

function allPlatforms(): PlatformConfig[] {
    return Object.values(LOCALES).flatMap(l => [l.android, l.ios]);
}

export const UNIVERSAL: LocaleConfig = {
    label: 'Universal (public fallback)',

    android: {
        attachment: mergeRegex(...Object.values(LOCALES).map(l => l.android.attachment)),
        omitted: mergeRegex(...Object.values(LOCALES).map(l => l.android.omitted)),
        deleted: mergeRegex(...Object.values(LOCALES).map(l => l.android.deleted)),
        location: mergeRegex(...Object.values(LOCALES).map(l => l.android.location)),
        systemContent: mergeRegex(...Object.values(LOCALES).map(l => l.android.systemContent)),
    },

    ios: {
        attachment: mergeRegex(...Object.values(LOCALES).map(l => l.ios.attachment)),
        omitted: mergeRegex(...Object.values(LOCALES).map(l => l.ios.omitted)),
        deleted: mergeRegex(...Object.values(LOCALES).map(l => l.ios.deleted)),
        location: mergeRegex(...Object.values(LOCALES).map(l => l.ios.location)),
        systemContent: mergeRegex(...Object.values(LOCALES).map(l => l.ios.systemContent)),
    },

    filenamePrefixes: mergeRegexGlobal(...Object.values(LOCALES).map(l => l.filenamePrefixes)),
    zipHeuristics: Array.from(new Set(Object.values(LOCALES).flatMap(l => l.zipHeuristics))),
};

export interface FlatPatterns {
    attachment: RegExp;
    omitted: RegExp;
    deleted: RegExp;
    location: RegExp;
    systemContent: RegExp;
}

export const UNIVERSAL_FLAT: FlatPatterns = {
    attachment: mergeRegex(...allPlatforms().map(p => p.attachment)),
    omitted: mergeRegex(...allPlatforms().map(p => p.omitted)),
    deleted: mergeRegex(...allPlatforms().map(p => p.deleted)),
    location: mergeRegex(...allPlatforms().map(p => p.location)),
    systemContent: mergeRegex(...allPlatforms().map(p => p.systemContent)),
};
