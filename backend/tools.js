export const chatbotTools = [{
    functionDeclarations: [
        {
            name: 'track_container',
            description: 'Use only when the user gives a container or tracking number. This assistant is not connected to a live terminal system. Tell the user to confirm status on the website Track page or by phone. Never invent a status.',
            parameters: {
                type: 'OBJECT',
                properties: {
                    container_id: { type: 'STRING', description: 'The container ID.' }
                },
                required: ['container_id']
            }
        },
        {
            name: 'capture_lead',
            description: 'Use when the user wants a quote or to contact sales and has given a name, email, and inquiry. This does not save a lead. Repeat their details and give the SDRS phone and email. Never say the sales team was already notified.',
            parameters: {
                type: 'OBJECT',
                properties: {
                    name: { type: 'STRING' },
                    email: { type: 'STRING' },
                    inquiry: { type: 'STRING' }
                },
                required: ['name', 'email', 'inquiry']
            }
        }
    ]
}];

export const executeTool = async (name, args) => {
    console.log(`\n[Database Action Triggered] AI called: ${name}`);
    console.log(`[Parameters Provided]:`, args);

    if (name === 'track_container') {
        return {
            container_id: args.container_id,
            live_tracking: false,
            message: 'No live terminal status is available in this assistant. Direct the user to https://www.sdrs.com.sa/track and +966 13 813 4200 with this container number. Do not invent a location or customs status.'
        };
    }

    if (name === 'capture_lead') {
        return {
            saved: false,
            name: args.name,
            email: args.email,
            inquiry: args.inquiry,
            message: 'Do not say this lead was saved. Ask the user to email info@sdrs.com.sa or call +966 13 813 4200 and repeat the inquiry.'
        };
    }

    return { error: 'Unknown function' };
};
