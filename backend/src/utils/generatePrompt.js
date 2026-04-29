// ============================================
// CodeMentor AI — Prompt Generator Utility
// ============================================

/**
 * Builds a structured prompt for the AI model based on the user's
 * code, selected language, and desired action.
 *
 * @param {string} code     – The source code to analyze
 * @param {string} language – Programming language of the code
 * @param {string} action   – One of: explain | debug | optimize | convert
 * @returns {string} – The formatted prompt string
 */
function generatePrompt(code, language, action) {
  const prompts = {
    explain: `You are an expert ${language} developer and teacher. Explain the following ${language} code in detail.
Break down each section, describe what it does, mention any algorithms, design patterns, or important concepts used.
Use clear headings and bullet points for readability.

\`\`\`${language}
${code}
\`\`\``,

    debug: `You are an expert ${language} developer and code reviewer. Analyze the following ${language} code for bugs, errors, edge cases, and potential issues.
For each issue found:
1. Describe the problem clearly
2. Explain why it's a problem
3. Provide the corrected code

If no bugs are found, confirm the code is correct and suggest any improvements.

\`\`\`${language}
${code}
\`\`\``,

    optimize: `You are an expert ${language} developer focused on performance and best practices. Optimize the following ${language} code for:
- Better performance and time/space complexity
- Improved readability and maintainability
- Adherence to ${language} best practices and conventions

Provide the optimized code with clear explanations of each change made.

\`\`\`${language}
${code}
\`\`\``,

    convert: `You are a polyglot programmer fluent in all major languages. Convert the following ${language} code into the other three languages from this set: Python, JavaScript, Java, C++.
For each conversion:
- Write idiomatic code in the target language
- Preserve the original logic and behavior
- Add brief comments explaining language-specific differences

Original ${language} code:
\`\`\`${language}
${code}
\`\`\``,
  };

  return prompts[action] || prompts.explain;
}

module.exports = { generatePrompt };
