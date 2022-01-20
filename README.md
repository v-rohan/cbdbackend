# Cashback Duniya Backend

Steps to run this project:

1. Run `npm i` command
2. Setup database settings inside `ormconfig.json` file
3. Run `npm start` command

## To generate a new Migration

```bash
npm run typeorm migration:generate -n migrationName
```

## To apply migrations

```bash
npm run typeorm migration:run
```
