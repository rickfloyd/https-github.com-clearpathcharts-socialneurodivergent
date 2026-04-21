import fs from 'fs';

const filePath = 'src/components/Dashboard.tsx';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(/profile\.ui\.bgTop/g, 'profile.bgTop');
content = content.replace(/profile\.ui\.bgBottom/g, 'profile.bgBottom');
content = content.replace(/profile\.ui\.accent/g, 'profile.borderA');
content = content.replace(/profile\.ui\.text/g, 'profile.text');

fs.writeFileSync(filePath, content);
console.log('Replaced profile.ui fields in Dashboard.tsx');
