const fs = require('fs');

const schema = `datasource db {
  provider = "postgresql"
  url      = "postgresql://neondb_owner:npg_Ez4vnkC2flcO@ep-gentle-tooth-a150cgbv.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
}

model Test {
  id Int @id @default(autoincrement())
}
`;

fs.writeFileSync('test.prisma', schema, 'utf8');
console.log('File written.');
