# Mini Pay Run

# Setup

1. Clone the repository
2. run - docker-composer up
3. if you want to test with the provided data, inside the backend service run - 
    ```
    bun server/test/dump.ts --test
    ```
    else run -
    ```
    bun server/test/dump.ts
    ```
    this will setup the database with the provided data / my test data
4. open http://localhost:5173/

## Testing

Run tests with Jest:
```bash
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage report
```

For manual testing with sample data:
```bash
bun server/test/emp.test.ts
```

# Notes

1. Using bun for sake of simplicity, you can swap it with node if you want using - 
    npx tsx server/server.ts
2. Monorepo structure, client and server are in the same repository

## Optional: LocalStack S3 Setup

To enable S3 export for payruns (optional feature):

1. Start LocalStack with the localstack profile:
   ```bash
   docker-compose --profile localstack up -d
   ```

2. Initialize S3 bucket:
   ```bash
   ./localstack/init-aws.sh
   ```

3. Update your `.env` file:
   ```bash
   USE_LOCALSTACK=true
   ```

4. Now when you download a payrun, it will also be saved to S3 automatically

**Note**: S3 export is optional. The app works perfectly without it - payruns are always saved to PostgreSQL.