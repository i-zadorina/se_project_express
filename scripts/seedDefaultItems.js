require('dotenv').config();
const mongoose = require('mongoose');
const Item = require('../models/clothingItem');

const { MONGODB_URI } = require('../utils/config');

const defaultItems = [
  {
    seedId: 'cap-hot',
    name: 'Cap',
    weather: 'hot',
    imageUrl: 'https://wtwr.net/images/defaultClothes/Cap.png',
  },
  {
    seedId: 'hoodie-warm',
    name: 'Hoodie',
    weather: 'warm',
    imageUrl: 'https://wtwr.net/images/defaultClothes/Hoodie.png',
  },
  {
    seedId: 'jacket-cold',
    name: 'Jacket',
    weather: 'cold',
    imageUrl: 'https://wtwr.net/images/defaultClothes/Jacket.png',
  },
  {
    seedId: 'sneakers-warm',
    name: 'Sneakers',
    weather: 'warm',
    imageUrl: 'https://wtwr.net/images/defaultClothes/Sneakers.png',
  },
  {
    seedId: 'tshirt-warm',
    name: 'T-Shirt',
    weather: 'hot',
    imageUrl: 'https://wtwr.net/images/defaultClothes/T-Shirt.png',
  },
  {
    seedId: 'coat-cold',
    name: 'Coat',
    weather: 'cold',
    imageUrl: 'https://wtwr.net/images/defaultClothes/Coat.png',
  },
];

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
