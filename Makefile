stop:
	docker-compose stop

start:
	docker-compose up -d

logs:
	docker-compose logs -f

dev:
	make stop && make start && make logs

build:
	docker-compose up build

restart:
	docker-compose restart
