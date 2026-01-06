require('dotenv').config();
const mongoose = require('mongoose');
const Item = require('../models/clothingItem');

mongoose.set('strictQuery', false);

const MONGODB_URI = process.env.MONGODB_URI;
const BASE_URL = process.env.BASE_URL;

const defaultItems = [
  { seedId: 'cap-hot', name: 'Cap', weather: 'hot', file: 'Cap.png' },
  {
    seedId: 'hoodie-warm',
    name: 'Hoodie',
    weather: 'warm',
    file: 'Hoodie.png',
  },
  {
    seedId: 'jacket-cold',
    name: 'Jacket',
    weather: 'cold',
    file: 'Jacket.png',
  },
  {
    seedId: 'sneakers-warm',
    name: 'Sneakers',
    weather: 'warm',
    file: 'Sneakers.png',
  },
  {
    seedId: 'tshirt-hot',
    name: 'T-Shirt',
    weather: 'hot',
    file: 'T-Shirt.png',
  },
  { seedId: 'coat-cold', name: 'Coat', weather: 'cold', file: 'Coat.png' },
].map((it) => ({
  seedId: it.seedId,
  name: it.name,
  weather: it.weather,
  imageUrl: `${BASE_URL}/assets/default-items/${it.file}`,
}));

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);

    for (const item of defaultItems) {
      await Item.updateOne(
        { seedId: item.seedId },
        {
          $setOnInsert: {
            ...item,
            isDefault: true,
          },
        },
        { upsert: true }
      );
    }

    console.log('✅ Default clothing items seeded successfully');
  } catch (err) {
    console.error('❌ Seed failed:', err);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
