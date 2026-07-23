import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@ramseysdigital.com';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'Admin123!';

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: passwordHash,
      role: 'ADMIN',
      name: 'Ramseys Admin',
    },
    create: {
      email: adminEmail,
      password: passwordHash,
      role: 'ADMIN',
      name: 'Ramseys Admin',
    },
  });

  const demoPosts = [
    {
      title: 'Sécuriser votre architecture réseau en 5 points',
      slug: 'securiser-votre-architecture-reseau-en-5-points',
      excerpt: 'Un checklist rapide pour réduire les risques sur vos infrastructures critiques.',
      content: '# Sécuriser votre architecture réseau\n\n1. Isoler les segments sensibles\n2. Renforcer les accès\n3. Auditor les flux\n4. Surveiller en continu\n5. Documenter les procédures',
      published: true,
      coverImageUrl: '',
    },
    {
      title: 'Pourquoi les sauvegardes doivent être testées',
      slug: 'pourquoi-les-sauvegardes-doivent-etre-testees',
      excerpt: 'La restauration est souvent la vraie mesure de fiabilité d’un plan de reprise.',
      content: '# Sauvegardes à tester\n\nLes sauvegardes ne valent rien si elles ne sont pas restaurables.',
      published: true,
      coverImageUrl: '',
    },
    {
      title: 'Mise à jour des postes : bonnes pratiques',
      slug: 'mise-a-jour-des-postes-bonnes-pratiques',
      excerpt: 'Une approche simple pour limiter les impacts sur les équipes techniques.',
      content: '# Mise à jour des postes\n\nPlanifiez, testez puis déployez en petites vagues.',
      published: false,
      coverImageUrl: '',
    },
  ];

  for (const post of demoPosts) {
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: {
        ...post,
        authorId: admin.id,
      },
      create: {
        ...post,
        authorId: admin.id,
      },
    });
  }

  console.log('Seeding completed with default admin account:', adminEmail);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
