const REPLIES = {
    facilities: {
        en: 'Closed warehouses from 360 to 1,200 m², plus AutoZone, sheds, a cold chamber, chemical storage, and a container yard, on 351,000 m² in King Abdulaziz Port, Dammam. The Facilities page has the current yard sizes.',
        ar: 'مستودعات مغلقة من 360 إلى 1,200 م²، مع أوتوزون وهناجر وغرفة تبريد وتخزين كيماويات وساحات حاويات، على 351,000 م² في ميناء الملك عبدالعزيز بالدمام. مساحات الساحات الحالية على صفحة المرافق.'
    },
    services: {
        en: 'We handle containers, steel and general cargo, vehicles, freight, labour and equipment, and trade work like labeling and palletization, 24/7 in the zone. The Services page has the full list.',
        ar: 'نتعامل مع الحاويات والبضائع العامة والصلب والسيارات والشحن والعمالة والمعدات، وأعمال مثل الترقيم والتغليف، على مدار الساعة في المنطقة. التفاصيل على صفحة الخدمات.'
    },
    investment: {
        en: 'Duty and VAT stay suspended while goods are in the Dammam bonded zone, with on-site customs and 100% foreign ownership. The Investment page walks through lease and setup.',
        ar: 'الرسم والضريبة موقوفة ما دامت البضاعة في منطقة الإيداع بالدمام، مع جمارك في الموقع وملكية أجنبية 100%. صفحة الاستثمار تشرح التأجير والتأسيس.'
    },
    contact: {
        en: 'Call +966 13 813 4200 or email info@sdrs.com.sa. Book an Appointment on the home page if you want a site visit.',
        ar: 'اتصل على 4200 813 13 966+ أو راسل info@sdrs.com.sa. زر Book an Appointment في الصفحة الرئيسية إذا تبي زيارة للموقع.'
    },
    about: {
        en: "I'm Fares, with SDRS, the bonded-zone operator at King Abdulaziz Port, Dammam, since 2000. The About page has leadership and the company story.",
        ar: 'أنا فارس، مع SDRS مشغّل منطقة الإيداع في ميناء الملك عبدالعزيز بالدمام منذ 2000. صفحة عن الشركة فيها القيادة وقصة العمل.'
    },
    track: {
        en: 'I cannot see live shipment status here. Enter the container number on the Track page, or call +966 13 813 4200.',
        ar: 'ما أقدر أشوف حالة الشحنة من هنا. أدخل رقم الحاوية في صفحة التتبع، أو اتصل على 4200 813 13 966+.'
    }
};

function pickLang(message, uiLanguage) {
    return uiLanguage === 'ar' || /[\u0600-\u06FF]/.test(String(message || '')) ? 'ar' : 'en';
}

export function geminiUnavailableReply(uiLanguage) {
    return uiLanguage === 'ar'
        ? 'ما قدرت أكملها من هنا الحين. اتصل على 4200 813 13 966+ أو راسل info@sdrs.com.sa، أو افتح صفحات المرافق والخدمات والاستثمار في الموقع.'
        : "I don't have that on hand just now. Call +966 13 813 4200 or email info@sdrs.com.sa, or open Facilities, Services, or Investment on this site.";
}

export function isVagueFollowUp(message) {
    const value = String(message || '').trim().toLowerCase().replace(/[.!?]+$/, '');
    if (!value || value.length > 32) return false;
    return /^(what|why|and|more|that|this|those|go on|tell me more|and what|what about (it|that|this|them))$/.test(value);
}

export function localFaqReply(message, uiLanguage) {
    const raw = String(message || '').trim();
    if (!raw || raw.length > 80) return null;
    const value = raw.toLowerCase();
    const lang = pickLang(raw, uiLanguage);

    if (/facilit|warehouse|yard|cold store|cold chamber|autozone|مراف|مستودع|ساحات/.test(value)) {
        return REPLIES.facilities[lang];
    }
    if (/service|خدمات/.test(value)) {
        return REPLIES.services[lang];
    }
    if (/invest|lease|why (sdrs|you)|vat|duty|استثمار|تأجير/.test(value)) {
        return REPLIES.investment[lang];
    }
    if (/contact us|phone|email|call you|اتصل|تواصل/.test(value)) {
        return REPLIES.contact[lang];
    }
    if (/^about sdrs$|^about$|who (are you|is sdrs)|عن الشركة|عن sdrs/.test(value)) {
        return REPLIES.about[lang];
    }
    if (/track|container|شحن|تتبع|حاوية/.test(value)) {
        return REPLIES.track[lang];
    }
    return null;
}
