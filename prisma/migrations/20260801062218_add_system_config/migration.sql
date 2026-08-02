-- CreateTable
CREATE TABLE "system_config" (
    "id" TEXT NOT NULL,
    "clientName" TEXT NOT NULL DEFAULT 'Cliente Lubritech',
    "expirationDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_config_pkey" PRIMARY KEY ("id")
);
