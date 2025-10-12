PY=python

.PHONY: setup migrate run createsuperuser shell install

migrate:
	$(PY) manage.py migrate

run:
	$(PY) manage.py runserver 0.0.0.0:8000

createsuperuser:
	$(PY) manage.py createsuperuser

shell:
	$(PY) manage.py shell

install:
	pip install -r requirements.txt

setup: install
	@if not exist .env ( copy .env.example .env >nul 2>&1 || echo Using existing .env )

