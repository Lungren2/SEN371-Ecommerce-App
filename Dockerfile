FROM node:22-alpine AS frontend-build
WORKDIR /src/GrandmastersHub/GrandmastersHub.Api/client

COPY GrandmastersHub/GrandmastersHub.Api/client/package.json GrandmastersHub/GrandmastersHub.Api/client/package-lock.json ./
RUN npm ci
COPY GrandmastersHub/GrandmastersHub.Api/client/ ./
ENV VITE_BASE_PATH=/
ENV VITE_API_BASE_URL=/api/v1
RUN npm run build

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS backend-build
WORKDIR /src
COPY . ./
RUN dotnet restore GrandmastersHub/GrandmastersHub.Api/GrandmastersHub.Api.csproj
RUN dotnet publish GrandmastersHub/GrandmastersHub.Api/GrandmastersHub.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=backend-build /app/publish ./
COPY --from=frontend-build /src/GrandmastersHub/GrandmastersHub.Api/client/dist ./wwwroot

ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 10000
CMD ["sh", "-c", "exec dotnet GrandmastersHub.Api.dll --urls http://0.0.0.0:${PORT:-10000}"]
