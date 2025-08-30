// seed-data.ts
async function seedData() {
  console.log('Seeding data...');

  // Hardcoded kedi verisi
  const catData = {
    name: "Mırnav",
    breed: "Van Kedisi",
    age: 2,
    gender: "Female",
    description: "Çok sevimli ve oyun sever bir Van Kedisi. Yeni sahibini arıyor.",
    image: "/cats/cat1.jpg", // public klasöründeki görsel
    dataAiHint: "Van Kedisi, sevimli, oyun sever"
  };

  // Hardcoded başvuru verisi
  const requestData = {
    catName: "Mırnav", // Kedinin adı
    fullName: "Ahmet Yılmaz",
    email: "ahmet@example.com",
    phone: "0555 123 45 67",
    address: "İstanbul, Türkiye",
    reason: "Çocuklarımız için sevimli bir arkadaş istiyoruz. Mırnav'ın çok sevimli olduğunu duydum."
  };

  try {
    // Geliştirme sunucusunun adresini al
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = process.env.VERCEL_URL ? process.env.VERCEL_URL : 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;

    // Kedi ekle
    const catRes = await fetch(`${baseUrl}/api/cats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(catData),
    });

    if (catRes.ok) {
      const catResult = await catRes.json();
      console.log('Kedi eklendi:', catResult.data);
      
      // Başvuru ekle
      const requestRes = await fetch(`${baseUrl}/api/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (requestRes.ok) {
        const requestResult = await requestRes.json();
        console.log('Başvuru eklendi:', requestResult.data);
      } else {
        console.error('Başvuru eklenirken hata oluştu:', await requestRes.text());
      }
    } else {
      console.error('Kedi eklenirken hata oluştu:', await catRes.text());
    }
  } catch (error) {
    console.error('Veri eklenirken hata oluştu:', error);
  }

  console.log('Seeding completed.');
}

// Script'i çalıştır
seedData();