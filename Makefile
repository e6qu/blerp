.PHONY: help install generate-sdk lint-openapi build-openapi build-shared

help: ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install workspace dependencies
	bun install

generate-sdk: ## Regenerate the SDK clients from the OpenAPI spec
	cd packages/shared && bun run generate

lint-openapi: ## Lint the OpenAPI schema
	bun run openapi:lint

build-openapi: ## Generate HTML documentation for the OpenAPI schema
	bun run openapi:build

build-shared: ## Compile the TypeScript code in packages/shared
	cd packages/shared && bun run build
