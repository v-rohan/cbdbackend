# Cashback Duniya Backend

Before running create a folder in project root named `mockTxns`.

## Build and Run:

1. Run `yarn` command
2. Setup database settings inside `ormconfig.json` file
3. Run `yarn start` command

### To generate a new Migration

```bash
yarn run typeorm migration:generate -n migrationName
```

### To apply migrations

```bash
yarn run typeorm migration:run
```


## Run using Docker

1. Run the containers:

   ```bash
   docker-compose up
   ```

2. Run migrations:

   ```bash
   docker exec -it <container_name> yarn run typeorm migration:generate -n migrationName
   docker exec -it <container_name> yarn run typeorm migration:run
   ```
