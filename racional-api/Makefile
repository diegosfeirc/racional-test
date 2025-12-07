.PHONY: help up down build rebuild logs logs-api test test-only dev clean ps shell-api shell-db restart restart-api migrate seed status check-docker

# Comando por defecto
.DEFAULT_GOAL := help

help: ## Muestra esta ayuda
	@echo "\033[0;34m════════════════════════════════════════════════════════════\033[0m"
	@echo "\033[0;32m  Racional API - Comandos disponibles\033[0m"
	@echo "\033[0;34m════════════════════════════════════════════════════════════\033[0m"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[0;32m%-18s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "\033[0;34mEjemplos:\033[0m"
	@echo "  \033[0;33mmake up\033[0m          - Levanta la aplicación (API + PostgreSQL)"
	@echo "  \033[0;33mmake dev\033[0m         - Modo desarrollo interactivo"
	@echo "  \033[0;33mmake test\033[0m        - Ejecuta tests de integración"
	@echo ""

check-docker: ## Verifica que Docker esté instalado y funcionando
	@echo "\033[0;34mVerificando Docker...\033[0m"
	@command -v docker >/dev/null 2>&1 || { \
		echo "\033[0;31m❌ Error: Docker no está instalado\033[0m"; \
		echo "   Instala Docker desde: https://docs.docker.com/get-docker/"; \
		exit 1; \
	}
	@docker info >/dev/null 2>&1 || { \
		echo "\033[0;31m❌ Error: Docker no está corriendo\033[0m"; \
		echo "   Inicia Docker Desktop o el daemon de Docker"; \
		exit 1; \
	}
	@docker compose version >/dev/null 2>&1 || { \
		echo "\033[0;31m❌ Error: Docker Compose no está disponible\033[0m"; \
		exit 1; \
	}
	@echo "\033[0;32m✅ Docker está listo\033[0m"

build: check-docker ## Construye las imágenes Docker
	@echo "\033[0;33m🔨 Construyendo imágenes Docker...\033[0m"
	@docker compose -f docker-compose.yml build
	@echo "\033[0;32m✅ Imágenes construidas\033[0m"

rebuild: check-docker ## Reconstruye las imágenes desde cero (sin cache)
	@echo "\033[0;33m🔨 Reconstruyendo imágenes desde cero...\033[0m"
	@docker compose -f docker-compose.yml build --no-cache
	@echo "\033[0;32m✅ Imágenes reconstruidas\033[0m"

up: build ## Levanta solo los servicios de la aplicación (API + PostgreSQL)
	@echo "\033[0;32m🚀 Levantando servicios de la aplicación...\033[0m"
	@echo "\033[0;34m   Esto incluye: PostgreSQL y API\033[0m"
	@docker compose -f docker-compose.yml up -d postgres api

dev: build ## Levanta solo servicios de desarrollo (sin tests)
	@echo "\033[0;32m🚀 Levantando servicios de desarrollo...\033[0m"
	@echo "\033[0;34m   API disponible en: http://localhost:3000\033[0m"
	@echo "\033[0;34m   Swagger disponible en: http://localhost:3000/docs\033[0m"
	@docker compose -f docker-compose.yml up postgres api

down: check-docker ## Detiene todos los servicios
	@echo "\033[0;33m🛑 Deteniendo servicios...\033[0m"
	@docker compose -f docker-compose.yml down
	@echo "\033[0;32m✅ Servicios detenidos\033[0m"

clean: check-docker ## Detiene servicios y elimina volúmenes (limpia datos)
	@echo "\033[0;31m🧹 Limpiando todo (servicios + volúmenes)...\033[0m"
	@echo "\033[0;33m   ⚠️  Esto eliminará todos los datos de la base de datos\033[0m"
	@docker compose -f docker-compose.yml down -v
	@echo "\033[0;32m✅ Limpieza completada\033[0m"

logs: check-docker ## Muestra logs de todos los servicios (seguimiento en tiempo real)
	@docker compose -f docker-compose.yml logs -f

logs-api: check-docker ## Muestra logs solo de la API
	@docker compose -f docker-compose.yml logs -f api

test: build ## Ejecuta los tests de integración (independiente de la app)
	@echo "\033[0;32m🧪 Ejecutando tests de integración...\033[0m"
	@echo "\033[0;34m   Esto levanta: PostgreSQL de test y ejecuta los tests\033[0m"
	@docker compose -f docker-compose.yml up --build api-test --abort-on-container-exit
	@docker compose -f docker-compose.yml rm -f api-test postgres-test

test-only: check-docker ## Ejecuta tests sin reconstruir (más rápido)
	@echo "\033[0;32m🧪 Ejecutando tests (sin rebuild)...\033[0m"
	@echo "\033[0;34m   Esto levanta: PostgreSQL de test y ejecuta los tests\033[0m"
	@docker compose -f docker-compose.yml up api-test --abort-on-container-exit
	@docker compose -f docker-compose.yml rm -f api-test postgres-test

ps: check-docker ## Muestra el estado de los contenedores
	@docker compose -f docker-compose.yml ps

status: check-docker ## Muestra estado detallado de los servicios
	@echo "\033[0;34m════════════════════════════════════════════════════════════\033[0m"
	@echo "\033[0;32m  Estado de los servicios\033[0m"
	@echo "\033[0;34m════════════════════════════════════════════════════════════\033[0m"
	@echo ""
	@docker compose -f docker-compose.yml ps
	@echo ""
	@echo "\033[0;34mURLs disponibles:\033[0m"
	@echo "  \033[0;32mAPI:\033[0m      http://localhost:3000"
	@echo "  \033[0;32mSwagger:\033[0m  http://localhost:3000/docs"
	@echo "  \033[0;32mPostgreSQL:\033[0m localhost:5432"
	@echo ""

shell-api: check-docker ## Abre una shell en el contenedor de la API
	@echo "\033[0;34mAbriendo shell en contenedor de API...\033[0m"
	@docker compose -f docker-compose.yml exec api sh

shell-db: check-docker ## Abre una shell en PostgreSQL
	@echo "\033[0;34mAbriendo shell en PostgreSQL...\033[0m"
	@docker compose -f docker-compose.yml exec postgres psql -U racional -d racional_db

restart: down up ## Reinicia todos los servicios

restart-api: check-docker ## Reinicia solo el servicio de la API
	@echo "\033[0;33m🔄 Reiniciando API...\033[0m"
	@docker compose -f docker-compose.yml restart api
	@echo "\033[0;32m✅ API reiniciada\033[0m"

migrate: check-docker ## Ejecuta migraciones manualmente (desde el contenedor)
	@echo "\033[0;33m🔄 Ejecutando migraciones...\033[0m"
	@docker compose -f docker-compose.yml exec api npx prisma migrate deploy
	@echo "\033[0;32m✅ Migraciones completadas\033[0m"

seed: check-docker ## Ejecuta seeds manualmente (desde el contenedor)
	@echo "\033[0;33m🌱 Ejecutando seeds...\033[0m"
	@docker compose -f docker-compose.yml exec api npx prisma db seed
	@echo "\033[0;32m✅ Seeds completados\033[0m"

stop: check-docker ## Detiene servicios sin eliminarlos
	@echo "\033[0;33m⏸️  Deteniendo servicios...\033[0m"
	@docker compose -f docker-compose.yml stop
	@echo "\033[0;32m✅ Servicios detenidos\033[0m"

start: check-docker ## Inicia servicios previamente detenidos
	@echo "\033[0;32m▶️  Iniciando servicios...\033[0m"
	@docker compose -f docker-compose.yml start
	@echo "\033[0;32m✅ Servicios iniciados\033[0m"

