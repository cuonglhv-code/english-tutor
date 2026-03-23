const fs = require('fs');
const path = require('path');

// Re-read demotuvung.html
const htmlPath = path.join(process.cwd(), 'demotuvung.html');
const targetPath = path.join(process.cwd(), 'app', 'vocabulary-challenge', 'page.tsx');

if (!fs.existsSync(htmlPath)) {
    console.error('Source HTML not found');
    process.exit(1);
}

const rawHtml = fs.readFileSync(htmlPath, 'utf8');

// Inject the back button logic - standardizing the replacement
const navHtml = `
                    <nav id="nav-inject" class="relative z-10 flex justify-between items-center mb-6 max-w-4xl mx-auto w-full">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
                                <span class="text-xl font-black">💼</span>
                            </div>
                            <h1 class="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                                VOCABULARY CHALLENGE
                            </h1>
                        </div>
                        <a href="#" 
                           onclick="window.parent.location='/experience'; return false;"
                           style="display:flex;align-items:center;gap:6px;background:rgba(30,41,59,0.8);padding:10px 14px;border-radius:12px;border:1px solid rgba(71,85,105,1);color:#94a3b8;text-decoration:none;font-size:14px;font-weight:700;transition:all 0.2s;"
                           onmouseover="this.style.background='rgba(51,65,85,1)';this.style.color='white'"
                           onmouseout="this.style.background='rgba(30,41,59,0.8)';this.style.color='#94a3b8'">
                          ← Experience
                        </a>
                    </nav>`;

let processedHtml = rawHtml;
if (processedHtml.includes('<nav')) {
    processedHtml = processedHtml.replace(/<nav[\s\S]*?<\/nav>/, navHtml);
} else {
    processedHtml = processedHtml.replace('<body>', '<body>' + navHtml);
}

// Convert to B64
const b64 = Buffer.from(processedHtml).toString('base64');

// BREAK the b64 into chunks of 1000 characters to avoid SWC compiler panic
const chunks = [];
for (let i = 0; i < b64.length; i += 1000) {
    chunks.push(b64.substring(i, i + 1000));
}

// Write the page.tsx file
const templateHead = `'use client'
import { useState, useEffect } from 'react';

/**
 * VOCABULARY CHALLENGE PAGE
 * This page embeds the legacy HTML game via an iframe with srcDoc to bypass CSP.
 * The HTML content is stored as B64 chunks to avoid Next.js/SWC compiler panics during build.
 */
export default function VocabularyChallengePage() {
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    // Reconstruct the b64 from chunks
    const chunks = [
`;

const templateMid = chunks.map(c => `      "${c}"`).join(',\n');

const templateTail = `
    ];
    const raw = atob(chunks.join(''));
    setHtmlContent(raw);
  }, []);

  if (!htmlContent) {
    return (
      <div className="h-screen w-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-900 font-sans">
      <iframe
        srcDoc={htmlContent}
        className="w-full h-full border-0"
        title="Vocabulary Challenge"
        sandbox="allow-scripts allow-same-origin allow-forms"
      />
    </div>
  )
}
`;

fs.writeFileSync(targetPath, templateHead + templateMid + templateTail);
console.log('Successfully created ' + targetPath + ' with chunked B64 to prevent build panic.');
