export default async function handler(req, res) {
  // Akceptujemy tylko zapytania typu POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Metoda niedozwolona' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: 'Brak polecenia (promptu)' });
  }

  try {
    // Uderzamy do superszybkiego modelu FLUX.1 [schnell] na Fal.ai
    const response = await fetch('https://fal.run/fal-ai/flux/schnell', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.FAL_KEY}`, // Pobieramy klucz z sejfu Vercela
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: prompt,
        image_size: "square_hd",
        num_inference_steps: 4, // Magia wersji 'schnell' - tylko 4 kroki!
        num_images: 1,
        enable_safety_checker: true
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Błąd Fal.ai: ${errorData}`);
    }

    const data = await response.json();
    
    // Odsyłamy gotowy link do obrazka z powrotem do Twojej strony
    res.status(200).json({ imageUrl: data.images[0].url });

  } catch (error) {
    console.error("Błąd podczas łączenia z Fal:", error);
    res.status(500).json({ message: 'Wystąpił błąd serwera podczas generowania obrazu.' });
  }
}
