# Create image
- Navigate to project root folder
- Build the image
```bash
docker buildx build --load -t computerclubsystem/operator-web-app-static-files:dev -f devops/Dockerfile .
```
