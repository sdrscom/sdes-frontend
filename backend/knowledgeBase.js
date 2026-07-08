import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function loadKnowledgeBase() {
    const knowledgeDir = path.join(__dirname, 'knowledge');
    const repoReadmePath = path.resolve(__dirname, '..', 'README.md');

    let systemInstruction = `You are the official AI assistant for SDRS (Saudi Development & Export Services Co. Ltd.).
You operate as a bonded zone and logistics solutions provider based at King Abdulaziz Port in Dammam, Saudi Arabia.
Always format comparisons using clean Markdown tables or bullet points.
Do not guess or hallucinate. If an answer isn't in the context below, politely ask the user for clarification.
Always end your responses with a clear "next step" or quick reply option to guide the user.

=== SYSTEM KNOWLEDGE BASE ===\n\n`;

    try {
        if (!fs.existsSync(knowledgeDir)) {
            fs.mkdirSync(knowledgeDir);
        }

        const files = fs.readdirSync(knowledgeDir);
        let loadedCount = 0;

        files.forEach(file => {
            if (file.endsWith('.md') || file.endsWith('.txt')) {
                const content = fs.readFileSync(path.join(knowledgeDir, file), 'utf-8');
                systemInstruction += `--- START OF ${file} ---\n${content}\n--- END OF ${file} ---\n\n`;
                loadedCount++;
            }
        });

        if (loadedCount === 0 && fs.existsSync(repoReadmePath)) {
            const fallbackContent = fs.readFileSync(repoReadmePath, 'utf-8');
            systemInstruction += `--- START OF README.md (fallback) ---\n${fallbackContent}\n--- END OF README.md (fallback) ---\n\n`;
            loadedCount++;
            console.log(`Loaded README.md as a fallback knowledge source because ${knowledgeDir} contains no .md or .txt files.`);
        }
        console.log(`Loaded ${loadedCount} file(s) into the AI knowledge base.`);
    } catch (error) {
        console.warn('Knowledge directory is empty or missing. Waiting for files...');
    }

    return systemInstruction;
}
