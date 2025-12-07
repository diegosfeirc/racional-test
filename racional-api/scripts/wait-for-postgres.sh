#!/bin/sh

set -e

host="$1"
port="$2"
user="$3"
database="$4"
password="$5"

export PGPASSWORD="$password"

max_attempts=60
attempt=0

until pg_isready -h "$host" -p "$port" -U "$user" -d "$database"; do
  attempt=$((attempt + 1))
  if [ $attempt -ge $max_attempts ]; then
    >&2 echo "PostgreSQL is unavailable after $max_attempts attempts - giving up"
    exit 1
  fi
  >&2 echo "PostgreSQL is unavailable - sleeping (attempt $attempt/$max_attempts)"
  sleep 1
done

>&2 echo "PostgreSQL is up and ready"

