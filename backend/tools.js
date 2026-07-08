export const chatbotTools = [{
    functionDeclarations: [
        {
            name: 'track_container',
            description: 'Get the live status of a shipping container. Trigger this ONLY when the user provides a container ID.',
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
            description: 'Save user details to the database when they want a quote or contact sales.',
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
            status: 'Cleared Customs - Ready for Pickup',
            location: 'SDRS Dammam Bonded Zone',
            last_updated: new Date().toISOString(),
            vat_status: '0% VAT Until Final Clearance'
        };
    }

    if (name === 'capture_lead') {
        return {
            success: true,
            message: 'Lead saved successfully. The SDRS sales team has been notified.'
        };
    }

    return { error: 'Unknown function' };
};
