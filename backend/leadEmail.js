import nodemailer from 'nodemailer';

const LEAD_TO = process.env.CHAT_LEAD_TO || 'commercial@sdrs.com.sa';
const LEAD_FROM = process.env.CHAT_LEAD_FROM || 'Fares <it_support@sdrs.com.sa>';

function decodeEnv(value) {
    return String(value || '')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&amp;/gi, '&')
        .trim();
}

function leadFromAddress() {
    const user = decodeEnv(process.env.SMTP_USER);
    const configured = decodeEnv(process.env.CHAT_LEAD_FROM || LEAD_FROM);
    if (user && configured.toLowerCase().includes(user.toLowerCase())) return configured;
    if (user) return `Fares <${user}>`;
    return configured;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function digitsOnly(value) {
    return String(value || '').replace(/\D/g, '');
}

export function validateLeadPayload(body) {
    const name = String(body?.name || '').trim();
    const company = String(body?.company || '').trim();
    const phone = String(body?.phone || '').trim();
    const email = String(body?.email || '').trim().toLowerCase();
    const website = String(body?.website || '').trim();
    const language = body?.language === 'ar' ? 'ar' : 'en';
    const transcript = Array.isArray(body?.transcript) ? body.transcript : [];

    if (website) {
        return { valid: false, status: 400, error: 'Invalid request.' };
    }
    if (name.length < 2 || name.length > 80) {
        return { valid: false, status: 400, error: 'Please enter your full name.' };
    }
    if (company.length < 2 || company.length > 120) {
        return { valid: false, status: 400, error: 'Please enter a company name.' };
    }
    if (!EMAIL_RE.test(email) || email.length > 160) {
        return { valid: false, status: 400, error: 'Please enter a valid email.' };
    }
    const phoneDigits = digitsOnly(phone);
    if (phoneDigits.length < 8 || phoneDigits.length > 15) {
        return { valid: false, status: 400, error: 'Please enter a valid mobile number.' };
    }
    if (transcript.length > 40) {
        return { valid: false, status: 413, error: 'Conversation is too long to send.' };
    }

    const cleanTranscript = transcript.slice(0, 40).map((row) => ({
        role: row?.role === 'user' ? 'user' : 'bot',
        text: String(row?.text || '').replace(/<[^>]*>/g, '').slice(0, 2000)
    })).filter((row) => row.text.trim());

    if (cleanTranscript.length === 0) {
        return { valid: false, status: 400, error: 'There is no conversation to send yet.' };
    }

    return {
        valid: true,
        lead: { name, company, phone, email, language, transcript: cleanTranscript }
    };
}

export function buildLeadEmail(lead) {
    const lines = lead.transcript.map((row) => {
        const who = row.role === 'user' ? 'Visitor' : 'Fares';
        return `${who}: ${row.text}`;
    });
    const subject = `Fares callback: ${lead.name}, ${lead.company}`;
    const text = [
        'A visitor asked Fares for a callback from the commercial team.',
        '',
        `Name: ${lead.name}`,
        `Company: ${lead.company}`,
        `Mobile: ${lead.phone}`,
        `Email: ${lead.email}`,
        `Language: ${lead.language === 'ar' ? 'Arabic' : 'English'}`,
        `Time: ${new Date().toISOString()}`,
        '',
        'Conversation:',
        ...lines
    ].join('\n');
    return {
        to: decodeEnv(process.env.CHAT_LEAD_TO) || LEAD_TO,
        from: leadFromAddress(),
        replyTo: lead.email,
        subject,
        text
    };
}

export function isLeadEmailConfigured() {
    return Boolean(
        process.env.RESEND_API_KEY
        || (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
    );
}

export async function sendLeadEmail(lead) {
    const payload = buildLeadEmail(lead);

    if (process.env.RESEND_API_KEY) {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: payload.from,
                to: [payload.to],
                reply_to: payload.replyTo,
                subject: payload.subject,
                text: payload.text
            })
        });
        if (!response.ok) {
            const detail = await response.text().catch(() => '');
            throw new Error(`Resend rejected the email (${response.status}) ${detail}`.trim());
        }
        return { sent: true, via: 'resend' };
    }

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        const port = Number(process.env.SMTP_PORT) || 587;
        const transporter = nodemailer.createTransport({
            host: decodeEnv(process.env.SMTP_HOST),
            port,
            secure: process.env.SMTP_SECURE === 'true' || port === 465,
            requireTLS: port === 587,
            auth: {
                user: decodeEnv(process.env.SMTP_USER),
                pass: process.env.SMTP_PASS
            },
            tls: { minVersion: 'TLSv1.2' },
            connectionTimeout: 12000,
            greetingTimeout: 12000,
            socketTimeout: 15000
        });
        try {
            await transporter.sendMail({
                from: payload.from,
                to: payload.to,
                replyTo: payload.replyTo,
                subject: payload.subject,
                text: payload.text,
                envelope: {
                    from: decodeEnv(process.env.SMTP_USER),
                    to: payload.to
                }
            });
        } catch (error) {
            const code = error?.code || error?.responseCode || '';
            const hint = String(error?.response || error?.message || '').slice(0, 240);
            console.error('Chat lead SMTP failed:', code, hint);
            throw error;
        }
        return { sent: true, via: 'smtp' };
    }

    const error = new Error('Chat lead email is not configured.');
    error.status = 503;
    throw error;
}
