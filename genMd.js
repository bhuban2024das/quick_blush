const fs = require('fs');
const apis = require('./quick_blush_apis.json');

let md = "# Quick Blush - Full API List\n\n";
md += "Here is the comprehensive list of backend APIs you can use for the Flutter app. You can import testing requests directly via `quick_blush_postman_collection.json` inside the root of your project directory.\n\n";

// Group by tags
const groups = {};
for (const [path, methods] of Object.entries(apis)) {
  for (const [method, details] of Object.entries(methods)) {
    const tag = (details.tags && details.tags.length > 0) ? details.tags[0] : "Default";
    if (!groups[tag]) groups[tag] = [];
    groups[tag].push({ path, method, details });
  }
}

for (const [tag, items] of Object.entries(groups)) {
  md += `## ${tag}\n`;
  for (const { path, method, details } of items) {
    let auth = "None";
    if (details.security && details.security.length > 0) {
        auth = Object.keys(details.security[0]).join(', ');
    }
    
    md += `- **${method.toUpperCase()}** \`${path}\`\n`;
    md += `  - Summary: ${details.summary || 'N/A'}\n`;
    md += `  - Auth Required: \`${auth}\`\n\n`;
  }
}

fs.writeFileSync("C:/Users/hp/.gemini/antigravity/brain/07609cd7-10e0-49e6-ba05-55ece6f46312/api_list.md", md, "utf8");
// console.log(md);
