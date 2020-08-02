Import a Database with CouchDB:

1. Find database files in the folder "data"
2. Create empty databases in CouchDB (in this case: ingredients, recipes)
3. Run the following curl command to import the data to a CouchDB database:

curl -d @db_u.json -H "Content-type: application/json" -X POST http://[login:password@]127.0.0.1:5984/[mydatabase]/_bulk_docs

4. Change credentials in the URL of nano connection (index.js)


__
Notes:
db_u.json - database file (in this case: ingredients.json, recipes.json)
mydatabase - name of database in CouchDB (in this case: ingredients, recipes)

__
Source: https://medium.com/@simeon.yan.iliev/export-import-a-database-with-couchdb-74bfec3831bc