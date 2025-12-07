.PHONY: help up down build rebuild logs logs-api test test-only dev clean ps shell-api shell-db restart restart-api migrate seed status check-docker

# Variables
COMPOSE := docker compose
COMPOSE_FILE := docker-compose.yml
API_SERVICE := api
POSTGRES_SERVICE := postgres
TEST_SERVICE := api-test

# Colores para output
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
BLUE := \033[0;34m
NC := \033[0m # No Color

# Comando por defecto
.DEFAULT_GOAL := help

help: ## Muestra esta ayuda
	@echo "$(BLUE)════════════════════════════════════════════════════════════$(NC)"
	@echo "$(GREEN)  Racional API - Comandos disponibles$(NC)"
	@echo "$(BLUE)════════════════════════════════════════════════════════════$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-18s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(BLUE)Ejemplos:$(NC)"
	@echo "  $(YELLOW)make up$(NC)          - Levanta todo (API + tests)"
	@echo "  $(YELLOW)make dev$(NC)         - Solo desarrollo (sin tests)"
	@echo "  $(YELLOW)make test$(NC)        - Solo ejecutar tests"
	@echo ""

check-docker: ## Verifica que Docker esté instalado y funcionando
	@echo "$(BLUE)Verificando Docker...$(NC)"
	@command -v docker >/dev/null 2>&1 || { \
		echo "$(RED)❌ Error: Docker no está instalado$(NC)"; \
		echo "   Instala Docker desde: https://docs.docker.com/get-docker/"; \
		exit 1; \
	}
	@docker info >/dev/null 2>&1 || { \
		echo "$(RED)❌ Error: Docker no está corriendo$(NC)"; \
		echo "   Inicia Docker Desktop o el daemon de Docker"; \
		exit 1; \
	}
	@$(COMPOSE) version >/dev/null 2>&1 || { \
		echo "$(RED)❌ Error: Docker Compose no está disponible$(NC)"; \
		exit 1; \
	}
	@echo "$(GREEN)✅ Docker está listo$(NC)"

build: check-docker ## Construye las imágenes Docker
	@echo "$(YELLOW)🔨 Construyendo imágenes Docker...$(NC)"
	@$(COMPOSE) -f $(COMPOSE_FILE) build
	@echo "$(GREEN)✅ Imágenes construidas$(NC)"

rebuild: check-docker ## Reconstruye las imágenes desde cero (sin cache)
	@echo "$(YELLOW)🔨 Reconstruyendo imágenes desde cero...$(NC)"
	@$(COMPOSE) -f $(COMPOSE_FILE) build --no-cache
	@echo "$(GREEN)✅ Imágenes reconstruidas$(NC)"

up: build ## Levanta todos los servicios (API + tests automáticos)
	@echo "$(GREEN)🚀 Levantando todos los servicios...$(NC)"
	@echo "$(BLUE)   Esto incluye: PostgreSQL, API y tests de integración$(NC)"
	@$(COMPOSE) -f $(COMPOSE_FILE) up

dev: build ## Levanta solo servicios de desarrollo (sin tests)
	@echo "$(GREEN)🚀 Levantando servicios de desarrollo...$(NC)"
	@echo "$(BLUE)   API disponible en: http://localhost:3000$(NC)"
	@echo "$(BLUE)   Swagger disponible en: http://localhost:3000/docs$(NC)"
	@$(COMPOSE) -f $(COMPOSE_FILE) up $(POSTGRES_SERVICE) $(API_SERVICE)

down: check-docker ## Detiene todos los servicios
	@echo "$(YELLOW)🛑 Deteniendo servicios...$(NC)"
	@$(COMPOSE) -f $(COMPOSE_FILE) down
	@echo "$(GREEN)✅ Servicios detenidos$(NC)"

clean: check-docker ## Detiene servicios y elimina volúmenes (limpia datos)
	@echo "$(RED)🧹 Limpiando todo (servicios + volúmenes)...$(NC)"
	@echo "$(YELLOW)   ⚠️  Esto eliminará todos los datos de la base de datos$(NC)"
	@$(COMPOSE) -f $(COMPOSE_FILE) down -v
	@echo "$(GREEN)✅ Limpieza completada$(NC)"

logs: check-docker ## Muestra logs de todos los servicios (seguimiento en tiempo real)
	@$(COMPOSE) -f $(COMPOSE_FILE) logs -f

logs-api: check-docker ## Muestra logs solo de la API
	@$(COMPOSE) -f $(COMPOSE_FILE) logs -f $(API_SERVICE)

test: build ## Ejecuta solo los tests de integración
	@echo "$(GREEN)🧪 Ejecutando tests de integración...$(NC)"
	@$(COMPOSE) -f $(COMPOSE_FILE) up $(TEST_SERVICE) --build

test-only: check-docker ## Ejecuta tests sin reconstruir (más rápido)
	@echo "$(GREEN)🧪 Ejecutando tests (sin rebuild)...$(NC)"
	@$(COMPOSE) -f $(COMPOSE_FILE) up $(TEST_SERVICE)

ps: check-docker ## Muestra el estado de los contenedores
	@$(COMPOSE) -f $(COMPOSE_FILE) ps

status: check-docker ## Muestra estado detallado de los servicios
	@echo "$(BLUE)════════════════════════════════════════════════════════════$(NC)"
	@echo "$(GREEN)  Estado de los servicios$(NC)"
	@echo "$(BLUE)════════════════════════════════════════════════════════════$(NC)"
	@echo ""
	@$(COMPOSE) -f $(COMPOSE_FILE) ps
	@echo ""
	@echo "$(BLUE)URLs disponibles:$(NC)"
	@echo "  $(GREEN)API:$(NC)      http://localhost:3000"
	@echo "  $(GREEN)Swagger:$(NC)  http://localhost:3000/docs"
	@echo "  $(GREEN)PostgreSQL:$(NC) localhost:5432"
	@echo ""

shell-api: check-docker ## Abre una shell en el contenedor de la API
	@echo "$(BLUE)Abriendo shell en contenedor de API...$(NC)"
	@$(COMPOSE) -f $(COMPOSE_FILE) exec $(API_SERVICE) sh

shell-db: check-docker ## Abre una shell en PostgreSQL
	@echo "$(BLUE)Abriendo shell en PostgreSQL...$(NC)"
	@$(COMPOSE) -f $(COMPOSE_FILE) exec $(POSTGRES_SERVICE) psql -U racional -d racional_db

restart: down up ## Reinicia todos los servicios

restart-api: check-docker ## Reinicia solo el servicio de la API
	@echo "$(YELLOW)🔄 Reiniciando API...$(NC)"
	@$(COMPOSE) -f $(COMPOSE_FILE) restart $(API_SERVICE)
	@echo "$(GREEN)✅ API reiniciada$(NC)"

migrate: check-docker ## Ejecuta migraciones manualmente (desde el contenedor)
	@echo "$(YELLOW)🔄 Ejecutando migraciones...$(NC)"
	@$(COMPOSE) -f $(COMPOSE_FILE) exec $(API_SERVICE) sh ./scripts/migrate.sh
	@echo "$(GREEN)✅ Migraciones completadas$(NC)"

seed: check-docker ## Ejecuta seeds manualmente (desde el contenedor)
	@echo "$(YELLOW)🌱 Ejecutando seeds...$(NC)"
	@$(COMPOSE) -f $(COMPOSE_FILE) exec $(API_SERVICE) sh ./scripts/seed.sh
	@echo "$(GREEN)✅ Seeds completados$(NC)"

stop: check-docker ## Detiene servicios sin eliminarlos
	@echo "$(YELLOW)⏸️  Deteniendo servicios...$(NC)"
	@$(COMPOSE) -f $(COMPOSE_FILE) stop
	@echo "$(GREEN)✅ Servicios detenidos$(NC)"

start: check-docker ## Inicia servicios previamente detenidos
	@echo "$(GREEN)▶️  Iniciando servicios...$(NC)"
	@$(COMPOSE) -f $(COMPOSE_FILE) start
	@echo "$(GREEN)✅ Servicios iniciados$(NC)"

