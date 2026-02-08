#!/bin/bash

echo "========================================="
echo "Laravel Backend Verification Script"
echo "========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check PHP
echo -n "Checking PHP... "
if command -v php &> /dev/null; then
    PHP_VERSION=$(php -v | head -n 1 | cut -d " " -f 2)
    echo -e "${GREEN}✓${NC} PHP $PHP_VERSION"
else
    echo -e "${RED}✗${NC} PHP not found"
    exit 1
fi

# Check Composer
echo -n "Checking Composer... "
if command -v composer &> /dev/null; then
    COMPOSER_VERSION=$(composer --version | cut -d " " -f 3)
    echo -e "${GREEN}✓${NC} Composer $COMPOSER_VERSION"
else
    echo -e "${RED}✗${NC} Composer not found"
    exit 1
fi

# Check Node
echo -n "Checking Node.js... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓${NC} Node.js $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Node.js not found"
    exit 1
fi

# Check npm
echo -n "Checking npm... "
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓${NC} npm $NPM_VERSION"
else
    echo -e "${RED}✗${NC} npm not found"
    exit 1
fi

echo ""
echo "========================================="
echo "Checking Laravel Installation"
echo "========================================="
echo ""

# Check vendor directory
echo -n "Checking vendor directory... "
if [ -d "vendor" ]; then
    echo -e "${GREEN}✓${NC} Found"
else
    echo -e "${RED}✗${NC} Not found - run 'composer install'"
fi

# Check node_modules
echo -n "Checking node_modules... "
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} Found"
else
    echo -e "${RED}✗${NC} Not found - run 'npm install'"
fi

# Check .env file
echo -n "Checking .env file... "
if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} Found"
else
    echo -e "${YELLOW}⚠${NC} Not found - run 'cp .env.example .env'"
fi

# Check APP_KEY
if [ -f ".env" ]; then
    echo -n "Checking APP_KEY... "
    if grep -q "APP_KEY=base64:" .env; then
        echo -e "${GREEN}✓${NC} Set"
    else
        echo -e "${YELLOW}⚠${NC} Not set - run 'php artisan key:generate'"
    fi
fi

echo ""
echo "========================================="
echo "Checking Laravel Structure"
echo "========================================="
echo ""

# Check directories
DIRS=("app" "bootstrap" "config" "database" "public" "resources" "routes" "storage" "tests")
for dir in "${DIRS[@]}"; do
    echo -n "Checking $dir/... "
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗${NC}"
    fi
done

echo ""
echo "========================================="
echo "Checking Key Files"
echo "========================================="
echo ""

FILES=(
    "artisan"
    "composer.json"
    "package.json"
    "vite.config.ts"
    "phpunit.xml"
    "routes/api.php"
    "routes/web.php"
    "app/Models/User.php"
    "app/Models/Todo.php"
    "app/Http/Controllers/Api/AuthController.php"
    "app/Http/Controllers/Api/TodoController.php"
    "resources/views/app.blade.php"
    "resources/js/main.tsx"
    "resources/js/lib/api.ts"
)

for file in "${FILES[@]}"; do
    echo -n "Checking $file... "
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗${NC}"
    fi
done

echo ""
echo "========================================="
echo "Testing Artisan Commands"
echo "========================================="
echo ""

# Test artisan
echo -n "Testing artisan... "
if php artisan --version &> /dev/null; then
    LARAVEL_VERSION=$(php artisan --version | cut -d " " -f 3)
    echo -e "${GREEN}✓${NC} Laravel $LARAVEL_VERSION"
else
    echo -e "${RED}✗${NC}"
fi

# List routes
echo ""
echo "API Routes:"
php artisan route:list --path=api 2>/dev/null | grep -E "(POST|GET|PUT|PATCH|DELETE)\s+api/" || echo "Could not list routes"

echo ""
echo "========================================="
echo "Summary"
echo "========================================="
echo ""

if [ -d "vendor" ] && [ -d "node_modules" ] && [ -f ".env" ]; then
    echo -e "${GREEN}✓ Laravel backend is set up!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Configure database in .env"
    echo "2. Run: php artisan migrate"
    echo "3. Start backend: php artisan serve"
    echo "4. Start frontend: npm run dev"
    echo ""
    echo "See QUICKSTART.md for detailed instructions"
else
    echo -e "${YELLOW}⚠ Setup incomplete${NC}"
    echo ""
    if [ ! -d "vendor" ]; then
        echo "Run: composer install"
    fi
    if [ ! -d "node_modules" ]; then
        echo "Run: npm install"
    fi
    if [ ! -f ".env" ]; then
        echo "Run: cp .env.example .env && php artisan key:generate"
    fi
fi

echo ""
