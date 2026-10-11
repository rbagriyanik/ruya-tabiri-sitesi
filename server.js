const express = require('express');
const path = require('path');
const fs = require('fs');
const { OpenAI } = require('openai');

const app = express();
const PORT = process.env.PORT || 3000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(express.json());

// Statik dosyaları hem ana dizinden hem de public klasöründen sun
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'public')));

// Yapay Zeka Rüya Tabiri Endpoint'i
app.post('/api/ruya-tabir', async (req, res) => {
  try {
    const { ruyaMetni, ruhHali } = req.body;

    if (!ruyaMetni || ruyaMetni.trim().length < 10) {
      return res.status(400).json({ error: 'Lütfen rüyanızı en az birkaç cümle ile açıklayın.' });
    }

    const prompt = `Sen uzman bir rüya tabircisi ve psikolojik rüya analistisin. Kullanıcının gördüğü rüyayı hem geleneksel sembolizm hem de modern psikolojik açıdan analiz et.
    
Rüya Metni: "${ruyaMetni}"
Rüyadaki Duygu: "${ruhHali || 'Nötr'}"

Lütfen yanıtı şu başlıklarla düzenle:
1. 🔮 **Genel Rüya Özeti & Ana Semboller**
2. 🧠 **Psikolojik & Bilinçaltı Analizi**
3. 📜 **Geleneksel & Manevi Yorum**
4. 💡 **Geleceğe Dair Tavsiyeler & Rehberlik**`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    res.json({ success: true, tabir: completion.choices[0].message.content });

  } catch (error) {
    console.error('OpenAI Hata:', error);
    res.status(500).json({ error: 'Rüya analizi yapılırken bir hata oluştu.' });
  }
});

// Ana sayfa yönlendirmesi
app.get('*', (req, res) => {
  const rootIndexPath = path.join(__dirname, 'index.html');
  const publicIndexPath = path.join(__dirname, 'public', 'index.html');

  if (fs.existsSync(rootIndexPath)) {
    res.sendFile(rootIndexPath);
  } else if (fs.existsSync(publicIndexPath)) {
    res.sendFile(publicIndexPath);
  } else {
    res.status(404).send('index.html bulunamadı.');
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
