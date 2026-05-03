const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src');

const replacements = [
  { from: /text-\[hsl\(232_20%_50%\)\]/g, to: 'text-muted-foreground' },
  { from: /bg-\[hsl\(258_30%_95%\)\]/g, to: 'bg-muted' },
  { from: /border-\[hsl\(258_100%_65%_\/_0\.25\)\]/g, to: 'border-[hsl(258_100%_65%/0.25)]' },
  { from: /border-\[hsl\(258_100%_65%_\/_0\.2\)\]/g, to: 'border-[hsl(258_100%_65%/0.2)]' },
  { from: /border-\[hsl\(258_100%_83%_\/_0\.2\)\]/g, to: 'border-[hsl(258_100%_83%/0.2)]' },
  { from: /border-\[hsl\(258_100%_83%_\/_0\.3\)\]/g, to: 'border-[hsl(258_100%_83%/0.3)]' },
  { from: /focus:border-\[hsl\(258_100%_65%_\/_0\.5\)\]/g, to: 'focus:border-[hsl(258_100%_65%/0.5)]' },
  { from: /focus:border-\[hsl\(258_100%_65%_\/_0\.4\)\]/g, to: 'focus:border-[hsl(258_100%_65%/0.4)]' },
  { from: /hover:border-\[hsl\(258_100%_65%_\/_0\.3\)\]/g, to: 'hover:border-[hsl(258_100%_65%/0.3)]' },
  { from: /bg-\[hsl\(258_100%_65%_\/_0\.1\)\]/g, to: 'bg-[hsl(258_100%_65%/0.1)]' },
  { from: /hover:bg-\[hsl\(258_100%_65%_\/_0\.07\)\]/g, to: 'hover:bg-[hsl(258_100%_65%/0.07)]' },
  { from: /from-\[hsl\(258_100%_65%_\/_0\.08\)\]/g, to: 'from-[hsl(258_100%_65%/0.08)]' },
  { from: /from-\[hsl\(258_100%_65%_\/_0\.07\)\]/g, to: 'from-[hsl(258_100%_65%/0.07)]' },
  { from: /from-\[hsl\(258_100%_65%_\/_0\.15\)\]/g, to: 'from-[hsl(258_100%_65%/0.15)]' },
  { from: /to-\[hsl\(258_100%_65%_\/_0\.05\)\]/g, to: 'to-[hsl(258_100%_65%/0.05)]' },
  { from: /to-\[hsl\(197_100%_84%\)\]/g, to: 'to-primary-blue' },
  { from: /bg-\[hsl\(258_100%_83%_\/_0\.15\)\]/g, to: 'bg-[hsl(258_100%_83%/0.15)]' },
  { from: /bg-\[hsl\(197_100%_84%_\/_0\.15\)\]/g, to: 'bg-[hsl(197_100%_84%/0.15)]' },
  { from: /bg-\[hsl\(232_45%_16%_\/_0\.5\)\]/g, to: 'bg-[hsl(232_45%_16%/0.5)]' },
  { from: /hover:bg-\[hsl\(258_100%_83%_\/_0\.1\)\]/g, to: 'hover:bg-[hsl(258_100%_83%/0.1)]' },
  { from: /hover:bg-\[hsl\(258_100%_83%_\/_0\.12\)\]/g, to: 'hover:bg-[hsl(258_100%_83%/0.12)]' },
  { from: /active:bg-\[hsl\(258_100%_83%_\/_0\.2\)\]/g, to: 'active:bg-[hsl(258_100%_83%/0.2)]' },
  { from: /shadow-\[0_0_6px_hsl\(142_76%_56%_\/_0\.6\)\]/g, to: 'shadow-[0_0_6px_hsl(142_76%_56%/0.6)]' },
  { from: /shadow-\[0_20px_60px_hsl\(258_60%_20%_\/_0\.12\)\]/g, to: 'shadow-[0_20px_60px_hsl(258_60%_20%/0.12)]' },
  { from: /shadow-\[0_4px_20px_hsl\(258_100%_65%_\/_0\.35\)\]/g, to: 'shadow-[0_4px_20px_hsl(258_100%_65%/0.35)]' },
  { from: /shadow-\[0_4px_15px_hsl\(258_100%_65%_\/_0\.3\)\]/g, to: 'shadow-[0_4px_15px_hsl(258_100%_65%/0.3)]' },
  { from: /hover:shadow-\[0_6px_20px_hsl\(258_100%_65%_\/_0\.45\)\]/g, to: 'hover:shadow-[0_6px_20px_hsl(258_100%_65%/0.45)]' },
  { from: /focus:shadow-\[0_0_0_2px_hsl\(258_100%_65%_\/_0\.15\)\]/g, to: 'focus:shadow-[0_0_0_2px_hsl(258_100%_65%/0.15)]' },
  { from: /bg-gradient-to-br/g, to: 'bg-linear-to-br' },
  { from: /bg-gradient-to-r/g, to: 'bg-linear-to-r' },
  { from: /bg-gradient-to-b/g, to: 'bg-linear-to-b' },
  { from: /break-words/g, to: 'wrap-break-word' },
  { from: /bg-\[var\(--gradient-sidebar\)\]/g, to: 'bg-(--gradient-sidebar)' },
  { from: /shadow-\[var\(--shadow-sidebar\)\]/g, to: 'shadow-(--shadow-sidebar)' },
  { from: /w-\[var\(--sidebar-width\)\]/g, to: 'w-(--sidebar-width)' },
  { from: /shadow-\[var\(--shadow-glow\)\]/g, to: 'shadow-(--shadow-glow)' },
  { from: /shadow-\[var\(--shadow-card\)\]/g, to: 'shadow-(--shadow-card)' },
  { from: /h-\[var\(--titlebar-height\)\]/g, to: 'h-(--titlebar-height)' },
  { from: /hover:bg-\[hsl\(232_20%_50%\)\]/g, to: 'hover:bg-muted-foreground' },
  { from: /bg-\[hsl\(0_0%_98%\)\]/g, to: 'bg-secondary' },
  { from: /border-r-\[8px\]/g, to: 'border-r-8' },
  { from: /border-l-\[8px\]/g, to: 'border-l-8' },
  { from: /flex-shrink-0/g, to: 'shrink-0' }
];

function processDir(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      for (const rep of replacements) {
        content = content.replace(rep.from, rep.to);
      }
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDir(dir);
console.log('Done fixing tailwind classes!');
