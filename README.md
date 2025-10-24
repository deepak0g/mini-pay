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
    this will setup the database with the provided data / test data
4. open http://localhost:5173/
5. for unit test run - bun server/test/emp.test.ts