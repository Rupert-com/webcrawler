#### Connection options

# Docker

Get postgres img
`docker pull postgres`
Start Docker containter
`docker run --rm -P -p 127.0.0.1:5432:5432 -e POSTGRES_PASSWORD="1234" --name pg postgres`

### Mind [ormconfig.json](./ormconfig.json)

[More connection info](https://typeorm.io/#/connection-options/postgres--cockroachdb-connection-options)
