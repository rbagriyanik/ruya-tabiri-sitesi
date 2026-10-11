const express = require('express');
const path = require('path');
const { OpenAI } = require('openai');

const app = express();
const PORT = process.env.PORT || 3000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/ruya-tabir', async (req, res) => {
  try {
    const { ruyaMetni, ruhHali } = req.body;

    if (!ruyaMetni || ruyaMetni.trim().length < 10) {
      return res.status(400).json({ error: 'Lütfen rüyanızı en az birkaç cümle ile detaylı açıklayın.' });
    }

    const prompt = `Sen uzman bir rüya tabircisi ve psikolojik rüya analistisin. Kullanıcının gördüğü rüyayı hem geleneksel sembolizm (İslami/Doğu mitolojisi) hem de modern psikolojik (Jung/Freud arketipleri) bakış açısıyla analiz et.
    
Rüya Metni: "${ruyaMetni}"
Rüyadaki Baskın Duygu/Ruh Hali: "${ruhHali || 'Nötr'}"

Lütfen yanıtı şu başlıklarla son derece şık, akıcı ve moral verici bir dille düzenle:
1. 🔮 **Genel Rüya Özeti & Ana Semboller**
2. 🧠 **Psikolojik & Bilinçaltı Analizi**
3. 📜 **Geleneksel & Manevi Yorum**
4. 💡 **Geleceğe Dair Tavsiyeler & Rehberlik**`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    const tabir = completion.choices[0].message.content;
    res.json({ success: true, tabir });

  } catch (error) {
    console.error('OpenAI Hata:', error);
    res.status(500).json({ error: 'Rüya analizi yapılırken bir hata oluştu.' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
