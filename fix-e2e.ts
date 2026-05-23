const fs = require('fs');
const glob = require('glob');

const files = glob.sync('apps/api/test/e2e/*.e2e-spec.ts');
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes("app.setGlobalPrefix('v1')")) {
    content = content.replace(
      'app = moduleFixture.createNestApplication();',
      "app = moduleFixture.createNestApplication();\n    app.setGlobalPrefix('v1');"
    );
    fs.writeFileSync(file, content);
  }
}
