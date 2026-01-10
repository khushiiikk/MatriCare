import { trimesterContent } from './yogaContent.js';
import { dietContent } from './dietContent.js';

export const allContent = {
    yoga: trimesterContent,
    diet: dietContent,
    tips: {
        en: {
            sections: [
                {
                    title: "Traditional Dietary Wisdom",
                    category: "Nourishment",
                    icon: "🥛",
                    tips: [
                        { title: "Kesar Milk (Saffron)", content: "A timeless tradition for vitality. Add 2 strands of pure saffron to warm milk at night for better sleep and digestion.", benefit: "Relaxation & Digestion" },
                        { title: "Tender Coconut Water", content: "Nature's electrolyte. Perfect for staying cool and hydrated throughout the day while providing essential minerals.", benefit: "PH Balance" },
                        { title: "Ahladaka (Soaked Almonds)", content: "Pre-soaked almonds are easier to digest and provide concentrated DHA for the baby's cognitive growth.", benefit: "Brain Power" }
                    ]
                },
                {
                    title: "Mind & Spirit",
                    category: "Wellness",
                    icon: "✨",
                    tips: [
                        { title: "Garbh Sanskar", content: "The art of educating the baby in the womb. Engage in positive reading, calming chants, and soft music daily.", benefit: "Deep Bonding" },
                        { title: "Suryadarshan (Sun Gazing)", content: "Spend time in the gentle morning sun (7 AM - 8 AM) to absorb natural Vitamin D and regulate your circadian rhythm.", benefit: "Bone Health" },
                        { title: "A2 Ghee Wisdom", content: "A spoonful of pure Desi Ghee helps maintain joint flexibility and supports the nervous system during development.", benefit: "Strength" }
                    ]
                }
            ]
        },
        hi: {
            sections: [
                {
                    title: "पारंपरिक आहार ज्ञान",
                    category: "पोषण",
                    icon: "🥛",
                    tips: [
                        { title: "केसर दूध", content: "जीवन शक्ति के लिए एक कालातीत परंपरा। बेहतर नींद और पाचन के लिए रात में गर्म दूध में शुद्ध केसर के 2 धागे मिलाएं।", benefit: "आराम और पाचन" },
                        { title: "नारियल पानी", content: "प्रकृति का इलेक्ट्रोलाइट। आवश्यक खनिज प्रदान करते हुए दिन भर ठंडा और हाइड्रेटेड रहने के लिए उत्तम।", benefit: "पीएच संतुलन" },
                        { title: "भीगे हुए बादाम", content: "पहले से भीगे हुए बादाम पचाने में आसान होते हैं और बच्चे के मानसिक विकास के लिए डीएचए प्रदान करते हैं।", benefit: "मस्तिष्क शक्ति" }
                    ]
                },
                {
                    title: "मन और आत्मा",
                    category: "कल्याण",
                    icon: "✨",
                    tips: [
                        { title: "गर्भ संस्कार", content: "गर्भ में बच्चे को शिक्षित करने की कला। सकारात्मक पढ़ने, शांत मंत्रों और संगीत में संलग्न रहें।", benefit: "गहरा बंधन" },
                        { title: "सूर्यदर्शन", content: "प्राकृतिक विटामिन डी को अवशोषित करने के लिए सुबह की कोमल धूप (7 बजे - 8 बजे) में समय बिताएं।", benefit: "हड्डी स्वास्थ्य" },
                        { title: "घी का ज्ञान", content: "शुद्ध देसी घी की एक चम्मच जोड़ों के लचीलेपन को बनाए रखने और तंत्रिका तंत्र का समर्थन करने में मदद करती है।", benefit: "शक्ति" }
                    ]
                }
            ]
        }
    }
};
