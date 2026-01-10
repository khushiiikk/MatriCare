import { useTranslation } from 'react-i18next';
import './Footer.css';

const Footer = () => {
    const { t } = useTranslation('common');

    return (
        <footer className="footer-slim">
            <div className="container">
                <div className="footer-content">
                    <p className="copyright">{t('footer.copyright') || '© 2024 MatriCare'}</p>
                    <ul className="footer-links">
                        <li><a href="#privacy">{t('footer.privacy') || 'Privacy'}</a></li>
                        <li><a href="#terms">{t('footer.terms') || 'Terms'}</a></li>
                        <li><a href="#contact">{t('footer.contact') || 'Contact'}</a></li>
                    </ul>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
