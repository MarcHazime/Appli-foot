const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const cities = [
  { name: 'Paris', lat: 48.8566, lng: 2.3522 },
  { name: 'Marseille', lat: 43.2965, lng: 5.3698 },
  { name: 'Lyon', lat: 45.7640, lng: 4.8357 },
  { name: 'Toulouse', lat: 43.6047, lng: 1.4442 },
  { name: 'Nice', lat: 43.7102, lng: 7.2620 },
  { name: 'Nantes', lat: 47.2184, lng: -1.5536 },
  { name: 'Strasbourg', lat: 48.5734, lng: 7.7521 },
  { name: 'Montpellier', lat: 43.6108, lng: 3.8767 },
  { name: 'Bordeaux', lat: 44.8378, lng: -0.5792 },
  { name: 'Lille', lat: 50.6292, lng: 3.0573 }
];

async function main() {
  const password = await bcrypt.hash('password123', 10);

  console.log('Start seeding ...');

  for (const city of cities) {
    // Create Club
    const clubEmail = `contact@${city.name.toLowerCase()}.com`;
    const clubName = `FC ${city.name}`;

    await prisma.user.upsert({
      where: { email: clubEmail },
      update: {},
      create: {
        email: clubEmail,
        password,
        role: 'CLUB',
        clubProfile: {
          create: {
            clubName: clubName,
            location: city.name,
            latitude: city.lat,
            longitude: city.lng,
            description: `Le grand club de ${city.name}`,
            level: 'Ligue 1'
          }
        }
      }
    });

    // Create Player
    const playerEmail = `player@${city.name.toLowerCase()}.com`;

    await prisma.user.upsert({
      where: { email: playerEmail },
      update: {},
      create: {
        email: playerEmail,
        password,
        role: 'PLAYER',
        playerProfile: {
          create: {
            firstName: 'Joueur',
            lastName: city.name,
            position: 'Attaquant',
            age: 20 + Math.floor(Math.random() * 10),
            location: city.name,
            latitude: city.lat + 0.01, // Slightly offset
            longitude: city.lng + 0.01,
            bio: `Jeune talent de ${city.name}`
          }
        }
      }
    });
  }

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
