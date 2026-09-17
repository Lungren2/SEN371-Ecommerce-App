\# Person 4 – M5 Testing, Security and Coverage



\## 1. Overview



Person 4 was responsible for API security, data handling, error management,

quality assurance, automated testing and API test coverage.



The testing work focuses on authentication, authorization, protected API

endpoints, error responses and code coverage.



\---



\## 2. Authentication Testing



The authentication API was tested for different authentication scenarios.



Tests include:



\- Valid authenticated user

\- User not found

\- Invalid JWT subject

\- Existing email during registration

\- Invalid login credentials



The `/api/v1/Auth/me` endpoint requires authentication.



\---



\## 3. JWT Security Testing



JWT security tests were added for:



\- Malformed JWT

\- Tampered JWT

\- Expired JWT



These tests verify that invalid authentication tokens are rejected with

HTTP 401 Unauthorized.



The JWT configuration uses:



\- Issuer validation

\- Audience validation

\- Signing-key validation

\- Token lifetime validation



\---



\## 4. Authorization Testing



Protected administrative endpoints were tested using different authentication

states.



The tests verify:



| Scenario | Expected Result |

|---|---|

| No authentication token | HTTP 401 Unauthorized |

| Customer accessing admin endpoint | HTTP 403 Forbidden |

| Administrator accessing admin endpoint | HTTP 201 Created |



Catalog authorization tests cover protected product and category creation.



\---



\## 5. Swagger Security Testing



Tests were added to verify that Swagger correctly represents API security.



The tests verify:



\- Protected `/api/v1/Auth/me` has a bearer security requirement.

\- Anonymous registration does not require authentication.

\- Anonymous login does not require authentication.



This provides automated verification that API authorization metadata is

correctly represented in the OpenAPI documentation.



\---



\## 6. Catalog Endpoint Testing



Automated integration tests were added for:



\### Products



\- Retrieve all products

\- Retrieve a product by ID

\- Handle a product that does not exist



\### Categories



\- Retrieve all categories

\- Retrieve a category by ID

\- Handle a category that does not exist



These tests verify the HTTP responses returned by the API endpoints.



\---



\## 7. Error Management Testing



The API uses global error-handling middleware to provide consistent error

responses for unexpected server-side exceptions.



Authentication and authorization tests also verify expected HTTP error

responses such as:



\- 401 Unauthorized

\- 403 Forbidden

\- 404 Not Found

\- 409 Conflict



\---



\## 8. Automated Testing Technology



The backend tests use:



\- .NET 10

\- xUnit

\- ASP.NET Core integration testing

\- WebApplicationFactory

\- Coverlet



The tests can be executed using:



&#x20;   dotnet test



\---



\## 9. Code Coverage



Code coverage was collected using Coverlet:



&#x20;   dotnet test --collect:"XPlat Code Coverage" --results-directory .\\TestResults



A HTML coverage report was generated using ReportGenerator:



&#x20;   reportgenerator "-reports:.\\TestResults\\\*\\coverage.cobertura.xml" "-targetdir:.\\TestResults\\CoverageReport" "-reporttypes:Html"



The generated report provides line and branch coverage information for the

backend application.



\---



\## 10. Coverage Results



The consolidated coverage report was generated after the automated tests.



The coverage report is used to identify application areas that require

additional automated testing.



Coverage should be reviewed together with the automated test results rather

than being treated as the only measure of software quality.



\---



\## 11. TDD Evidence



The testing process follows the Red–Green–Refactor approach where applicable.



\### Red



A test is created to represent the required behaviour and initially fails

when the behaviour is not implemented.



\### Green



The implementation is executed and the test is run until the expected

behaviour passes.



\### Refactor



The implementation and tests are cleaned up while maintaining passing test

behaviour.



Git commits and automated test results provide supporting evidence of the

development and testing process.



\---



\## 12. Current Test Status



The automated backend test suite was executed during development.



The latest run contains:



\- 39 total tests

\- 39 passed

\- 0 failed

\- 0 skipped

Database Testing

The following database-focused test suites were added:

- DatabaseEdgeCaseTests.cs
- DatabaseIntegrityTests.cs
- ModelValidationTests.cs

These tests cover database edge cases, database integrity constraints,
and model validation behaviour.

Final automated test result:
39 total, 39 passed, 0 failed, 0 skipped.


The two remaining failures are related to tests expecting existing product

and category records in the local database.



The failures do not represent missing authentication or authorization

functionality.



They can be addressed later by using deterministic test data or test

database seeding.



\---



\## 13. Remaining Dependent Testing



Cart and order ownership testing is dependent on the corresponding API

controllers being implemented.



At the current implementation state:



\- CartController contains no API actions.

\- OrdersController contains no API actions.

\- ReviewsController contains no API actions.



Therefore, ownership and review authorization tests cannot be implemented

until those API endpoints exist.



Once implemented, Person 4 should add:



\- Missing-token tests for cart endpoints

\- Missing-token tests for order endpoints

\- Cross-user cart ownership tests

\- Cross-user order ownership tests

\- Review authorization tests



\---



\## 14. QA Summary



Person 4's testing work provides automated verification of:



\- Authentication

\- JWT validation

\- Authorization

\- Role-based access

\- Protected API endpoints

\- Catalog endpoints

\- Expected API error responses

\- Swagger security metadata

\- Backend code coverage



Final end-to-end QA should be performed after the complete application is

deployed.

