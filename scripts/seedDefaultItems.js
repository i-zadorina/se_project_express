require('dotenv').config();
const mongoose = require('mongoose');
const Item = require('../models/clothingItem');

mongoose.set('strictQuery', false);

const MONGODB_URI = process.env.MONGODB_URI;
const BASE_URL = (process.env.BASE_URL || '').replace(/\/+$/, '');

if (!MONGODB_URI) throw new Error('MONGODB_URI is missing');
if (!BASE_URL) throw new Error('BASE_URL is missing');

const defaultItems = [
  { seedId: 'cap-hot', name: 'Cap', weather: 'hot', file: 'Cap.png' },
  { seedId: 'boot-hot', name: 'Boot', weather: 'cold', file: 'Boot.png' },
  { seedId: 'scarf-hot', name: 'Scarf', weather: 'cold', file: 'Scarf.png' },
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
  isDefault: true,
}));

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);

    await Item.deleteMany({
      isDefault: true,
      $or: [{ seedId: { $exists: false } }, { seedId: null }],
    });

    for (const item of defaultItems) {
      await Item.updateOne(
        { seedId: item.seedId },
        { $set: item },
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
