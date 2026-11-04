#!/bin/sh
# Railway start: the SQLite DB lives on a volume that is only mounted at runtime,
# so the Next build (which prerenders from the DB) runs here instead of at build time.
# If the DB hasn't been uploaded to the volume yet, idle so we can `railway ssh` in and add it.

DB_PATH="${DATABASE_URL#file:}"

if [ ! -f "$DB_PATH" ]; then
  echo "No database found at $DB_PATH. Idling until it is uploaded; restart the deployment afterward."
  while :; do sleep 3600; done
fi

npm run build && exec npm run start
