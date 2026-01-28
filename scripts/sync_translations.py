
import os
import json
import requests

BASE_URL = "http://127.0.0.1:5000/translate"
LOCALES_DIR = r"d:\Study\MCH\MaternalHealth\src\i18n\locales"
TARGET_LANGS = ["hi", "mr", "ta"]

def translate_text(text, target_lang):
    print(f"  -> Requesting translation for: '{text[:20]}...' to {target_lang}")
    try:
        response = requests.post(BASE_URL, json={"text": text, "target_lang": target_lang}, timeout=30)
        if response.status_code == 200:
            return response.json()["translated_text"]
        else:
            print(f"Error: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"Connection Error: {e}")
        return None

def deep_translate(source, target, lang):
    updated = False
    for key, value in source.items():
        if isinstance(value, dict):
            if key not in target:
                target[key] = {}
            if deep_translate(value, target[key], lang):
                updated = True
        elif isinstance(value, list):
            if key not in target or len(target[key]) != len(value):
                print(f"Translating list: {key}")
                new_list = []
                for item in value:
                    if isinstance(item, str):
                        t = translate_text(item, lang)
                        new_list.append(t if t else item)
                    elif isinstance(item, dict):
                        new_item = {}
                        deep_translate(item, new_item, lang)
                        new_list.append(new_item)
                    else:
                        new_list.append(item)
                target[key] = new_list
                updated = True
            else:
                for i in range(len(value)):
                    if isinstance(value[i], dict):
                        if deep_translate(value[i], target[key][i], lang):
                            updated = True
        else:
            if key not in target:
                print(f"Translating: {key}")
                t = translate_text(value, lang)
                if t:
                    target[key] = t
                    updated = True
    return updated

def main():
    en_dir = os.path.join(LOCALES_DIR, "en")
    for filename in os.listdir(en_dir):
        if not filename.endswith(".json"):
            continue
            
        print(f"\nProcessing {filename}...")
        with open(os.path.join(en_dir, filename), 'r', encoding='utf-8') as f:
            en_data = json.load(f)
            
        for lang in TARGET_LANGS:
            lang_dir = os.path.join(LOCALES_DIR, lang)
            os.makedirs(lang_dir, exist_ok=True)
            file_path = os.path.join(lang_dir, filename)
            
            target_data = {}
            if os.path.exists(file_path):
                with open(file_path, 'r', encoding='utf-8') as f:
                    try:
                        target_data = json.load(f)
                    except:
                        target_data = {}
            
            print(f"  Language: {lang}")
            if deep_translate(en_data, target_data, lang):
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(target_data, f, indent=4, ensure_ascii=False)
                print(f"    - Updated {lang}/{filename}")
            else:
                print(f"    - Up to date.")

if __name__ == "__main__":
    main()
