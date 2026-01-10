import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import './IndianTips.css';

const IndianTips = () => {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const [dynamicContent, setDynamicContent] = useState(null);
    const [loading, setLoading] = useState(true);

    const localContent = {
        en: {
            pageTitle: "Traditional Wellness",
            subtitle: "Authentic Indian wisdom for your pregnancy journey",
            back: "Back",
            focus: "Focus:",
            disclaimer: "Note: These traditional insights are for general well-being. Always consult your obstetrician before starting any new dietary ritual.",
            sections: [
                {
                    title: "Traditional Dietary Wisdom",
                    category: "Nourishment",
                    icon: "🥛",
                    tips: [
                        {
                            title: "Kesar Milk (Saffron)",
                            content: "A timeless tradition for vitality. Add 2 strands of pure saffron to warm milk at night for better sleep and digestion.",
                            benefit: "Relaxation & Digestion"
                        },
                        {
                            title: "Tender Coconut Water",
                            content: "Nature's electrolyte. Perfect for staying cool and hydrated throughout the day while providing essential minerals.",
                            benefit: "PH Balance"
                        },
                        {
                            title: "Ahladaka (Soaked Almonds)",
                            content: "Pre-soaked almonds are easier to digest and provide concentrated DHA for the baby's cognitive growth.",
                            benefit: "Brain Power"
                        }
                    ]
                },
                {
                    title: "Mind & Spirit",
                    category: "Wellness",
                    icon: "✨",
                    tips: [
                        {
                            title: "Garbh Sanskar",
                            content: "The art of educating the baby in the womb. Engage in positive reading, calming chants, and soft music daily.",
                            benefit: "Deep Bonding"
                        },
                        {
                            title: "Suryadarshan (Sun Gazing)",
                            content: "Spend time in the gentle morning sun (7 AM - 8 AM) to absorb natural Vitamin D and regulate your circadian rhythm.",
                            benefit: "Bone Health"
                        },
                        {
                            title: "A2 Ghee Wisdom",
                            content: "A spoonful of pure Desi Ghee helps maintain joint flexibility and supports the nervous system during development.",
                            benefit: "Strength"
                        }
                    ]
                },
                {
                    title: "Prakritik Upchar (Home Remedies)",
                    category: "Home Care",
                    icon: "🌿",
                    tips: [
                        {
                            title: "Adrak-Nimbu Paani",
                            content: "Fresh ginger juice with a dash of honey and lemon is the most effective natural cure for morning nausea.",
                            benefit: "Nausea Relief"
                        },
                        {
                            title: "Saunf (Fennel Seeds)",
                            content: "Chewing roasted fennel seeds after main meals helps in better nutrient absorption and prevents bloating.",
                            benefit: "Metabolism"
                        }
                    ]
                }
            ]
        },
        hi: {
            pageTitle: "पारंपरिक कल्याण",
            subtitle: "आपकी गर्भावस्था यात्रा के लिए प्रामाणिक भारतीय ज्ञान",
            back: "वापस",
            focus: "फोकस:",
            disclaimer: "नोट: ये पारंपरिक जानकारी सामान्य कल्याण के लिए है। कोई भी नया आहार शुरू करने से पहले हमेशा अपने डॉक्टर से सलाह लें।",
            sections: [
                {
                    title: "पारंपरिक आहार ज्ञान",
                    category: "पोषण",
                    icon: "🥛",
                    tips: [
                        {
                            title: "केसर दूध",
                            content: "जीवन शक्ति के लिए एक कालातीत परंपरा। बेहतर नींद और पाचन के लिए रात में गर्म दूध में शुद्ध केसर के 2 धागे मिलाएं।",
                            benefit: "आराम और पाचन"
                        },
                        {
                            title: "नारियल पानी",
                            content: "प्रकृति का इलेक्ट्रोलाइट। आवश्यक खनिज प्रदान करते हुए दिन भर ठंडा और हाइड्रेटेड रहने के लिए उत्तम।",
                            benefit: "पीएच संतुलन"
                        },
                        {
                            title: "भीगे हुए बादाम",
                            content: "पहले से भीगे हुए बादाम पचाने में आसान होते हैं और बच्चे के मानसिक विकास के लिए डीएचए प्रदान करते हैं।",
                            benefit: "मस्तिष्क शक्ति"
                        }
                    ]
                },
                {
                    title: "मन और आत्मा",
                    category: "कल्याण",
                    icon: "✨",
                    tips: [
                        {
                            title: "गर्भ संस्कार",
                            content: "गर्भ में बच्चे को शिक्षित करने की कला। सकारात्मक पढ़ने, शांत मंत्रों और संगीत में संलग्न रहें।",
                            benefit: "गहरा बंधन"
                        },
                        {
                            title: "सूर्यदर्शन",
                            content: "प्राकृतिक विटामिन डी को अवशोषित करने के लिए सुबह की कोमल धूप (7 बजे - 8 बजे) में समय बिताएं।",
                            benefit: "हड्डी स्वास्थ्य"
                        },
                        {
                            title: "घी का ज्ञान",
                            content: "शुद्ध देसी घी की एक चम्मच जोड़ों के लचीलेपन को बनाए रखने और तंत्रिका तंत्र का समर्थन करने में मदद करती है।",
                            benefit: "शक्ति"
                        }
                    ]
                },
                {
                    title: "प्राकृतिक उपचार",
                    category: "घरेलू देखभाल",
                    icon: "🌿",
                    tips: [
                        {
                            title: "अदरक-नींबू पानी",
                            content: "शहद और नींबू के साथ ताजे अदरक का रस सुबह की मतली के लिए सबसे प्रभावी प्राकृतिक इलाज है।",
                            benefit: "मतली राहत"
                        },
                        {
                            title: "सौंफ",
                            content: "मुख्य भोजन के बाद भुनी हुई सौंफ चबाने से बेहतर पोषक तत्व अवशोषण में मदद मिलती है और सूजन को रोकती है।",
                            benefit: "चयापचय"
                        }
                    ]
                }
            ]
        }
    };

    useEffect(() => {
        const fetchTips = async () => {
            try {
                const docRef = doc(db, "content", "tips");
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setDynamicContent(docSnap.data());
                }
            } catch (error) {
                console.error("Error fetching tips from Firestore:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTips();
    }, []);

    const t = (dynamicContent?.[language] || localContent[language] || localContent.en);

    return (
        <div className="indian-tips-container fade-in">
            <div className="mandala-bg-pattern"></div>

            <button className="back-btn" onClick={() => navigate(-1)}>← {t.back}</button>

            <header className="tips-header">
                <h1>{t.pageTitle}</h1>
                <p>{t.subtitle}</p>
            </header>

            <div className="tips-content">
                {t.sections.map((section, sIdx) => (
                    <section key={sIdx} className="tips-section">
                        <div className="section-title">
                            <span className="section-icon">{section.icon}</span>
                            <h2>{section.title}</h2>
                        </div>
                        <div className="tips-grid">
                            {section.tips.map((tip, tIdx) => (
                                <div key={tIdx} className="tip-premium-card">
                                    <div className="tip-category">{section.category}</div>
                                    <h3>{tip.title}</h3>
                                    <p>{tip.content}</p>
                                    <div className="tip-benefit-tag">
                                        <span>{t.focus}</span> {tip.benefit}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </div>

            <footer className="tips-disclaimer">
                <p>{t.disclaimer}</p>
            </footer>
        </div>
    );
};

export default IndianTips;
