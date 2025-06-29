const products = [
  {
    id: 1,
    title: 'Classic Notebook',
    description: 'A beautiful, cream-colored notebook for your daily notes.',
    price: 10,
    originalPrice: 15,
    image: 'https://placehold.co/200x200/FAF8F5/1C3D37?text=Notebook',
    images: [
      'https://placehold.co/400x400/FAF8F5/1C3D37?text=Notebook+1',
      'https://placehold.co/400x400/FAF8F5/1C3D37?text=Notebook+2',
      'https://placehold.co/400x400/FAF8F5/1C3D37?text=Notebook+3',
    ],
    category: 'Notepads',
    bestSeller: true,
  },
  {
    id: 2,
    title: 'Sticker Pack',
    description: 'Fun and colorful stickers for planners and journals.',
    price: 5,
    originalPrice: 8,
    image: 'https://placehold.co/200x200/FAF8F5/1C3D37?text=Stickers',
    images: [
      'https://placehold.co/400x400/FAF8F5/1C3D37?text=Stickers+1',
      'https://placehold.co/400x400/FAF8F5/1C3D37?text=Stickers+2',
    ],
    category: 'Stickers',
    bestSeller: true,
  },
  {
    id: 3,
    title: 'Gift Box',
    description: 'A curated box with planner essentials.',
    price: 25,
    originalPrice: 30,
    image: 'https://placehold.co/200x200/FAF8F5/1C3D37?text=Box',
    images: ['https://placehold.co/400x400/FAF8F5/1C3D37?text=Box+1'],
    category: 'Boxes',
    bestSeller: false,
  },
  {
    id: 4,
    title: 'Minimal Planner',
    description: 'A minimal, elegant planner for productivity.',
    price: 15,
    originalPrice: 20,
    image: 'https://placehold.co/200x200/FAF8F5/1C3D37?text=Planner',
    images: [
      'https://placehold.co/400x400/FAF8F5/1C3D37?text=Planner+1',
      'https://placehold.co/400x400/FAF8F5/1C3D37?text=Planner+2',
    ],
    category: 'Planners',
    bestSeller: true,
  },
];

export default products;
