.PHONY: help up down build build-all rebuild rebuild-all logs logs-api test test-only dev clean ps shell-api shell-db restart restart-api migrate seed status check-docker

# Comando por defecto
.DEFAULT_GOAL := help

help: ## Muestra esta ayuda
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-18s %s\n", $$1, $$2}'

check-docker: ## Verifica que Docker esté instalado y funcionando
	@command -v docker >/dev/null 2>&1 || { \
		echo "Error: Docker no está instalado"; \
		echo "   Instala Docker desde: https://docs.docker.com/get-docker/"; \
		exit 1; \
	}
	@docker info >/dev/null 2>&1 || { \
		echo "Error: Docker no está corriendo"; \
		echo "   Inicia Docker Desktop o el daemon de Docker"; \
		exit 1; \
	}
	@docker compose version >/dev/null 2>&1 || { \
		echo "Error: Docker Compose no está disponible"; \
		exit 1; \
	}

build: check-docker ## Construye las imágenes Docker (solo servicios de desarrollo)
	@docker compose -f docker-compose.yml build api

build-all: check-docker ## Construye todas las imágenes Docker (incluye tests)
	@docker compose -f docker-compose.yml build

rebuild: check-docker ## Reconstruye las imágenes desde cero (sin cache, solo desarrollo)
	@docker compose -f docker-compose.yml build --no-cache api

rebuild-all: check-docker ## Reconstruye todas las imágenes desde cero (incluye tests)
	@docker compose -f docker-compose.yml build --no-cache

up: build ## Levanta solo los servicios de la aplicación (API + PostgreSQL)
	@docker compose -f docker-compose.yml up -d postgres api

dev: build ## Levanta solo servicios de desarrollo (sin tests)
	@docker compose -f docker-compose.yml up postgres api

down: check-docker ## Detiene todos los servicios
	@docker compose -f docker-compose.yml down

clean: check-docker ## Detiene servicios y elimina volúmenes (limpia datos)
	@docker compose -f docker-compose.yml down -v

logs: check-docker ## Muestra logs de todos los servicios (seguimiento en tiempo real)
	@docker compose -f docker-compose.yml logs -f

logs-api: check-docker ## Muestra logs solo de la API
	@docker compose -f docker-compose.yml logs -f api

test: check-docker ## Ejecuta los tests de integración (independiente de la app)
	@docker compose -f docker-compose.yml build api-test
	@docker compose -f docker-compose.yml up api-test --abort-on-container-exit
	@docker compose -f docker-compose.yml stop api-test postgres-test 2>/dev/null || true
	@docker compose -f docker-compose.yml rm -f api-test postgres-test

test-only: check-docker ## Ejecuta tests sin reconstruir (más rápido)
	@docker compose -f docker-compose.yml up api-test --abort-on-container-exit
	@docker compose -f docker-compose.yml stop api-test postgres-test 2>/dev/null || true
	@docker compose -f docker-compose.yml rm -f api-test postgres-test

ps: check-docker ## Muestra el estado de los contenedores
	@docker compose -f docker-compose.yml ps

status: check-docker ## Muestra estado detallado de los servicios
	@docker compose -f docker-compose.yml ps

shell-api: check-docker ## Abre una shell en el contenedor de la API
	@docker compose -f docker-compose.yml exec api sh

shell-db: check-docker ## Abre una shell en PostgreSQL
	@docker compose -f docker-compose.yml exec postgres psql -U racional -d racional_db

restart: down up ## Reinicia todos los servicios

restart-api: check-docker ## Reinicia solo el servicio de la API
	@docker compose -f docker-compose.yml restart api

migrate: check-docker ## Ejecuta migraciones manualmente (desde el contenedor)
	@docker compose -f docker-compose.yml exec api npx prisma migrate deploy

seed: check-docker ## Ejecuta seeds manualmente (desde el contenedor)
	@docker compose -f docker-compose.yml exec api npx prisma db seed

stop: check-docker ## Detiene servicios sin eliminarlos
	@docker compose -f docker-compose.yml stop

start: check-docker ## Inicia servicios previamente detenidos
	@docker compose -f docker-compose.yml start

