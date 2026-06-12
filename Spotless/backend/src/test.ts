import prisma from "./utils/prisma";

async function test() {
  const users = await prisma.user.findMany();

  console.log(users);
}

test()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });