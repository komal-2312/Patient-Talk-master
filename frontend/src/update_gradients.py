import os, re

dir_path = r'c:\Users\delll\Downloads\Patient-Talk\frontend\src'

# We specifically replace any gradient with var(--secondary-color) since they asked not to use gradient.
gradient_pattern = re.compile(r'background(?:-image)?\s*:\s*(?:linear|radial|conic)-gradient\([^;]+(;?)', re.IGNORECASE)

for root, _, files in os.walk(dir_path):
    for f in files:
        if f.endswith('.css'):
            p = os.path.join(root, f)
            with open(p, 'r', encoding='utf-8', errors='ignore') as fp:
                txt = fp.read()
            
            new_txt, count = gradient_pattern.subn(r'background: var(--secondary-color)\1', txt)
            if count > 0:
                with open(p, 'w', encoding='utf-8') as fp:
                    fp.write(new_txt)
                print(f'Updated {f} - replaced {count} occurrences')
