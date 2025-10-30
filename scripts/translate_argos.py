# scripts/translate_argos.py
import sys, re
from argostranslate import package, translate

def ensure():
    installed = package.get_installed_packages()
    if any(p.from_code=='en' and p.to_code=='ja' for p in installed):
        return
    avail = package.get_available_packages()
    pkg = next((p for p in avail if p.from_code=='en' and p.to_code=='ja'), None)
    if pkg: package.install_from_path(pkg.download())

def main():
    ensure()
    text = sys.stdin.read()
    if not text.strip():
        print(""); return
    # 既に日本語ならそのまま返す
    if re.search(r'[\u3040-\u30ff\u4e00-\u9faf]', text):
        print(text); return
    print(translate.translate(text, 'en', 'ja'))

if __name__ == "__main__":
    main()
