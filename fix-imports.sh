#!/bin/bash

echo "🔧 Converting all @/ imports to relative paths..."

# Fix auth controller
sed -i 's|@/shared/dto/auth.dto|../../shared/dto/auth.dto|g' src/modules/auth/auth.controller.ts
sed -i 's|@/shared/dto/documentation.dto|../../shared/dto/documentation.dto|g' src/modules/auth/auth.controller.ts

# Fix api-client controller
sed -i 's|@/shared/dto/api-client.dto|../../shared/dto/api-client.dto|g' src/modules/api-client/api-client.controller.ts

# Fix projects controller
sed -i 's|@/shared/dto/projects.dto|../../shared/dto/projects.dto|g' src/modules/projects/projects.controller.ts

# Fix other files
find src -name "*.ts" -exec sed -i 's|@/shared/|../../shared/|g' {} \;
find src -name "*.ts" -exec sed -i 's|@/modules/|../modules/|g' {} \;
find src -name "*.ts" -exec sed -i 's|@/config/|../config/|g' {} \;

echo "✅ All imports fixed!"
