# scripts/install_argos.py
from argostranslate import package
installed = package.get_installed_packages()
if not any(p.from_code=='en' and p.to_code=='ja' for p in installed):
    avail = package.get_available_packages()
    pkg = next(p for p in avail if p.from_code=='en' and p.to_code=='ja')
    package.install_from_path(pkg.download())
    print("[Argos] en->ja model installed")
else:
    print("[Argos] en->ja already installed")
