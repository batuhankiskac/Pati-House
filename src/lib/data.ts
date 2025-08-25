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
    status: 'Bekliyor' | 'Onaylandı' | 'Reddedildi';
};

export const cats: Cat[] = [
  {
    id: 1,
    name: 'Bıyık',
    breed: 'Maine Coon',
    age: 3,
    gender: 'Male',
    description: 'Bıyık, altın gibi bir kalbi olan nazik bir devdir. Kucaklaşmayı, tüy oyuncaklarla oynamayı ve pencereden kuşları izlemeyi çok sever. Diğer kedilerle iyi anlaşır ve mükemmel bir aile dostu olur.',
    image: 'https://placehold.co/600x600.png',
    dataAiHint: 'maine coon cat'
  },
  {
    id: 2,
    name: 'Luna',
    breed: 'Siamese',
    age: 1,
    gender: 'Female',
    description: 'Luna, ilgi odağı olmayı seven konuşkan ve zeki bir Siyam kedisidir. Çok aktiftir, kedi ağaçlarına tırmanmaktan hoşlanır ve gün boyu sizinle mutlu bir şekilde sohbet eder.',
    image: 'https://placehold.co/600x600.png',
    dataAiHint: 'siamese cat'
  },
  {
    id: 3,
    name: 'Oliver',
    breed: 'British Shorthair',
    age: 5,
    gender: 'Male',
    description: "Oliver, pelüş, mavi-gri kürküyle sakin ve ağırbaşlı bir kedidir. Güneş ışığında kestirmekten ve sakin akşamlardan hoşlanan uysal bir arkadaştır. İlk başta biraz utangaçtır ama çabuk alışır.",
    image: 'https://placehold.co/600x600.png',
    dataAiHint: 'british shorthair cat'
  },
  {
    id: 4,
    name: 'Cleo',
    breed: 'Bengal',
    age: 2,
    gender: 'Female',
    description: "Cleo, vahşi bir görünüme ve oyuncu bir kişiliğe sahip çarpıcı bir Bengal kedisidir. Enerji doludur, interaktif oyuncakları sever ve onu eğlendirebilecek bir yuvaya ihtiyacı vardır. Çok akıllıdır ve numaralar öğretilebilir.",
    image: 'https://placehold.co/600x600.png',
    dataAiHint: 'bengal cat'
  },
  {
    id: 5,
    name: 'Simba',
    breed: 'Persian',
    age: 4,
    gender: 'Male',
    description: "Simba, lüks uzun tüyleri olan görkemli bir İran kedisidir. Sakin bir ortamı tercih eden tatlı ve sessiz bir ruhtur. Kürkünün en iyi şekilde görünmesi için düzenli tüy bakımına ihtiyacı vardır.",
    image: 'https://placehold.co/600x600.png',
    dataAiHint: 'persian cat white'
  },
  {
    id: 6,
    name: 'Nala',
    breed: 'Ragdoll',
    age: 2,
    gender: 'Female',
    description: 'Nala, kucağınıza aldığınızda mutluluktan gevşeyen klasik bir Ragdoll kedisidir. İnanılmaz derecede sevgi doludur, kucakta tutulmayı sever ve insanlarını bir köpek yavrusu gibi evin içinde takip eder.',
    image: 'https://placehold.co/600x600.png',
    dataAiHint: 'ragdoll cat blue eyes'
  },
  {
    id: 7,
    name: 'Milo',
    breed: 'Scottish Fold',
    age: 0.5,
    gender: 'Male',
    description: "Milo, en sevimli kıvrık kulaklara sahip, tapılası bir Scottish Fold yavrusudur. Meraklı, oyuncu ve hareket eden her şeye atlamayı sever. Birlikte büyüyebileceği bir aile arıyor.",
    image: 'https://placehold.co/600x600.png',
    dataAiHint: 'scottish fold kitten'
  },
  {
    id: 8,
    name: 'Zoe',
    breed: 'Siamese',
    age: 8,
    gender: 'Female',
    description: "Zoe, sakin bir emeklilik yuvası arayan tatlı, yaşlı bir Siyam kedisidir. Çok naziktir, sıcak kucakları sever ve huzurlu bir yaşamdan memnundur. Verecek çok sevgisi var.",
    image: 'https://placehold.co/600x600.png',
    dataAiHint: 'old siamese cat'
  }
];


export const adoptionRequests: AdoptionRequest[] = [
    { id: 1, catName: 'Simba', requestDate: '2024-05-15', status: 'Onaylandı' },
    { id: 2, catName: 'Milo', requestDate: '2024-06-01', status: 'Bekliyor' },
    { id: 3, catName: 'Bıyık', requestDate: '2024-04-20', status: 'Reddedildi' },
];
