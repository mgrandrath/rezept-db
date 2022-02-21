-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Recipe" (
    "recipeId" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "notes" TEXT,
    "sourceType" TEXT NOT NULL,
    "onlineSourceUrl" TEXT,
    "offlineSourceTitle" TEXT,
    "offlineSourcePage" INTEGER,
    "diet" TEXT NOT NULL,
    "prepTime" TEXT NOT NULL DEFAULT 'OVER_120_MINUTES',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Recipe" ("createdAt", "diet", "name", "notes", "offlineSourcePage", "offlineSourceTitle", "onlineSourceUrl", "recipeId", "sourceType", "updatedAt") SELECT "createdAt", "diet", "name", "notes", "offlineSourcePage", "offlineSourceTitle", "onlineSourceUrl", "recipeId", "sourceType", "updatedAt" FROM "Recipe";
DROP TABLE "Recipe";
ALTER TABLE "new_Recipe" RENAME TO "Recipe";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
