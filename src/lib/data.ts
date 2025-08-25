export type Cat = {
  id: number;
  name: string;
  breed: string;
  age: number; // in years
  gender: 'Male' | 'Female';
  description: string;
  image: string;
  dataAiHint: string;
};

export type User = {
    name: string;
    email: string;
    avatar: string;
};

export type AdoptionRequest = {
    id: number;
    catName: string;
    requestDate: string;
    status: 'Pending' | 'Approved' | 'Rejected';
};

export const cats: Cat[] = [
  {
    id: 1,
    name: 'Whiskers',
    breed: 'Maine Coon',
    age: 3,
    gender: 'Male',
    description: 'Whiskers is a gentle giant with a heart of gold. He loves to cuddle, play with feather toys, and watch birds from the window. He gets along well with other cats and would make a perfect family companion.',
    image: 'https://placehold.co/600x600.png',
    dataAiHint: 'maine coon cat'
  },
  {
    id: 2,
    name: 'Luna',
    breed: 'Siamese',
    age: 1,
    gender: 'Female',
    description: 'Luna is a talkative and intelligent Siamese who loves to be the center of attention. She is very active, enjoys climbing cat trees, and will happily engage you in conversation all day long.',
    image: 'https://placehold.co/600x600.png',
    dataAiHint: 'siamese cat'
  },
  {
    id: 3,
    name: 'Oliver',
    breed: 'British Shorthair',
    age: 5,
    gender: 'Male',
    description: "Oliver is a calm and dignified cat with a plush, blue-gray coat. He's an easygoing companion who enjoys napping in sunbeams and quiet evenings. He is a bit shy at first but warms up quickly.",
    image: 'https://placehold.co/600x600.png',
    dataAiHint: 'british shorthair cat'
  },
  {
    id: 4,
    name: 'Cleo',
    breed: 'Bengal',
    age: 2,
    gender: 'Female',
    description: "Cleo is a stunning Bengal with a wild look and a playful personality. She's full of energy, loves interactive toys, and needs a home that can keep her entertained. She is very smart and can be taught tricks.",
    image: 'https://placehold.co/600x600.png',
    dataAiHint: 'bengal cat'
  },
  {
    id: 5,
    name: 'Simba',
    breed: 'Persian',
    age: 4,
    gender: 'Male',
    description: "Simba is a majestic Persian with a luxurious long coat. He is a sweet and quiet soul who prefers a calm environment. He requires regular grooming to keep his fur looking its best.",
    image: 'https://placehold.co/600x600.png',
    dataAiHint: 'persian cat white'
  },
  {
    id: 6,
    name: 'Nala',
    breed: 'Ragdoll',
    age: 2,
    gender: 'Female',
    description: 'Nala is a classic Ragdoll who goes limp with happiness when you pick her up. She is incredibly affectionate, loves being held, and follows her humans around the house like a puppy.',
    image: 'https://placehold.co/600x600.png',
    dataAiHint: 'ragdoll cat blue eyes'
  },
  {
    id: 7,
    name: 'Milo',
    breed: 'Scottish Fold',
    age: 0.5,
    gender: 'Male',
    description: "Milo is an adorable Scottish Fold kitten with the cutest folded ears. He's curious, playful, and loves to pounce on anything that moves. He's looking for a family to grow up with.",
    image: 'https://placehold.co/600x600.png',
    dataAiHint: 'scottish fold kitten'
  },
  {
    id: 8,
    name: 'Zoe',
    breed: 'Siamese',
    age: 8,
    gender: 'Female',
    description: "Zoe is a sweet senior Siamese looking for a quiet retirement home. She is very gentle, loves warm laps, and is content with a peaceful life. She has a lot of love left to give.",
    image: 'https://placehold.co/600x600.png',
    dataAiHint: 'old siamese cat'
  }
];


export const adoptionRequests: AdoptionRequest[] = [
    { id: 1, catName: 'Simba', requestDate: '2024-05-15', status: 'Approved' },
    { id: 2, catName: 'Milo', requestDate: '2024-06-01', status: 'Pending' },
    { id: 3, catName: 'Whiskers', requestDate: '2024-04-20', status: 'Rejected' },
];
