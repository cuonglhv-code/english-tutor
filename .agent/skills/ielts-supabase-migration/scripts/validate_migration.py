import sys, re

def validate(filepath):
    try:
        content = open(filepath).read()
    except FileNotFoundError:
        print(f"ERROR: File not found: {filepath}"); sys.exit(1)

    errors = []

    # Rule 1: No DROP TABLE without explicit marker
    if re.search(r'DROP TABLE', content, re.IGNORECASE):
        if '-- INTENTIONAL DROP' not in content:
            errors.append("ERROR: DROP TABLE found. Add '-- INTENTIONAL DROP' comment if deliberate.")

    # Rule 2: All CREATE TABLE blocks must have an 'id' primary key
    for match in re.finditer(r'CREATE TABLE\s+(?P<name>\w+)\s*\((?P<body>.*?)\);', content, re.DOTALL | re.IGNORECASE):
        name, body = match.group('name'), match.group('body')
        if not re.search(r'\bid\b.*PRIMARY KEY', body, re.IGNORECASE):
            errors.append(f"ERROR: Table '{name}' missing 'id' PRIMARY KEY.")
        if not re.search(r'snake_case|[a-z][a-z0-9_]*', name):
            errors.append(f"ERROR: Table '{name}' must use snake_case.")

    # Rule 3: RLS must be enabled for every new table
    tables = re.findall(r'CREATE TABLE\s+(\w+)', content, re.IGNORECASE)
    for t in tables:
        if not re.search(rf'ENABLE ROW LEVEL SECURITY.*{t}|{t}.*ENABLE ROW LEVEL SECURITY', content, re.IGNORECASE):
            errors.append(f"ERROR: RLS not enabled for table '{t}'.")

    # Rule 4: Rollback block must exist
    if '-- rollback:' not in content.lower():
        errors.append("ERROR: Missing '-- rollback:' section at the bottom.")

    if errors:
        [print(e) for e in errors]; sys.exit(1)
    else:
        print("✅ Migration validation passed."); sys.exit(0)

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("Usage: python validate_migration.py <file.sql>"); sys.exit(1)
    validate(sys.argv[1])
